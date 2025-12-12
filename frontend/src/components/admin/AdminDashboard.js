import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import "./Admin.css";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState("connecting");
  const navigate = useNavigate();
  const echoRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const ok = sessionStorage.getItem("adminLoggedIn") === "1";
    if (!ok) navigate("/admin");
  }, [navigate]);

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get("/admin/orders/all");
      const raw = response.data.data || response.data;
      const normalized = (Array.isArray(raw) ? raw : [])
        .filter((o) => o.status !== "Selesai" && o.status !== "Menunggu Pembayaran")
        .map((o) => ({
          ...o,
          table_name: o.Table?.name || o.table_name || "",
          items: (o.OrderItems || o.items || []).map((it) => ({
            name: it.Menu?.name || it.name || it.menu_name,
            quantity: it.quantity || it.qty,
            image: it.Menu?.image || it.image || null,
          })),
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setOrders(normalized);
      setError("");
      console.log(`✅ Orders fetched: ${normalized.length} orders`);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      if (isInitialMount.current) {
        setError("Gagal memuat pesanan");
      }
    } finally {
      if (isInitialMount.current) {
        setLoading(false);
        isInitialMount.current = false;
      }
    }
  }, []);

  useEffect(() => {
    const ok = sessionStorage.getItem("adminLoggedIn") === "1";
    if (!ok) navigate("/admin");
  }, [navigate]);

  // Initialize Echo and setup listeners - RUN ONLY ONCE
  useEffect(() => {
    let mounted = true;
    
    // Initialize Echo
    if (!echoRef.current) {
      window.Pusher = Pusher;
      Pusher.logToConsole = false;
      
      echoRef.current = new Echo({
        broadcaster: "pusher",
        key: "hkpxtl9nyi8ewzaecyh2",
        wsHost: "127.0.0.1",
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ["ws", "wss"],
        disableStats: true,
        cluster: "mt1",
        encrypted: false,
      });
      console.log("✅ Echo initialized");
    }

    // Fetch initial orders
    if (mounted) {
      fetchOrders();
    }

    // Setup Reverb listeners
    const ordersChannel = echoRef.current.channel("orders");
    
    ordersChannel
      .listen(".order.created", (event) => {
        console.log("🔔 NEW ORDER:", event);
        if (mounted) {
          setNewOrderCount((prev) => prev + 1);
          playNotificationSound();
          fetchOrders();
          setTimeout(() => setNewOrderCount(0), 3000);
        }
      })
      .listen(".order.status.updated", (event) => {
        console.log("🔄 STATUS UPDATE:", event);
        if (mounted) {
          fetchOrders();
        }
      });

    // Connection monitoring
    const handleConnected = () => {
      console.log("✅ Reverb connected");
      if (mounted) setRealtimeStatus("connected");
    };

    const handleDisconnected = () => {
      console.log("⚠️ Reverb disconnected");
      if (mounted) setRealtimeStatus("disconnected");
    };

    echoRef.current.connector.pusher.connection.bind("connected", handleConnected);
    echoRef.current.connector.pusher.connection.bind("disconnected", handleDisconnected);

    // Cleanup - DON'T disconnect Echo, just cleanup listeners
    return () => {
      mounted = false;
      console.log("🔌 Cleanup listeners (keeping Echo connected)");
      if (echoRef.current) {
        echoRef.current.connector.pusher.connection.unbind("connected", handleConnected);
        echoRef.current.connector.pusher.connection.unbind("disconnected", handleDisconnected);
      }
    };
  }, [fetchOrders]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      
      // Resume context if suspended (browser security)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log("🔇 Sound notification blocked by browser");
    }
  };

  const toggleDone = async (group) => {
    try {
      // Mark all orders in the group as done
      const orderIds = group.orders.map((o) => o.id);
      
      for (const orderId of orderIds) {
        await api.put(`/admin/orders/${orderId}/status`, { status: "Selesai" });
      }

      // Update local state - remove all orders from this group
      setOrders((prev) =>
        prev.filter((o) => !orderIds.includes(o.id))
      );

      // Play sound once when marking done
      playNotificationSound();

      // Reduce notification count
      if (newOrderCount > 0) {
        setNewOrderCount((prev) => Math.max(0, prev - orderIds.length));
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Gagal mengupdate status pesanan");
    }
  };

  const adminName = sessionStorage.getItem("adminName") || "Admin";

  const statusBadge = (status) => {
    const label = status || "Menunggu Pembayaran";
    const cls =
      label === "Selesai"
        ? "ok"
        : label === "Sedang Disiapkan"
        ? "proc"
        : label === "Menunggu Pembayaran"
        ? "warn"
        : "muted";
    return <span className={`pill ${cls}`}>{label}</span>;
  };

  const filteredOrders = orders.filter((o) => {
    if (!filterTable.trim()) return true;
    const search = filterTable.trim().toLowerCase();
    const tableId = String(o.table_id || "");
    const tableName = String(o.table_name || "").toLowerCase();
    return tableId.includes(search) || tableName.includes(search);
  });

  // Group orders by customer name and table
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const key = `${order.customer_name || "Tanpa Nama"}_${
      order.table_id || "no-table"
    }`;
    const existing = groups.find((g) => g.key === key);

    if (existing) {
      // Merge orders
      existing.orders.push(order);
      existing.totalAmount += Number(order.total) || 0;
      
      // Merge items with same name
      (order.items || []).forEach((newItem) => {
        const existingItem = existing.items.find(
          (item) => item.name === newItem.name
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          existing.items.push({ ...newItem });
        }
      });
    } else {
      groups.push({
        key,
        customer_name: order.customer_name,
        table_name: order.table_name,
        table_id: order.table_id,
        orders: [order],
        totalAmount: Number(order.total) || 0,
        items: [...(order.items || [])],
        status: order.status,
        createdAt: order.createdAt,
      });
    }
    return groups;
  }, []);

  if (loading) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="brand-pill big">
            ES BAR 79
            <span className="brand-sub">ICE CREAM & COFFEE</span>
          </div>
          <div className="admin-meta">{adminName}</div>
          <div className="side-nav">
            <button className="side-btn active">Pesanan</button>
            <button
              className="side-btn"
              onClick={() => navigate("/admin/menu")}
            >
              Menu
            </button>
            <button
              className="side-btn"
              onClick={() => navigate("/admin/history")}
            >
              Riwayat Pesanan
            </button>
            <button
              className="side-btn"
              onClick={() =>
                navigate("/admin/menu", { state: { openForm: true } })
              }
            >
              Tambah Produk
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Pesanan</h2>
              <p className="muted">Memuat pesanan...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="brand-pill big">
          ES BAR 79
          <span className="brand-sub">ICE CREAM & COFFEE</span>
        </div>
        <div className="admin-meta">{adminName}</div>
        <div className="side-nav">
          <button className="side-btn active">Pesanan</button>
          <button className="side-btn" onClick={() => navigate("/admin/menu")}>
            Menu
          </button>
          <button
            className="side-btn"
            onClick={() => navigate("/admin/history")}
          >
            Riwayat Pesanan
          </button>
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
            <h2>Pesanan Aktif</h2>
            <p className="muted">
              {groupedOrders.length} pesanan aktif saat ini
              {" • "}
              <span style={{ 
                color: realtimeStatus === "connected" ? "#10b981" : realtimeStatus === "connecting" ? "#f59e0b" : "#ef4444",
                fontWeight: 500
              }}>
                {realtimeStatus === "connected" ? "🟢 Real-time Active" : realtimeStatus === "connecting" ? "🟡 Connecting..." : "🔴 Using Fallback"}
              </span>
            </p>
          </div>
          <div className="header-actions">
            {newOrderCount > 0 && (
              <div className="new-order-badge">
                🔔 {newOrderCount} Pesanan Baru!
              </div>
            )}
            <div className="filter-inline">
              <input
                type="text"
                placeholder="Cari Nomor Meja"
                value={filterTable}
                onChange={(e) => {
                  setFilterTable(e.target.value);
                  setNewOrderCount(0); // Reset notif saat search
                }}
              />
              {filterTable && (
                <button className="chip" onClick={() => setFilterTable("")}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        {groupedOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Tidak ada pesanan aktif</div>
            <div className="empty-desc">
              Pesanan baru akan muncul di sini secara otomatis
            </div>
          </div>
        ) : (
          groupedOrders.map((group, idx) => {
            const invoiceNumbers = group.orders
              .map((o) => String(o.id).padStart(2, "0"))
              .join(", ");
            const orderDate = new Date(group.createdAt);
            const orderTime = orderDate.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div className="order-card" key={idx}>
                <div className="order-head">
                  <div className="order-header-row">
                    <div className="order-id-badge">
                      👤 {group.customer_name || "Tanpa Nama"}
                    </div>
                    <div className="table-badge-large">
                      🪑 {group.table_name || `Meja ${group.table_id}` || "-"}
                    </div>
                    <div className="order-time">
                      🕐 {orderTime}
                    </div>
                  </div>

                  <div className="order-customer-row">
                    <div className="order-date">
                      🔖 ID: #{invoiceNumbers}
                    </div>
                    <div className="order-date">
                      📅 {orderDate.toLocaleDateString("id-ID")}
                    </div>
                    {statusBadge(group.status)}
                  </div>
                </div>

                <div className="order-items">
                  {group.items && group.items.length > 0 ? (
                    group.items.map((it, itemIdx) => (
                      <div className="item-pill" key={itemIdx}>
                        {it.image ? (
                          <img
                            src={`http://127.0.0.1:8000/storage/${it.image}`}
                            alt={it.name}
                            className="item-thumb"
                          />
                        ) : (
                          <div className="no-image-placeholder">🍽️</div>
                        )}
                        <div className="info">
                          <div className="name">
                            {it.name || it.menu_name || "Item"}
                          </div>
                          <div className="qty-badge">
                            {it.quantity || it.qty}x
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="muted">Tidak ada item</div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total-section">
                    <span className="total-label">TOTAL BAYAR</span>
                    <span className="total-value">
                      Rp{(group.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {group.status === "Selesai" ? (
                    <button className="status-btn done" disabled>
                      ✓ Pesanan Selesai
                    </button>
                  ) : (
                    <button
                      className="status-btn primary"
                      onClick={() => toggleDone(group)}
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
