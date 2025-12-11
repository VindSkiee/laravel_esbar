import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/config";
import "./PaymentPage.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.orderId) {
      navigate("/cart");
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, tracking, total, qr } = state;

  const confirmPayment = async () => {
    try {
      setProcessing(true);
      setError("");
      await api.post(`/payment/test-confirm/${orderId}`);
      navigate("/checkout/success", {
        state: { orderId, tracking, total },
      });
    } catch (err) {
      console.error("Confirm payment error:", err);
      setError(err?.response?.data?.message || "Gagal konfirmasi pembayaran");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="card">
        <div className="label">Pembayaran Sandbox</div>
        <h1>Scan untuk Membayar</h1>
        <p>Gunakan QR di bawah untuk simulasi pembayaran.</p>

        {qr ? (
          <img src={qr} alt="QR Pembayaran" />
        ) : (
          <div className="alert">QR tidak tersedia</div>
        )}

        <div className="info">
          <div>
            <span>ID Pesanan</span>
            <b>#{orderId}</b>
          </div>
          <div>
            <span>Total Bayar</span>
            <b>Rp {(total || 0).toLocaleString("id-ID")}</b>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="actions">
          <button
            className="ghost"
            onClick={() => navigate("/cart")}
            disabled={processing}
          >
            Kembali ke Keranjang
          </button>
          <button onClick={confirmPayment} disabled={processing}>
            {processing ? "Memproses..." : "Sudah Bayar (Simulasi)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
