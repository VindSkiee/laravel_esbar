import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [nama, setNama] = useState("");
  const [nomorMeja, setNomorMeja] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Nama:", nama);
    console.log("Nomor Meja:", nomorMeja);
  };

  // Helper function to safely load images
  const loadImage = (imageName) => {
    try {
      return require(`../assets/${imageName}`);
    } catch (err) {
      console.warn(`Image ${imageName} not found`);
      return null;
    }
  };

  return (
    <div className="login-container">
      {/* Background Decorations */}
      {loadImage("strawberry.png") && (
        <>
          <div className="decoration decoration-strawberry-top-left">
            <img src={loadImage("strawberry.png")} alt="Strawberry" />
          </div>
          <div className="decoration decoration-strawberry-top-right">
            <img src={loadImage("strawberry.png")} alt="Strawberry" />
          </div>
          <div className="decoration decoration-strawberry-bottom-left">
            <img src={loadImage("strawberry.png")} alt="Strawberry" />
          </div>
        </>
      )}

      {loadImage("mint.png") && (
        <>
          <div className="decoration decoration-mint-top-left">
            <img src={loadImage("mint.png")} alt="Mint" />
          </div>
          <div className="decoration decoration-mint-top-right">
            <img src={loadImage("mint.png")} alt="Mint" />
          </div>
          <div className="decoration decoration-mint-bottom">
            <img src={loadImage("mint.png")} alt="Mint" />
          </div>
        </>
      )}

      {loadImage("blueberry.png") && (
        <div className="decoration decoration-blueberry-bottom">
          <img src={loadImage("blueberry.png")} alt="Blueberry" />
        </div>
      )}

      {loadImage("candy-cane.png") && (
        <div className="decoration decoration-candy-cane">
          <img src={loadImage("candy-cane.png")} alt="Candy Cane" />
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        {/* Ice Cream Image */}
        {loadImage("ice-cream.png") && (
          <div className="ice-cream-image">
            <img src={loadImage("ice-cream.png")} alt="Ice Cream" />
          </div>
        )}

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
            <input
              type="text"
              id="nomorMeja"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Pesan Sekarang!
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
