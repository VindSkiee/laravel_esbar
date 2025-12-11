import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import "./Admin.css";

const AdminTable = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    const ok = sessionStorage.getItem("adminLoggedIn") === "1";
    if (!ok) navigate("/admin");
  }, [navigate]);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setError("");
      const response = await api.get("/admin/tables");
      const data = response.data?.data || response.data || [];
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError(err?.response?.data?.message || "Gagal memuat meja");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setTableNumber("");
    setShowForm(true);
  };

  const handleEditClick = (table) => {
    setEditingId(table.id);
    // Extract number from "Meja X"
    const num = table.name.replace(/^Meja\s*/i, "");
    setTableNumber(num);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input hanya angka
    if (!/^\d+$/.test(tableNumber)) {
      alert("Nomor meja harus berupa angka saja!");
      return;
    }

    const tableName = `Meja ${tableNumber}`;

    // Cek duplikasi nomor meja
    const isDuplicate = tables.some(
      (t) => t.name === tableName && t.id !== editingId
    );

    if (isDuplicate) {
      alert(`Nomor meja ${tableNumber} sudah ada! Silakan gunakan nomor lain.`);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/admin/tables/${editingId}`, { name: tableName });
      } else {
        await api.post("/admin/tables", { name: tableName });
      }
      setShowForm(false);
      setTableNumber("");
      await fetchTables();
    } catch (err) {
      console.error("Error saving table:", err);
      setError(err?.response?.data?.message || "Gagal menyimpan meja");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus meja ini?")) {
      try {
        await api.delete(`/admin/tables/${id}`);
        await fetchTables();
      } catch (err) {
        console.error("Error deleting table:", err);
        setError(err?.response?.data?.message || "Gagal menghapus meja");
      }
    }
  };

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
          <button
            className="side-btn"
            onClick={() => navigate("/admin/history")}
          >
            Riwayat Pesanan
          </button>
          <button className="side-btn active">Kelola Meja</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="page-header">
          <div>
            <h2>Kelola Meja</h2>
            <p className="muted">Tambah, edit, atau hapus meja</p>
          </div>
          <div className="header-actions">
            <button className="chip" onClick={handleAddClick}>
              Tambah Meja
            </button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        {showForm && (
          <div className="panel">
            <h4>{editingId ? "Edit Meja" : "Tambah Meja Baru"}</h4>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="text"
                placeholder="Nomor Meja (contoh: 1, 2, 3)"
                value={tableNumber}
                onChange={(e) => {
                  // Hanya izinkan angka
                  const value = e.target.value.replace(/\D/g, "");
                  setTableNumber(value);
                }}
                required
                style={{
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#666" }}>
                {tableNumber && `Akan disimpan sebagai: Meja ${tableNumber}`}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="edit-btn" style={{ flex: 1 }}>
                  {editingId ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  style={{ flex: 1 }}
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Memuat meja...</p>
        ) : (
          <div className="menu-grid">
            {tables.length === 0 ? (
              <div className="empty">Belum ada meja</div>
            ) : (
              tables.map((t) => (
                <div key={t.id} className="menu-card">
                  <div className="menu-name">{t.name}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    ID: {t.id}
                  </div>
                  <div className="menu-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTable;
