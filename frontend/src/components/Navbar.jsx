import { useState, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useCart } from "../context/Cartcontext.jsx";
import { useAuth } from "../context/Authcontext.jsx";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function Navbar() {
  const { items } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const count = useMemo(
    () => items.reduce((s, i) => s + (i.quantity || 0), 0),
    [items]
  );

  const linkCls = ({ isActive }) =>
    cx(
      "px-3 py-2 rounded-md text-sm font-semibold transition hover:text-indigo-700",
      isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-700"
    );

  return (
    <header
      className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b shadow-sm"
      dir="rtl"
      onMouseLeave={() => setAcctOpen(false)}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-l from-indigo-500 via-fuchsia-500 to-sky-500" />

      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-extrabold text-xl text-indigo-700"
            aria-label="الانتقال إلى الصفحة الرئيسية"
          >
            <span className="inline-block w-8 h-8 rounded-lg bg-indigo-600 text-white grid place-items-center shadow">
              FS
            </span>
            FashionStore
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkCls} end>
            الرئيسية
          </NavLink>
          <NavLink to="/products" className={linkCls}>
            المنتجات
          </NavLink>
          <NavLink to="/about" className={linkCls}>
            من نحن
          </NavLink>
          <NavLink to="/orders" className={linkCls}>
            طلباتي
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkCls}>
              لوحة التحكم
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-white hover:bg-indigo-50 transition"
            aria-label="السلة"
          >
            <FaShoppingCart className="text-indigo-700" size={20} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 min-w-[22px] h-5 px-1 rounded-full bg-indigo-600 text-white text-xs grid place-items-center font-bold animate-bounce"
                aria-live="polite"
              >
                {count}
              </span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAcctOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-indigo-50 text-sm font-semibold"
                aria-haspopup="menu"
                aria-expanded={acctOpen}
              >
                <span className="inline-flex w-7 h-7 rounded-full bg-indigo-600 text-white items-center justify-center">
                  {user.email?.[0]?.toUpperCase() || "م"}
                </span>
                {user.email?.split("@")[0] || "حسابي"}
              </button>
              {acctOpen && (
                <div
                  role="menu"
                  className="absolute mt-2 w-48 right-0 bg-white border rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">
                    {user.email}
                  </div>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-indigo-50" role="menuitem">
                    طلباتي
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-indigo-50" role="menuitem">
                      لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-2 rounded-lg border bg-white hover:bg-indigo-50 text-sm font-semibold"
              >
                دخول
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
              >
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="قائمة الجوال"
          aria-expanded={open}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cx(
          "md:hidden overflow-hidden border-t transition-[max-height]",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
          <NavLink to="/" className={linkCls} end onClick={() => setOpen(false)}>
            الرئيسية
          </NavLink>
          <NavLink to="/products" className={linkCls} onClick={() => setOpen(false)}>
            المنتجات
          </NavLink>
          <NavLink to="/about" className={linkCls} onClick={() => setOpen(false)}>
            من نحن
          </NavLink>
          <NavLink to="/orders" className={linkCls} onClick={() => setOpen(false)}>
            طلباتي
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={linkCls} onClick={() => setOpen(false)}>
              لوحة التحكم
            </NavLink>
          )}

          <div className="flex items-center justify-between pt-3">
            {/* Cart (mobile) */}
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white"
              onClick={() => setOpen(false)}
            >
              <FaShoppingCart className="text-indigo-700" />
              <span>السلة</span>
              {count > 0 && (
                <span className="ml-auto inline-flex min-w-[22px] h-5 px-1 rounded-full bg-indigo-600 text-white text-xs items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            {/* Auth (mobile) */}
            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold"
              >
                خروج
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg border bg-white text-sm font-semibold"
                  onClick={() => setOpen(false)}
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold"
                  onClick={() => setOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}