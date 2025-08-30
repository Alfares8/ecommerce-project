/** @jsxImportSource react */
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/Cartcontext.jsx";
import "../css/cart.css";

const FALLBACK_IMG = "https://via.placeholder.com/120x120.png?text=No+Image";
const fmt = (n) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })
    .format(Number.isFinite(n) ? n : 0);

export default function Cart() {
  const ctx = useCart() || {};
  const { items = [], remove = () => {}, update = () => {}, clear = () => {}, subtotal = 0 } = ctx;

  const tax = Math.round((Number(subtotal)||0) * 0.15 * 100)/100;
  const shipping = (Number(subtotal)||0) > 100 ? 0 : 9.9;
  const total = Math.round(((Number(subtotal)||0) + tax + shipping) * 100)/100;

  if (items.length === 0) {
    return (
      <main className="page-cart-empty" dir="rtl">
        <div className="card">
          <h2 className="title">سلتك فارغة</h2>
          <p className="muted">ابدأ التسوق وأضف منتجاتك المفضلة.</p>
          <Link to="/products" className="btn btn-primary">تصفّح المنتجات</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-cart" dir="rtl">
      <section className="cart-items">
        {items.map((it) => (
          <article
            key={it?.productId ?? it?._id ?? it?.id ?? crypto.randomUUID()}
            className="cart-item"
          >
            <img
              src={it?.image_url || FALLBACK_IMG}
              alt={it?.name || "منتج"}
              className="thumb"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />

            <div className="info">
              <div className="name">{it?.name || "منتج"}</div>
              <div className="price">{fmt(Number(it?.price) || 0)}</div>
            </div>

            <div className="qty">
              <input
                type="number"
                min="1"
                value={Math.max(1, Number(it?.quantity) || 1)}
                onChange={(e) =>
                  update(it?.productId, Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>

            <div className="line-total">
              {fmt((Number(it?.price) || 0) * (Number(it?.quantity) || 1))}
            </div>

            <button className="remove" onClick={() => remove(it?.productId)}>✕</button>
          </article>
        ))}

        <button className="clear" onClick={clear}>تفريغ السلة</button>
      </section>

      <aside className="cart-summary">
        <h3>ملخّص الطلب</h3>
        <div className="row"><span>المجموع الفرعي</span><span>{fmt(subtotal)}</span></div>
        <div className="row"><span>الضريبة (15%)</span><span>{fmt(tax)}</span></div>
        <div className="row"><span>الشحن</span><span>{shipping===0?"مجاني":fmt(shipping)}</span></div>
        <div className="row total"><span>الإجمالي</span><span>{fmt(total)}</span></div>
        <Link to="/checkout" className="checkout btn btn-primary">إتمام الشراء</Link>
      </aside>
    </main>
  );
}