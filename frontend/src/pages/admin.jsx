import { useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/axios";
import "../css/admin.css";

/* ثوابت عامة */
const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "canceled"];

/* تبويبات */
function AdminTabs({ tab, setTab }) {
  const tabs = [
    { key: "products", label: "المنتجات", icon: "📦" },
    { key: "orders", label: "الطلبات", icon: "🧾" },
    { key: "customers", label: "العملاء", icon: "👤" },
  ];
  return (
    <nav className="admin-tabs" role="tablist" dir="rtl">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={tab === t.key}
          onClick={() => setTab(t.key)}
          className={`admin-tab ${tab === t.key ? "active" : ""}`}
          title={t.label}
        >
          <span className="mr-1">{t.icon}</span> {t.label}
        </button>
      ))}
    </nav>
  );
}

/* بطاقة منتج صغيرة */
function ProductCardMini({ p, onDelete }) {
  return (
    <article className="admin-card" key={p._id} aria-label={p.name}>
      <img src={p.image_url} alt={p.name} className="thumb" loading="lazy"
           onError={(e)=>{e.currentTarget.src="https://via.placeholder.com/160x160.png?text=No+Image";}} />
      <div className="name" title={p.name}>{p.name}</div>
      <div className="muted text-xs">المخزون: {Number.isFinite(p.stock)? p.stock : 0}</div>
      <div className="price">€{Number(p.price || 0).toFixed(2)}</div>
      <button className="danger" onClick={() => onDelete?.(p)} aria-label={`حذف ${p.name}`}>
        حذف
      </button>
    </article>
  );
}

