import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/config";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  // Security: Redirect if accessed without proper state
  useEffect(() => {
    if (!orderId || !location.state) {
      console.warn("Unauthorized access to checkout success page");
      navigate("/catalog", { replace: true });
    }
  }, [orderId, location.state, navigate]);

  // Clear cart setelah checkout berhasil
  useEffect(() => {
    const clearCartAfterCheckout = async () => {
      console.log("=== PAYMENT SUCCESS - CLEAR CART DEBUG ===");
      const tableId = sessionStorage.getItem("table_id");
      console.log("Table ID dari session:", tableId);
      console.log("Order ID:", orderId);

      if (tableId && orderId) {
        try {
          console.log("Mengirim DELETE /cart/clear...");
          const response = await api.delete("/cart/clear", {
            data: { table_id: parseInt(tableId, 10) },
          });
          console.log("Cart cleared BERHASIL!");
          console.log("Response:", response.data);
        } catch (err) {
          console.error("Failed to clear cart ERROR:", err);
          console.error("Error response:", err.response);
        }
      } else {
        console.log("Tidak clear cart - tableId atau orderId kosong");
      }
      console.log("=== PAYMENT SUCCESS DEBUG END ===");
    };

    clearCartAfterCheckout();
  }, [orderId]);

  // Don't render if no order data
  if (!orderId) {
    return null;
  }

  return (
    <div className="pay-success">
      <div className="card">
        <div className="icon">✅</div>
        <h1>Pesanan Berhasil</h1>
        <p>Pembayaran sudah diterima. Pesanan Anda segera diproses.</p>
        <div className="detail">
          <div>
            <span>ID Pesanan</span>
            <b>#{orderId || "-"}</b>
          </div>
          <div>
            <span>Total Bayar</span>
            <b>Rp {(total || 0).toLocaleString("id-ID")}</b>
          </div>
        </div>
        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/catalog")}>
            Pesan Lagi
          </button>
          {orderId && (
            <button
              className="btn-secondary"
              onClick={() => navigate(`/invoice/${orderId}`)}
            >
              Cetak Detail Pemesanan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
