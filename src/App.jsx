import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

import AuthContext from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Product from "./pages/Products";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <AuthContext.Provider value={token}>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Product />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;