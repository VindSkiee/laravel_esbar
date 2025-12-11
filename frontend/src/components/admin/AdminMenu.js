import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/config";
import ImageCropper from "./ImageCropper";
import "./Admin.css";

const AdminMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Ice Cream",
    price: "",
    status: "Tersedia",
    description: "",
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    const ok = sessionStorage.getItem("adminLoggedIn") === "1";
    if (!ok) navigate("/admin");
    if (location.state?.openForm) {
      setShowForm(true);
    }
  }, [navigate, location.state]);

  // Fetch menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setError("");
        const response = await api.get("/admin/menus");
        const data = response.data.data || response.data;
        setMenus(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching menus:", err);
        setError(err?.response?.data?.message || "Gagal memuat menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Ice Cream",
      price: "",
      status: "Tersedia",
      description: "",
      image: null,
      imagePreview: null,
    });
    setShowForm(true);
  };

  const handleEditClick = (menu) => {
    setEditingId(menu.id);
    setFormData({
      name: menu.name,
      category: menu.category,
      price: menu.price,
      status: menu.status || "Tersedia",
      description: menu.description || "",
      image: null,
      imagePreview: menu.image || null,
    });
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setShowCropper(true);
    }
  };

  const handleCropComplete = (croppedFile) => {
    setFormData({
      ...formData,
      image: croppedFile,
      imagePreview: URL.createObjectURL(croppedFile),
    });
    setShowCropper(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
    }
    setTempImageUrl(null);
  };

  const handleCropCancel = () => {
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
    }
    setShowCropper(false);
    setTempImageUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category);
      submitData.append("price", formData.price);
      submitData.append("status", formData.status);
      submitData.append("description", formData.description);
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      if (editingId) {
        // Update menu - gunakan POST dengan _method untuk multipart/form-data
        submitData.append("_method", "PUT");
        await api.post(`/admin/menus/${editingId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMenus((prev) =>
          prev.map((m) =>
            m.id === editingId
              ? { ...m, ...formData, price: parseFloat(formData.price) }
              : m
          )
        );
      } else {
        // Create menu
        const response = await api.post("/admin/menus", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newMenu = response.data.data || response.data;
        setMenus([...menus, newMenu]);
      }
      setShowForm(false);
      setFormData({
        name: "",
        category: "Ice Cream",
        price: "",
        status: "Tersedia",
        description: "",
        image: null,
        imagePreview: null,
      });
      // Refresh menu list
      const response = await api.get("/admin/menus");
      const data = response.data.data || response.data;
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error saving menu:", err);
      setError(err?.response?.data?.message || "Gagal menyimpan menu");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus menu ini?")) {
      try {
        await api.delete(`/admin/menus/${id}`);
        setMenus((prev) => prev.filter((m) => m.id !== id));
        const response = await api.get("/admin/menus");
        const data = response.data.data || response.data;
        setMenus(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error deleting menu:", err);
        setError(err?.response?.data?.message || "Gagal menghapus menu");
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
          <button className="side-btn active">Menu</button>
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
            <h2>Menu</h2>
            <p className="muted">Kelola daftar menu & gambar</p>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="🔍 Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                minWidth: "200px",
                fontSize: "14px"
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="chip"
              style={{ minWidth: "160px" }}
            >
              <option value="">Semua Kategori</option>
              <option value="Ice Cream">🍦 Ice Cream</option>
              <option value="Makanan">🍕 Makanan</option>
              <option value="Minuman">☕ Minuman</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="chip"
              style={{ minWidth: "140px" }}
            >
              <option value="">Semua Status</option>
              <option value="Tersedia">✅ Tersedia</option>
              <option value="Habis">❌ Habis</option>
            </select>
            <button className="chip" onClick={handleAddClick}>
              ➕ Tambah Produk
            </button>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        {showForm && (
          <div className="panel">
            <h4>{editingId ? "Edit Menu" : "Tambah Menu Baru"}</h4>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <input
                  type="text"
                  placeholder="Nama Menu"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>

              <div>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="Ice Cream">Ice Cream</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label className="input-label">Harga</label>
                  <input
                    type="number"
                    placeholder="Contoh: 12000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-col">
                  <label className="input-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Habis">Habis</option>
                  </select>
                </div>
              </div>

              <div className="image-upload-section">
                <label className="image-upload-label">Gambar Produk</label>
                {formData.imagePreview ? (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid #ddd",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        margin: "12px auto",
                        position: "relative",
                      }}
                    >
                      <img
                        src={
                          formData.imagePreview.startsWith("blob")
                            ? formData.imagePreview
                            : `http://127.0.0.1:8000${formData.imagePreview}`
                        }
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTempImageUrl(formData.imagePreview);
                          setShowCropper(true);
                        }}
                        style={{
                          padding: "10px 20px",
                          background: "#4CAF50",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginTop: "10px",
                        }}
                      >
                        ✂️ Crop Ulang
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("imageInput").click()
                        }
                        style={{
                          padding: "10px 20px",
                          background: "#ff3d3d",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginTop: "10px",
                        }}
                      >
                        📷 Ganti Gambar
                      </button>
                    </div>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("imageInput").click()
                      }
                      style={{
                        padding: "15px 30px",
                        background: "#f0f0f0",
                        color: "#333",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "15px",
                      }}
                    >
                      📁 Pilih Gambar
                    </button>
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "10px",
                      }}
                    >
                      Gambar akan dipangkas bulat otomatis
                    </p>
                  </div>
                )}
              </div>

              <div>
                <textarea
                  placeholder="Deskripsi (opsional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="form-input"
                  style={{ minHeight: "100px", resize: "vertical" }}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="edit-btn">
                  {editingId ? "Update Menu" : "Simpan Menu"}
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Memuat menu...</p>
        ) : (
          <div className="menu-grid">
            {menus
              .filter((m) => {
                // Filter by category
                if (filterCategory && m.category !== filterCategory) return false;
                // Filter by status
                if (filterStatus && m.status !== filterStatus) return false;
                // Filter by search term
                if (searchTerm) {
                  const search = searchTerm.toLowerCase();
                  const name = (m.name || "").toLowerCase();
                  const category = (m.category || "").toLowerCase();
                  const description = (m.description || "").toLowerCase();
                  return name.includes(search) || category.includes(search) || description.includes(search);
                }
                return true;
              })
              .map((m) => {
                const isOutOfStock = m.status === "Habis";
                return (
                  <div
                    key={m.id}
                    className={`menu-card ${isOutOfStock ? "soldout" : ""}`}
                  >
                    <div className={`badge ${isOutOfStock ? "grey" : "green"}`}>
                      {m.status || "Tersedia"}
                    </div>
                    <div className="menu-thumb" style={{ overflow: "hidden" }}>
                      {m.image ? (
                        <img
                          src={`http://127.0.0.1:8000${m.image}`}
                          alt={m.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: isOutOfStock ? "grayscale(100%)" : "none",
                            opacity: isOutOfStock ? 0.6 : 1,
                          }}
                        />
                      ) : null}
                    </div>
                    <div className="menu-name">{m.name}</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      {m.category}
                    </div>
                    <div className="menu-price">
                      RP {(m.price || 0).toLocaleString("id-ID")}
                    </div>
                    <div className="menu-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(m)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(m.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default AdminMenu;
