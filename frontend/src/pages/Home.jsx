import { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import "../css/Home.css";

/* منتجات مقترَحة تُعرض عند الفراغ (يمكنك تعديلها أو حذفها) */
const FEATURED = [
  {
    _id: "feat-1",
    name: "Classic Tee",
    price: 19.9,
    description: "تيشيرت قطني 100% لراحة يومية.",
    image_url:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80",
  },
  {
    _id: "feat-2",
    name: "Denim Jacket",
    price: 59.0,
    description: "جاكيت جينز عملي يناسب كل الإطلالات.",
    image_url:
      "https://images.unsplash.com/photo-1503342217505-b0a15cf70489?w=800&q=80",
  },
  {
    _id: "feat-3",
    name: "Sport Sneakers",
    price: 79.0,
    description: "حذاء رياضي خفيف ومتين للمشي اليومي.",
    image_url:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
];

/* هوك بسيط لخفض طلبات البحث */
function useDebounce(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function Home() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // تحكّم بالبحث والترقيم
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const totalPages = useMemo(
    () => (data.total > 0 ? Math.ceil(data.total / Number(limit || 1)) : 1),
    [data.total, limit]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        // نبني الباراميترات لو الـ API يدعمها
        const params = new URLSearchParams();
        if (dq) params.set("q", dq);
        params.set("page", page);
        params.set("limit", limit);

        const url =
          params.toString().length > 0
            ? `/products?${params.toString()}`
            : "/products";

        const res = await api.get(url, { signal: ctrl.signal });

        // يدعم شكلين: { items, total } أو مصفوفة مباشرة
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
        const total =
          typeof res.data?.total === "number" ? res.data.total : items.length;

        setData({ items, total });
      } catch (e) {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        console.error(e);
        setErr(e.response?.data?.error || "فشل تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => ctrl.abort();
  }, [dq, page, limit]);

  return (
    <main className="page-home" dir="rtl">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero__text">
          <h1 className="home-hero__title">مرحباً بك في FashionStore</h1>
          <p className="home-hero__subtitle">
            أزياء عصرية، جودة عالية، وتجربة تسوّق سهلة وآمنة.
          </p>
          <div className="home-hero__actions">
            <a href="/products" className="btn btn-primary">
              تسوّق الآن
            </a>
            <a href="/about" className="btn btn-secondary">
              من نحن
            </a>
          </div>
        </div>
        <div className="home-hero__image">
          <img
            src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1080&q=80"
            alt="Fashion"
            loading="lazy"
          />
        </div>
      </section>

      {/* شريط تحكم */}
      <header className="home-header">
        <h2 className="home-section-title">المنتجات</h2>
        <div className="home-controls">
          <input
            className="home-search"
            placeholder="ابحث عن منتج…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="home-limit"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      </header>

      {/* الحالات */}
      {loading ? (
        <div className="home-loading">جاري التحميل…</div>
      ) : err ? (
        <div className="home-error">
          {err}{" "}
          <button className="link" onClick={() => setPage((p) => p)}>
            إعادة المحاولة
          </button>
        </div>
      ) : data.items.length === 0 ? (
        <section className="home-empty-wrap">
          <p className="home-empty">لا توجد منتجات حالياً.</p>
          <h3 className="home-section-title mt">مقترحات قد تعجبك</h3>
          <div className="home-grid">
            {FEATURED.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <div className="home-empty-cta">
            <a href="/products" className="btn btn-primary">
              تصفّح الكل
            </a>
          </div>
        </section>
      ) : (
        <>
          {/* ملخص */}
          <div className="home-meta">
            <span>الإجمالي: {data.total}</span>
            {dq && <span> | نتيجة البحث عن: “{dq}”</span>}
          </div>

          {/* الشبكة */}
          <section className="home-grid">
            {data.items.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </section>

          {/* الترقيم */}
          <nav className="home-pagination">
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </button>
            <span className="home-page-index">
              صفحة {page} من {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              التالي
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

export default Home;