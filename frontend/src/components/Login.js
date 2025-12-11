import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import "./Login.css";

const Login = () => {
  const [nama, setNama] = useState("");
  const [nomorMeja, setNomorMeja] = useState("");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadTables = async () => {
      try {
        const res = await api.get("/table/list");
        console.log("Tables from API:", res.data); // Debug log
        const data = res.data;
        setTables(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load tables error:", err);
      }
    };
    loadTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("=== LOGIN DEBUG START ===");
    console.log("Nama:", nama);
    console.log("Nomor Meja:", nomorMeja);

    if (!nama.trim()) {
      console.log("ERROR: Nama kosong");
      setError("Nama wajib diisi");
      return;
    }

    if (!nomorMeja) {
      console.log("ERROR: Meja belum dipilih");
      setError("Pilih nomor meja terlebih dahulu");
      return;
    }

    const parsedTable = parseInt(nomorMeja, 10);
    console.log("Parsed Table ID:", parsedTable);

    try {
      setLoading(true);

      // Cari data meja yang dipilih
      const selectedTable = tables.find((t) => t.id === parsedTable);
      console.log("Selected Table:", selectedTable);

      const tableName = selectedTable
        ? selectedTable.name
        : `Meja ${parsedTable}`;
      console.log("Table Name:", tableName);

      // Set table session on the backend
      console.log("Mengirim POST /table/set...");
      const resp = await api.post("/table/set", {
        table_id: parsedTable,
        table_name: tableName,
      });
      console.log("Response dari /table/set:", resp.data);

      const tableId = resp.data?.table?.id || parsedTable;
      console.log("Final Table ID:", tableId);

      // Clear cart untuk user baru di meja ini
      try {
        await api.delete("/cart/clear", {
          data: { table_id: parseInt(tableId, 10) },
        });
        console.log("Cart cleared untuk user baru");
      } catch (clearErr) {
        console.error("Failed to clear cart:", clearErr);
        // Continue anyway - tidak critical
      }

      // Persist for later pages
      sessionStorage.setItem("customer_name", nama);
      sessionStorage.setItem("table_id", String(tableId));
      console.log("SessionStorage disimpan:");
      console.log(
        "  - customer_name:",
        sessionStorage.getItem("customer_name")
      );
      console.log("  - table_id:", sessionStorage.getItem("table_id"));

      console.log("Navigating to /catalog...");
      console.log("=== LOGIN DEBUG END ===");
      navigate("/catalog", { state: { nama, nomorMeja: tableId } });
    } catch (err) {
      console.error("Login/set table ERROR:", err);
      console.error("Error response:", err.response);
      setError(
        err?.response?.data?.message || "Gagal login. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely load images
  const loadImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      // Try SVG version
      const svgName = imageName.replace(".png", ".svg");
      try {
        return require(`../assets/${svgName}`);
      } catch (svgErr) {
        console.warn(
          `Image ${imageName} not found. Please add it to src/assets/`
        );
        return null;
      }
    }
  };

  return (
    <div className="login-container">
      {/* Background Decorations - ONLY strawberry left and mint right */}
      {loadImage("strawberry.png") && (
        <div className="decoration decoration-strawberry-top-left">
          <img src={loadImage("strawberry.png")} alt="Strawberry" />
        </div>
      )}

      {loadImage("mint.png") && (
        <div className="decoration decoration-mint-top-right">
          <img src={loadImage("mint.png")} alt="Mint" />
        </div>
      )}

      {/* Ice Cream Image - OUTSIDE the card, in red background */}
      {loadImage("ice-cream.png") && (
        <div className="ice-cream-image">
          <img src={loadImage("ice-cream.png")} alt="Ice Cream" />
        </div>
      )}

      {/* Login Card - Below ice cream */}
      <div className="login-card">
        {/* Logo and Title */}
        <div className="logo-section">
          <div className="logo-box">
            <div className="logo-text">
              <span className="es-text">ES BAR 79</span>
              <span className="subtitle">ICE CREAM & COFFEE</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nama">Nama</label>
            <input
              type="text"
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nomorMeja">Nomor Meja</label>
            <select
              id="nomorMeja"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #ff4444",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "#333",
              }}
            >
              <option value="">-- Pilih Meja --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Memproses..." : "Pesan Sekarang!"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
