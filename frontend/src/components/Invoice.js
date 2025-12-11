import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../api/config";
import "./Invoice.css";

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const invoiceRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Check if this is admin view (from admin history)
  const isAdminView = location.state?.fromAdmin || false;

  useEffect(() => {
    const fetchOrder = async () => {
      console.log("=== INVOICE DEBUG START ===");
      console.log("Order ID dari URL:", orderId);
      console.log("Is Admin View:", isAdminView);

      try {
        // Try to get specific order first (works for both admin and user)
        let response;
        let orders = [];

        try {
          // Try admin endpoint if this is admin view
          if (isAdminView) {
            console.log("Mencoba admin endpoint (admin view)...");
            response = await api.get(`/admin/orders/all`);
            orders = response.data.data || response.data;
          } else {
            // For regular users, try to get all orders and filter
            console.log("Mencoba admin endpoint (user view)...");
            response = await api.get(`/admin/orders/all`);
            orders = response.data.data || response.data;
          }
          console.log("Berhasil! Total orders dari admin:", orders.length);
          console.log("Orders:", orders);
        } catch (adminErr) {
          // If admin endpoint fails, try to get from order history
          console.log("Admin endpoint GAGAL:", adminErr.message);
          console.log("Mencoba order history...");
          try {
            const tableId = sessionStorage.getItem("table_id");
            console.log("Table ID dari session:", tableId);
            if (tableId) {
              response = await api.get(`/order/history?table_id=${tableId}`);
              orders = response.data.data || response.data || [];
              console.log(
                "Berhasil dari history! Total orders:",
                orders.length
              );
              console.log("Orders dari history:", orders);
            } else {
              console.log("Tidak ada table_id di sessionStorage!");
            }
          } catch (historyErr) {
            console.error("Order history juga GAGAL:", historyErr);
          }
        }

        console.log("Mencari order ID:", parseInt(orderId));
        console.log("Dari total orders:", orders.length);

        // Get the main order
        const mainOrder = orders.find((o) => o.id === parseInt(orderId));
        console.log("Main order ditemukan:", mainOrder);

        if (!mainOrder) {
          console.log("ORDER TIDAK DITEMUKAN!");
          console.log(
            "Available order IDs:",
            orders.map((o) => o.id)
          );
          setLoading(false);
          return;
        }

        console.log("Main order ditemukan:", mainOrder);

        // Find all orders from same customer and table
        const relatedOrders = orders.filter(
          (o) =>
            o.customer_name === mainOrder.customer_name &&
            (o.table_id === mainOrder.table_id ||
              o.Table?.id === mainOrder.Table?.id) &&
            Math.abs(new Date(o.createdAt) - new Date(mainOrder.createdAt)) <
              3600000 // Within 1 hour
        );

        console.log("Related orders:", relatedOrders.length);

        // Combine all items
        const allItems = [];
        let totalAmount = 0;

        relatedOrders.forEach((ord) => {
          const items = (ord.OrderItems || ord.items || []).map((it) => ({
            name: it.Menu?.name || it.name || it.menu_name,
            quantity: it.quantity || it.qty,
            price: it.Menu?.price || it.price || 0,
          }));
          allItems.push(...items);
          totalAmount += ord.total || 0;
        });

        console.log("Total items:", allItems.length);
        console.log("Total amount:", totalAmount);

        const finalOrder = {
          ...mainOrder,
          table_name: mainOrder.Table?.name || mainOrder.table_name || "",
          items: allItems,
          total: totalAmount,
          invoiceNumbers: relatedOrders.map((o) => o.id),
        };

        console.log("Final order object:", finalOrder);
        setOrder(finalOrder);
        console.log("=== INVOICE DEBUG END ===");
      } catch (err) {
        console.error("ERROR FATAL:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, isAdminView]);

  const handleScreenshot = async () => {
    try {
      if (!invoiceRef.current) {
        alert("Invoice tidak ditemukan");
        return;
      }

      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default;

      // Capture invoice only
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // High quality
        logging: false,
        useCORS: true,
      });

      // Convert to image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Invoice-${orderId}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          alert("Screenshot invoice berhasil disimpan!");
        }
      }, "image/png");
    } catch (error) {
      console.error("Screenshot error:", error);
      alert(
        "Gagal screenshot. Silakan screenshot manual dengan tombol power + volume down di HP."
      );
    }
  };

  const handlePrint = () => {
    try {
      if (isAdminView) {
        // Admin: Download as PDF
        console.log("Admin: Downloading PDF...");
        window.print();
      } else {
        // User: Print langsung (foto/gambar)
        console.log("User: Printing invoice...");

        // Check if print dialog opens
        const printSupported = window.matchMedia("print").matches !== undefined;

        if (!printSupported) {
          alert(
            "Cetak tidak didukung. Silakan screenshot halaman ini atau gunakan browser lain."
          );
          return;
        }

        window.print();
      }
    } catch (error) {
      console.error("Print error:", error);
      alert(
        "Gagal mencetak. Silakan:\n1. Klik 'Izinkan' pada popup\n2. Atau screenshot halaman ini\n3. Atau tekan Ctrl+P untuk cetak manual"
      );
    }
  };

  const handleOrderAgain = () => {
    navigate("/catalog", {
      state: {
        nomorMeja: order.table_id,
        nama: order.customer_name,
      },
    });
  };

  if (loading) {
    return <div className="invoice-container">Memuat invoice...</div>;
  }

  if (!order) {
    return (
      <div className="invoice-container">
        <p>Pesanan tidak ditemukan</p>
        <button className="back-btn" onClick={() => navigate("/")}>
          Kembali ke Login
        </button>
      </div>
    );
  }

  const date = new Date(order.createdAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}.${minutes}`;

  // Get table info
  const tableName =
    order.Table?.name ||
    order.table_name ||
    `Meja ${order.table_id}` ||
    "No.D-13";
  const customerName = order.customer_name || "Pelanggan";
  const invoiceNums = order.invoiceNumbers || [order.id];
  const invoiceStr = invoiceNums
    .map((id) => String(id).padStart(2, "0"))
    .join(", ");

  return (
    <div className="invoice-wrapper">
      <div className="invoice-actions no-print">
        {isAdminView ? (
          <>
            <button
              className="back-btn"
              onClick={() => navigate("/admin/history")}
            >
              ← Kembali
            </button>
            <button className="print-btn" onClick={handlePrint}>
              📥 Download PDF
            </button>
          </>
        ) : (
          <>
            <button className="order-again-btn" onClick={handleOrderAgain}>
              🛒 Pesan Lagi
            </button>
            <button className="print-btn" onClick={handleScreenshot}>
              🖨️ Cetak Invoice
            </button>
          </>
        )}
      </div>

      <div className="invoice-container">
        <div className="invoice-paper" ref={invoiceRef}>
          {/* Header */}
          <div className="invoice-header">
            <div className="store-logo">
              <div className="logo-box">
                <div className="logo-title">ES BAR 79</div>
                <div className="logo-subtitle">ICE CREAM & COFFEE</div>
              </div>
            </div>
            <div className="store-address">Jl. Kapten Halim, Lebakanyar</div>
            <div className="store-address">Purwakarta, Jawa Barat 41172</div>
          </div>

          <div className="invoice-divider"></div>

          {/* Order Info */}
          <div className="invoice-info">
            <div className="info-row">
              <span>{dateStr}</span>
            </div>
            <div className="info-row">
              <span>{timeStr}</span>
              <span className="right">{customerName}</span>
            </div>
            <div className="info-row">
              <span>{tableName}</span>
              <span className="right">INV: {invoiceStr}</span>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Items */}
          <div className="invoice-items">
            <div className="items-title">{customerName}</div>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div className="item-group" key={idx}>
                  <div className="item-line">
                    {item.quantity} x {item.price.toLocaleString("id-ID")}
                  </div>
                  <div className="item-line indent">{item.name}</div>
                  <div className="item-line right-align">
                    Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            ) : (
              <div className="item-line">Tidak ada item</div>
            )}
          </div>

          <div className="invoice-divider"></div>

          {/* Totals */}
          <div className="invoice-totals">
            <div className="total-row">
              <span>Total</span>
              <span>Rp {(order.total || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="total-row">
              <span>Bayar</span>
              <span>Rp {(order.total || 0).toLocaleString("id-ID")}</span>
            </div>
            <div className="total-row">
              <span>Kembali</span>
              <span>Rp 0</span>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Footer */}
          <div className="invoice-footer">
            <div className="app-logo">ES BAR 79</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