/* نموذج إضافة منتج */
function ProductForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    stock: 0,
    categories: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return "الاسم مطلوب.";
    if (Number(form.price) <= 0) return "السعر يجب أن يكون رقمًا أكبر من 0.";
    if (form.image_url && !/^https?:\/\//i.test(form.image_url)) return "رابط الصورة غير صالح.";
    if (Number(form.stock) < 0) return "المخزون لا يمكن أن يكون سالبًا.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);
    setErr("");
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        stock: Number(form.stock) || 0,
        // تحويل النص إلى مصفوفة سلاجز
        categories: form.categories
          ? form.categories.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.post("/api/products", payload);
      onCreated?.(data);
      // إعادة تعيين
      setForm({
        name: "",
        price: "",
        description: "",
        image_url: "",
        stock: 0,
        categories: "",
      });
    } catch (e) {
      setErr(e?.response?.data?.error || "فشل إضافة المنتج");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit} dir="rtl">
      <div className="form-grid">
        <input
          placeholder="اسم المنتج *"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <input
          placeholder="السعر € *"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          required
        />
        <input
          placeholder="رابط الصورة"
          value={form.image_url}
          onChange={(e) => update("image_url", e.target.value)}
        />
        <input
          placeholder="المخزون"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => update("stock", e.target.value)}
        />
        <input
          placeholder="التصنيفات (مفصولة بفواصل) مثال: shirts, shoes"
          value={form.categories}
          onChange={(e) => update("categories", e.target.value)}
        />
      </div>
      <textarea
        placeholder="الوصف (اختياري)"
        rows={3}
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />
      {err && <div className="form-error">{err}</div>}
      <div className="form-actions">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "جارٍ الحفظ…" : "إضافة المنتج"}
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  /* توكين وتبويب */
  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /* المنتجات */
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const totalPages = useMemo(
    () => (products?.total > 0 ? Math.ceil(products.total / Number(limit || 1)) : 1),
    [products?.total, limit]
  );

  /* الطلبات والعملاء */
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token || null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr("");
        setLoading(true);

        if (tab === "products") {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          params.set("page", String(page));
          params.set("limit", String(limit));
          const { data } = await api.get(`/api/products?${params.toString()}`);
          // دعم شكلين للاستجابة
          const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
          const total = typeof data?.total === "number" ? data.total : items.length;
          if (!cancelled) setProducts({ items, total });
        } else if (tab === "orders") {
          const { data } = await api.get("/api/admin/orders");
          if (!cancelled) setOrders(Array.isArray(data) ? data : []);
        } else {
          const { data } = await api.get("/api/admin/users");
          if (!cancelled) setUsers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.error || "تعذّر التحميل");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, q, page, limit]);

  /* إنشاء/حذف منتج */
  const onProductCreated = (created) => {
    // إدراج المنتج في البداية بشكل متفائل
    setProducts((prev) => ({
      items: [created, ...(prev.items || [])],
      total: (prev.total || 0) + 1,
    }));
  };

  const deleteProduct = async (p) => {
    const yes = window.confirm(`ستحذف "${p.name}" نهائيًا، هل أنت متأكد؟`);
    if (!yes) return;
    try {
      await api.delete(`/api/products/${p._id}`);
      setProducts((prev) => ({
        items: (prev.items || []).filter((it) => it._id !== p._id),
        total: Math.max(0, (prev.total || 1) - 1),
      }));
    } catch (e) {
      alert(e?.response?.data?.error || "فشل حذف المنتج");
    }
  };

  /* تغيير حالة الطلب */
  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch (e) {
      alert(e?.response?.data?.error || "فشل تحديث الحالة");
    }
  };

  return (
    <main className="page-admin" dir="rtl">
      <header className="admin-header">
        <div className="wrap">
          <h1 className="title">
            لوحة تحكم <span className="brand">FashionStore</span> 🛒
          </h1>
          <AdminTabs tab={tab} setTab={setTab} />
        </div>
      </header>

      {/* شريط أدوات خاص بكل تبويب */}
      {tab === "products" && (
        <section className="toolbar">
          <div className="toolbar-left">
            <input
              className="input"
              placeholder="بحث باسم المنتج…"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              aria-label="بحث المنتجات"
            />
            <select
              className="input"
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
              aria-label="عدد العناصر"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
          <div className="toolbar-right">
            <span className="muted">
              {products?.total ? `إجمالي: ${products.total}` : "—"}
            </span>
          </div>
        </section>
      )}

      {err && <div className="admin-error">{err}</div>}
      {loading && <div className="admin-loading">جارٍ التحميل…</div>}

      {/* محتوى التبويبات */}
      {!loading && !err && tab === "products" && (
        <>
          <ProductForm onCreated={onProductCreated} />
          {products.items?.length ? (
            <>
              <section className="admin-grid">
                {products.items.map((p) => (
                  <ProductCardMini key={p._id} p={p} onDelete={deleteProduct} />
                ))}
              </section>

              <nav className="admin-pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  السابق
                </button>
                <span className="page-indicator">
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
          ) : (
            <div className="admin-empty">لا توجد منتجات بعد.</div>
          )}
        </>
      )}

      {!loading && !err && tab === "orders" && (
        <section className="admin-orders">
          {orders.length === 0 ? (
            <div className="admin-empty">لا توجد طلبات حالياً.</div>
          ) : (
            orders.map((o) => (
              <article key={o._id} className="order-card">
                <div className="order-header">
                  <span className="order-id">
                    #{o._id?.slice(-6)} — {o.status}
                  </span>
                  <span className="order-total">€{Number(o.total || 0).toFixed(2)}</span>
                </div>
                <div className="order-user">{o.user?.email || "ضيف"}</div>

                <div className="order-items">
                  <ul>
                    {(o.items || []).map((it, i) => (
                      <li key={i}>
                        {it.name} × {it.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-actions">
                  <label className="muted text-sm">تحديث الحالة:</label>
                  <select
                    className="input"
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      {!loading && !err && tab === "customers" && (
        <section className="admin-customers">
          {users.length === 0 ? (
            <div className="admin-empty">لا يوجد عملاء.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>البريد الإلكتروني</th>
                    <th>الدور</th>
                    <th>آخر دخول</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}