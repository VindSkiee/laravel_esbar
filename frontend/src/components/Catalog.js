import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/config";
import "./Catalog.css";

const iconSet = {
  Makanan: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M40.5 6C31.35 6 22.5748 9.63481 16.1048 16.1048C9.63477 22.5748 5.99996 31.35 5.99996 40.5V43.608C4.17587 44.6613 2.66115 46.1761 1.60803 48.0003C0.554909 49.8244 0.000488281 51.8937 0.000488281 54C0.000488281 56.1063 0.554909 58.1756 1.60803 59.9997C2.66115 61.8239 4.17587 63.3387 5.99996 64.392V73.5C5.99996 77.8761 7.73835 82.0729 10.8327 85.1673C13.927 88.2616 18.1239 90 22.5 90H73.5C77.876 90 82.0729 88.2616 85.1672 85.1673C88.2616 82.0729 90 77.8761 90 73.5V64.392C91.824 63.3387 93.3388 61.8239 94.3919 59.9997C95.445 58.1756 95.9994 56.1063 95.9994 54C95.9994 51.8937 95.445 49.8244 94.3919 48.0003C93.3388 46.1761 91.824 44.6613 90 43.608V40.5C90 31.35 86.3651 22.5748 79.8951 16.1048C73.4251 9.63481 64.6499 6 55.5 6H40.5ZM84 51H12C11.2043 51 10.4412 51.3161 9.87864 51.8787C9.31603 52.4413 8.99996 53.2044 8.99996 54C8.99996 54.7956 9.31603 55.5587 9.87864 56.1213C10.4412 56.6839 11.2043 57 12 57H84C84.7956 57 85.5587 56.6839 86.1213 56.1213C86.6839 55.5587 87 54.7956 87 54C87 53.2044 86.6839 52.4413 86.1213 51.8787C85.5587 51.3161 84.7956 51 84 51ZM81 42V40.5C81 33.737 78.3134 27.251 73.5312 22.4688C68.749 17.6866 62.263 15 55.5 15H40.5C33.7369 15 27.2509 17.6866 22.4687 22.4688C17.6866 27.251 15 33.737 15 40.5V42H81ZM66 66H81V73.5C81 77.64 77.64 81 73.5 81H22.5C18.36 81 15 77.64 15 73.5V66H54L60 72L66 66Z"
        fill="currentColor"
      />
    </svg>
  ),
  "Ice Cream": (
    <svg viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M53.7351 28.6329C52.2805 28.3582 50.778 28.4968 49.3982 29.0331C48.0185 29.5693 46.8167 30.4817 45.9293 31.6666M53.7351 28.6329C59.4478 29.6874 62.0635 36.6098 58.6308 41.1666H20.5326C16.739 36.1316 20.4186 28.4999 26.8818 28.4999M53.7351 28.6329C55.613 16.5774 42.3225 19.7219 40.1438 12.4196C39.5611 10.4658 40.0361 8.14142 42.7563 6.33325C34.751 6.33325 29.2188 11.2638 30.3113 16.3874M30.3113 16.3874C30.7325 18.3761 32.1543 20.3964 34.8175 22.1666M30.3113 16.3874C23.1768 19.2058 24.0635 29.9724 31.6445 31.5083M24.7126 59.7486L20.5833 41.1666H58.5833L54.454 59.7486C53.3963 64.5017 52.8706 66.8799 51.1321 68.2732C49.3936 69.6666 46.9616 69.6666 42.0881 69.6666H37.0816C32.2081 69.6666 29.773 69.6666 28.0376 68.2732C26.2991 66.8799 25.7735 64.5049 24.7126 59.7486Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Minuman: (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 32H76"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28.306 36.286C28.2667 35.738 28.3408 35.1878 28.5235 34.6697C28.7062 34.1515 28.9937 33.6766 29.3681 33.2745C29.7424 32.8724 30.1956 32.5517 30.6993 32.3324C31.2031 32.1131 31.7466 32 32.296 32H63.704C64.2532 32 64.7966 32.1131 65.3002 32.3322C65.8038 32.5514 66.2569 32.8719 66.6312 33.2738C67.0055 33.6757 67.2931 34.1504 67.4759 34.6683C67.6588 35.1862 67.733 35.7362 67.694 36.284L64.266 84.284C64.1942 85.2932 63.7426 86.2376 63.0022 86.9271C62.2619 87.6167 61.2877 88 60.276 88H35.724C34.7123 88 33.7382 87.6167 32.9978 86.9271C32.2574 86.2376 31.8058 85.2932 31.734 84.284L28.306 36.286Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M48 20V12C48 10.9391 48.4214 9.92172 49.1716 9.17157C49.9217 8.42143 50.9391 8 52 8H58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M29.444 23.342C29.5997 22.4084 30.0814 21.5602 30.8036 20.9483C31.5257 20.3364 32.4415 20.0004 33.388 20H62.612C63.5589 19.9999 64.4751 20.3357 65.1976 20.9476C65.9202 21.5596 66.4022 22.408 66.558 23.342L68 32H28L29.444 23.342Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  ),
  "Es Krim": (
    <svg viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M53.7351 28.6329C52.2805 28.3582 50.778 28.4968 49.3982 29.0331C48.0185 29.5693 46.8167 30.4817 45.9293 31.6666M53.7351 28.6329C59.4478 29.6874 62.0635 36.6098 58.6308 41.1666H20.5326C16.739 36.1316 20.4186 28.4999 26.8818 28.4999M53.7351 28.6329C55.613 16.5774 42.3225 19.7219 40.1438 12.4196C39.5611 10.4658 40.0361 8.14142 42.7563 6.33325C34.751 6.33325 29.2188 11.2638 30.3113 16.3874M30.3113 16.3874C30.7325 18.3761 32.1543 20.3964 34.8175 22.1666M30.3113 16.3874C23.1768 19.2058 24.0635 29.9724 31.6445 31.5083M24.7126 59.7486L20.5833 41.1666H58.5833L54.454 59.7486C53.3963 64.5017 52.8706 66.8799 51.1321 68.2732C49.3936 69.6666 46.9616 69.6666 42.0881 69.6666H37.0816C32.2081 69.6666 29.773 69.6666 28.0376 68.2732C26.2991 66.8799 25.7735 64.5049 24.7126 59.7486Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Default: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const Catalog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState(
    location.state?.nama ||
      sessionStorage.getItem("customer_name") ||
      "Pelanggan"
  );

  const tableId =
    location.state?.nomorMeja || sessionStorage.getItem("table_id");

  const toCartMap = (items) => {
    return (items || []).reduce((acc, item) => {
      // Convert menu_id to NUMBER to match product.id type
      acc[Number(item.menu_id)] = item.quantity;
      return acc;
    }, {});
  };

  const fetchCart = async () => {
    try {
      console.log("=== FETCH CART DEBUG ===");
      const tableId = sessionStorage.getItem("table_id");
      console.log("Table ID dari session:", tableId);

      const cartRes = await api.get("/cart", {
        params: { table_id: tableId },
      });
      console.log("Response dari /cart:", cartRes.data);

      const cartMap = toCartMap(cartRes.data);
      console.log("Cart Map (converted):", cartMap);
      console.log("Cart Map keys:", Object.keys(cartMap));

      setCart({ ...cartMap });
      console.log("Cart state updated!");
      console.log("=== FETCH CART END ===");
    } catch (err) {
      console.error("Error fetching cart:", err);
      console.error("Error response:", err.response);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setError("");

        // Validate table ID exists
        if (!tableId) {
          console.warn("No table ID found in session");
          navigate("/");
          return;
        }

        // Ensure backend session knows the table - dengan error handling
        try {
          await api.post("/table/set", {
            table_id: parseInt(tableId, 10),
            table_name: `Meja ${tableId}`,
          });
        } catch (setTableErr) {
          console.error("Failed to set table:", setTableErr);
          // Continue anyway - might already be set
        }

        const [menuRes, cartRes] = await Promise.all([
          api.get("/menu"),
          api.get("/cart", { params: { table_id: tableId } }),
        ]);

        if (!isMounted) return;

        const menuData = menuRes.data.data || menuRes.data || [];
        setProducts(Array.isArray(menuData) ? menuData : []);

        // Force new object for React re-render
        const cartMap = toCartMap(cartRes.data);
        setCart({ ...cartMap });

        setCustomerName(
          location.state?.nama ||
            sessionStorage.getItem("customer_name") ||
            "Pelanggan"
        );
      } catch (err) {
        console.error("Init catalog error:", err);
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Gagal memuat data, coba lagi"
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [tableId, location.state, navigate]);

  const handleQuantityChange = async (productId, delta) => {
    console.log("=== HANDLE QUANTITY CHANGE DEBUG ===");
    console.log("Product ID:", productId);
    console.log("Delta:", delta);
    console.log("Current cart:", cart);
    console.log("Current quantity for product:", cart[productId]);

    try {
      if (!tableId) {
        console.error("ERROR: No table ID!");
        alert("Error: Table ID tidak ditemukan. Silakan login ulang.");
        navigate("/");
        return;
      }

      const currentQty = cart[productId] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      console.log("Current qty:", currentQty);
      console.log("Next qty:", nextQty);

      if (delta > 0) {
        console.log("Adding to cart...");
        await api.post("/cart/add", {
          menu_id: productId,
          quantity: delta,
          table_id: parseInt(tableId, 10),
        });
        console.log("ADD berhasil!");

        // Update cart state immediately (optimistic update)
        setCart((prev) => ({
          ...prev,
          [productId]: (prev[productId] || 0) + delta,
        }));
      } else {
        if (nextQty <= 0) {
          console.log("Removing from cart...");
          await api.delete("/cart/remove", {
            data: {
              menu_id: productId,
              table_id: parseInt(tableId, 10),
            },
          });
          console.log("REMOVE berhasil!");

          // Update cart state immediately
          setCart((prev) => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
          });
        } else {
          console.log("Updating cart quantity...");
          await api.put("/cart/update", {
            menu_id: productId,
            quantity: nextQty,
            table_id: parseInt(tableId, 10),
          });
          console.log("UPDATE berhasil!");

          // Update cart state immediately
          setCart((prev) => ({ ...prev, [productId]: nextQty }));
        }
      }

      console.log("Fetching cart untuk sync...");
      await fetchCart();
      console.log("=== HANDLE QUANTITY CHANGE END ===");
    } catch (err) {
      console.error("Cart update ERROR:", err);
      console.error("Error response:", err?.response?.data);

      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengubah keranjang";

      // Rollback optimistic update on error
      console.log("Rolling back, fetching cart...");
      await fetchCart();
      setError(errorMsg);
      alert("Error: " + errorMsg);
    }
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce(
      (sum, qty) => sum + (Number(qty) || 0),
      0
    );
  }, [cart]);

  const totalPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = products.find((p) => p.id === Number(id) || p.id === id);
      return sum + (product?.price || 0) * Number(qty);
    }, 0);
  }, [cart, products]);

  const visibleProducts = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase();
    return (products || [])
      .filter((p) =>
        selectedCategory ? p.category === selectedCategory : true
      )
      .filter((p) => {
        if (!lowerSearch) return true;
        return (
          p.name?.toLowerCase().includes(lowerSearch) ||
          p.description?.toLowerCase().includes(lowerSearch) ||
          p.category?.toLowerCase().includes(lowerSearch)
        );
      });
  }, [products, selectedCategory, searchQuery]);

  const categoryList = useMemo(() => {
    const uniq = Array.from(
      new Set((products || []).map((p) => p.category).filter(Boolean))
    );
    
    // Urutkan: Es Krim, Makanan, Minuman
    const order = ["Es Krim", "Makanan", "Minuman"];
    const sorted = uniq.sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    
    return sorted.map((key) => ({ key, icon: iconSet[key] || iconSet.Default }));
  }, [products]);

  if (error) {
    return (
      <div className="catalog-container">
        <div className="alert">{error}</div>
        <button
          className="cart-summary-btn"
          onClick={() => window.location.reload()}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      {/* Navbar */}
      <nav className="catalog-navbar">
        <div className="navbar-left">
          <div className="logo-container">
            <div className="esbar-logo">
              <div className="esbar-text">ES BAR 79</div>
              <div className="esbar-tagline">ICE CREAM & COFFEE</div>
            </div>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Cari Menu Disini . . ."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="search-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="navbar-right">
          <button
            className="cart-button"
            onClick={() => navigate("/cart")}
            title="Lihat Keranjang"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" fill="white" stroke="none" />
              <circle cx="20" cy="21" r="1" fill="white" stroke="none" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </nav>

      {/* Header Text */}
      <div className="catalog-header">
        <h1>Halo {customerName}! 👋</h1>
        <h2>Temukan Menu Favoritmu</h2>
        <p>Pesan sekarang dan nikmati kelezatan istimewa!</p>
      </div>

      {/* Categories (icons) */}
      <div className="categories-section">
        {categoryList.map((cat) => (
          <div
            key={cat.key}
            className={`category-item ${
              selectedCategory === cat.key ? "active" : ""
            }`}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.key ? "" : cat.key)
            }
            title={cat.key}
          >
            <div className="category-icon" aria-hidden>
              {cat.icon}
            </div>
            <div className="category-label">{cat.key}</div>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {visibleProducts.map((product) => {
          const isOutOfStock = product.status === "Habis";
          return (
            <div
              key={product.id}
              className={`product-card ${isOutOfStock ? "soldout" : ""}`}
            >
              <div className="product-image-container">
                <div className="product-image">
                  {product.image ? (
                    <img
                      src={`${
                        process.env.REACT_APP_API_URL
                          ? process.env.REACT_APP_API_URL.replace("/api", "")
                          : "http://127.0.0.1:8000"
                      }/storage/${product.image}`}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                        filter: isOutOfStock ? "grayscale(100%)" : "none",
                        opacity: isOutOfStock ? 0.5 : 1,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<div class="ice-cream-placeholder"></div>';
                      }}
                    />
                  ) : (
                    <div className="ice-cream-placeholder"></div>
                  )}
                </div>
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-category">{product.category}</p>

                <div className="product-footer">
                  <span className="product-price">
                    RP {product.price.toLocaleString("id-ID")}
                  </span>

                  {isOutOfStock ? (
                    <span className="soldout-badge">Habis</span>
                  ) : (cart[product.id] || cart[String(product.id)]) > 0 ? (
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(product.id, -1)}
                      >
                        −
                      </button>
                      <span className="qty-display">
                        {cart[product.id] || cart[String(product.id)]}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={isOutOfStock}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => handleQuantityChange(product.id, 1)}
                      disabled={isOutOfStock}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      {totalItems > 0 && (
        <div className="cart-summary">
          <span className="cart-summary-text">
            {totalItems} Item | Rp {totalPrice.toLocaleString("id-ID")}
          </span>
          <button
            className="cart-summary-btn"
            onClick={() => navigate("/cart")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
              <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
