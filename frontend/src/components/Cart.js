import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle");

  const tableId = sessionStorage.getItem("table_id");
  const customerName = sessionStorage.getItem("customer_name") || "Pelanggan";

  const mergeCart = (cartData, menuData) => {
    return (cartData || []).map((row) => {
      const menu = (menuData || []).find((m) => m.id === row.menu_id) || {};
      return {
        id: row.menu_id,
        name: menu.name,
        description: menu.description,
        price: menu.price,
        image: menu.image,
        qty: row.quantity,
      };
    });
  };

  const fetchAll = async () => {
    try {
      setError("");
      if (!tableId) {
        navigate("/");
        return;
      }

      await api.post("/table/set", {
        table_id: parseInt(tableId, 10),
        table_name: `Meja ${tableId}`,
      });
      const [menuRes, cartRes] = await Promise.all([
        api.get("/menu"),
        api.get("/cart", { params: { table_id: parseInt(tableId, 10) } }),
      ]);

      const menuData = menuRes.data.data || menuRes.data || [];
      setItems(mergeCart(cartRes.data, menuData));
    } catch (err) {
      console.error("Load cart error:", err);
      setError(err?.response?.data?.message || "Gagal memuat keranjang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (productId, delta) => {
    try {
      const target = items.find((it) => it.id === productId);
      const current = target?.qty || 0;
      const next = Math.max(0, current + delta);

      if (delta > 0) {
        await api.post("/cart/add", { 
          menu_id: productId, 
          quantity: delta,
          table_id: parseInt(tableId, 10)
        });
      } else {
        if (next <= 0) {
          await api.delete("/cart/remove", { 
            data: { 
              menu_id: productId,
              table_id: parseInt(tableId, 10)
            } 
          });
        } else {
          await api.put("/cart/update", { 
            menu_id: productId, 
            quantity: next,
            table_id: parseInt(tableId, 10)
          });
        }
      }

      await fetchAll();
    } catch (err) {
      console.error("Update qty error:", err);
      setError(err?.response?.data?.message || "Gagal mengubah jumlah");
    }
  };

  const handleCheckout = async () => {
    try {
      if (items.length === 0) {
        setError("Keranjang kosong");
        return;
      }

      setError("");
      setPaymentStatus("processing");
      const orderRes = await api.post("/order/create", {
        customer_name: customerName,
        order_type: "dine_in",
        table_id: parseInt(tableId, 10),
      });

      const orderId = orderRes.data?.id;
      const tracking = orderRes.data?.tracking_code;
      const total = orderRes.data?.total;

      // Initiate payment (sandbox) and buka halaman pembayaran
      const payRes = await api.post(`/payment/initiate/${orderId}`);
      const qr = payRes.data?.qr_string;

      navigate("/checkout/payment", {
        state: { orderId, tracking, total, qr },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err?.response?.data?.message || "Gagal membuat pesanan");
      setPaymentStatus("idle");
    }
  };

  const total = useMemo(() => {
    return items.reduce((s, it) => s + (it?.price || 0) * it.qty, 0);
  }, [items]);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Memuat Keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-top">
        <button className="back-btn" onClick={() => navigate("/catalog")}>
          &larr;
        </button>
        <h1>Keranjang Saya</h1>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="cart-list">
        {items.length === 0 && (
          <div className="empty">
            Keranjang kosong. Tambahkan produk dari katalog.
          </div>
        )}

        {items.map((item) => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-left">
              <div className="cart-thumb">
                {item.image ? (
                  <img
                    src={`http://127.0.0.1:8000${item.image}`}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : null}
              </div>
            </div>
            <div className="cart-item-body">
              <div className="cart-item-title">{item.name}</div>
              <div className="cart-item-price">
                Rp {Number(item.price || 0).toLocaleString("id-ID")}
              </div>
            </div>
            <div className="cart-item-actions">
              <button
                className="remove-btn"
                onClick={() => handleQuantityChange(item.id, -item.qty)}
                title="Hapus"
              >
                ✕
              </button>
              <div className="qty-controls">
                <button onClick={() => handleQuantityChange(item.id, -1)}>
                  -
                </button>
                <span>{item.qty}</span>
                <button onClick={() => handleQuantityChange(item.id, 1)}>
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="total">Total Rp {total.toLocaleString("id-ID")}</div>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={paymentStatus === "processing"}
        >
          {paymentStatus === "processing"
            ? "Membuat Pesanan..."
            : "Lanjutkan Pembayaran"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
