import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/products.jsx";
import Cart from "./pages/cart.jsx";
import Checkout from "./pages/checkout.jsx";
import Orders from "./pages/orders.jsx";
import Admin from "./pages/admin.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import About from "./pages/about.jsx";

/* Error Boundary */
import { useState } from "react";

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  return error ? (
    <main style={{ padding: 24, color: "#b91c1c" }} dir="rtl">
      <h2>حدث خطأ غير متوقع</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{String(error)}</pre>
      <a className="btn" href="/">رجوع للرئيسية</a>
    </main>
  ) : (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  );
}

function ErrorCatcher({ children, onError }) {
  try {
    return children;
  } catch (e) {
    onError(e);
    return null;
  }
}

/* App Component */
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}