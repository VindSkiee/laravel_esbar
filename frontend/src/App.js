import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Catalog from "./components/Catalog";
import Cart from "./components/Cart";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminMenu from "./components/admin/AdminMenu";
import AdminHistory from "./components/admin/AdminHistory";
import AdminTable from "./components/admin/AdminTable";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentPage from "./components/PaymentPage";
import Invoice from "./components/Invoice";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/history" element={<AdminHistory />} />
          <Route path="/admin/tables" element={<AdminTable />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/checkout/success" element={<PaymentSuccess />} />
          <Route path="/invoice/:orderId" element={<Invoice />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
