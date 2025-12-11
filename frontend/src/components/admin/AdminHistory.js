import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import "./Admin.css";

const AdminHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const ok = sessionStorage.getItem("adminLoggedIn") === "1";
    if (!ok) navigate("/admin");
  }, [navigate]);

  // Fetch order history with auto-refresh
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/admin/orders/all");
        const data = response.data.data || response.data;
        const normalized = (Array.isArray(data) ? data : [])
          .map((o) => ({
            ...o,
            table_name: o.Table?.name || o.table_name || "",
            items: (o.OrderItems || o.items || []).map((it) => ({
              name: it.Menu?.name || it.name || it.menu_name,
              quantity: it.quantity || it.qty,
              image: it.Menu?.image || it.image || null,
            })),
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllOrders(normalized);

        // Apply search filter if active
        if (searchDate) {
          const filtered = normalized.filter((order) => {
            const orderDate = new Date(order.createdAt);
            const searchDateObj = new Date(searchDate);
            return orderDate.toDateString() === searchDateObj.toDateString();
          });
          setOrders(filtered);
        } else {
          setOrders(normalized);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Auto-refresh every 15 seconds for real-time stats
    const interval = setInterval(fetchHistory, 15000);

    return () => clearInterval(interval);
  }, [searchDate]);

  const handlePrintPDF = () => {
    window.print();
  };

  // Calculate statistics based on search date or today
  const getStats = () => {
    let targetDate;

    if (searchDate) {
      // Jika ada pencarian tanggal, gunakan tanggal tersebut
      targetDate = new Date(searchDate);
      targetDate.setHours(0, 0, 0, 0);
    } else {
      // Jika tidak ada pencarian, gunakan hari ini
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    const filteredOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === targetDate.getTime();
    });

    // Total penjualan
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    // Total item terjual
    let totalItemsSold = 0;
    const productCounts = {};

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const quantity = item.quantity || 0;
        totalItemsSold += quantity;

        const name = item.name || item.menu_name;
        if (name) {
          productCounts[name] = (productCounts[name] || 0) + quantity;
        }
      });
    });

    const topProduct = Object.entries(productCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      hasOrders: filteredOrders.length > 0,
      totalSales,
      totalItemsSold,
      topProduct: topProduct
        ? { name: topProduct[0], count: topProduct[1] }
        : null,
    };
  };

  const stats = getStats();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand-pill big">
          ES BAR 79
          <span className="brand-sub">ICE CREAM & COFFEE</span>
        </div>
        <div className="admin-meta">
          {sessionStorage.getItem("adminName") || "Admin"}
        </div>
        <div className="side-nav">
          <button
            className="side-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            Pesanan
          </button>
          <button className="side-btn" onClick={() => navigate("/admin/menu")}>
            Menu
          </button>
          <button className="side-btn active">Riwayat Pesanan</button>
          <button
            className="side-btn"
            onClick={() => navigate("/admin/tables")}
          >
            Kelola Meja
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="page-header">
          <div>
            <h2>Riwayat Pesanan</h2>
            <p className="muted">{orders.length} pesanan ditemukan</p>
          </div>
        </div>

        {/* Daily Sales Report */}
        {stats.hasOrders && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                padding: "20px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 15px rgba(44, 62, 80, 0.3)",
                transition: "transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  marginBottom: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Total Penjualan
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  letterSpacing: "-1px",
                }}
              >
                Rp
                {stats.totalSales
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #ff3d3d 0%, #e74c3c 100%)",
                padding: "20px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 15px rgba(255, 61, 61, 0.3)",
                transition: "transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  marginBottom: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Jumlah Terjual
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  letterSpacing: "-1px",
                }}
              >
                {stats.totalItemsSold}
              </div>
              <div
                style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px" }}
              >
                item terjual
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                padding: "20px",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 15px rgba(243, 156, 18, 0.3)",
                transition: "transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  marginBottom: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Produk Terlaris
              </div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "900",
                  lineHeight: 1.4,
                  letterSpacing: "0.3px",
                }}
              >
                {stats.topProduct
                  ? `${stats.topProduct.name}`
                  : "Belum ada data"}
              </div>
              {stats.topProduct && (
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.85,
                    marginTop: "6px",
                    fontWeight: "600",
                  }}
                >
                  {stats.topProduct.count} terjual
                </div>
              )}
            </div>
          </div>
        )}

        <div className="history-filters">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => {
              setSearchDate(e.target.value);
              if (e.target.value) {
                const filtered = allOrders.filter((order) => {
                  const orderDate = new Date(order.createdAt);
                  const searchDateObj = new Date(e.target.value);
                  return (
                    orderDate.toDateString() === searchDateObj.toDateString()
                  );
                });
                setOrders(filtered);
              } else {
                setOrders(allOrders);
              }
            }}
          />
          <button className="btn" onClick={handlePrintPDF}>
            Cetak PDF
          </button>
        </div>

        {loading ? (
          <p>Memuat riwayat pesanan...</p>
        ) : orders.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
            Tidak ada riwayat pesanan
          </div>
        ) : (
          orders
            .reduce((groups, order) => {
              const date = new Date(order.createdAt);
              const dateStr = date.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              const existingGroup = groups.find((g) => g.dateTitle === dateStr);
              if (existingGroup) {
                existingGroup.rows.push(order);
              } else {
                groups.push({ dateTitle: dateStr, rows: [order] });
              }
              return groups;
            }, [])
            .map((g, idx) => (
              <div className="history-group" key={idx}>
                <div className="date-title">{g.dateTitle}</div>
                {/* Group orders by customer and table */}
                {g.rows
                  .reduce((merged, order) => {
                    const key = `${order.customer_name || "Tanpa Nama"}_${
                      order.table_id || order.Table?.id
                    }`;
                    const existing = merged.find((m) => m.key === key);

                    if (existing) {
                      // Merge orders
                      existing.orders.push(order);
                      existing.totalAmount += order.total || 0;
                      existing.items.push(...(order.items || []));
                    } else {
                      merged.push({
                        key,
                        customer_name: order.customer_name,
                        table_name: order.table_name,
                        table_id: order.table_id,
                        orders: [order],
                        totalAmount: order.total || 0,
                        items: order.items || [],
                        status: order.status,
                        createdAt: order.createdAt,
                      });
                    }
                    return merged;
                  }, [])
                  .map((mergedOrder, i) => {
                    const time = new Date(
                      mergedOrder.createdAt
                    ).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const invoiceNumbers = mergedOrder.orders
                      .map((o) => String(o.id).padStart(2, "0"))
                      .join(", ");

                    return (
                      <div className="history-row" key={i}>
                        <div className="history-main">
                          <div className="history-header">
                            <div className="history-left">
                              <span className="inv-badge-primary">
                                INV #{invoiceNumbers}
                              </span>
                              <span className="customer-badge">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                {mergedOrder.customer_name || "Tanpa Nama"}
                              </span>
                              <span className="table-badge-history">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                  />
                                </svg>
                                {mergedOrder.table_name ||
                                  `Meja ${mergedOrder.table_id}`}
                              </span>
                              <span className="time-badge">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                {time}
                              </span>
                            </div>
                            <div className="history-right">
                              <div className="order-total-history">
                                Rp
                                {mergedOrder.totalAmount
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                              </div>
                              {mergedOrder.status === "Selesai" && (
                                <span className="status-badge success">
                                  Selesai
                                </span>
                              )}
                              {mergedOrder.status === "Menunggu Pembayaran" && (
                                <span className="status-badge pending">
                                  Menunggu Pembayaran
                                </span>
                              )}
                              {mergedOrder.status === "Sedang Disiapkan" && (
                                <span className="status-badge process">
                                  Sedang Disiapkan
                                </span>
                              )}
                              {mergedOrder.status === "Dibatalkan" && (
                                <span className="status-badge canceled">
                                  Dibatalkan
                                </span>
                              )}
                              {!mergedOrder.status && (
                                <span className="status-badge process">
                                  Proses
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="history-items">
                            {mergedOrder.items.map((it, idx) => (
                              <div className="history-item" key={idx}>
                                {it.image && (
                                  <img
                                    src={`http://127.0.0.1:8000${it.image}`}
                                    alt={it.name}
                                    className="history-item-image"
                                  />
                                )}
                                <div className="history-item-details">
                                  <div className="history-item-name">
                                    {it.name || "Item"}
                                  </div>
                                  <div className="history-item-qty">
                                    Qty: {it.quantity}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="history-footer">
                            <button
                              className="invoice-btn"
                              onClick={() =>
                                navigate(
                                  `/invoice/${mergedOrder.orders[0].id}`,
                                  { state: { fromAdmin: true } }
                                )
                              }
                            >
                              Lihat Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))
        )}
      </main>
    </div>
  );
};

export default AdminHistory;
