// src/pages/orders.jsx
import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/axios.js";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);

  // تأكيد وجود التوكن وضبطه على axios
  const ensureAuth = () => {
    const token = localStorage.getItem("token") || "";
    setAuthToken(token);           // يضع Authorization: Bearer <token> على كل الطلبات
    setAuthed(Boolean(token));
    return token;
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const token = ensureAuth();
      if (!token) {
        setOrders([]);
        setErr("تحتاج تسجيل الدخول لعرض الطلبات.");
        return;
      }
      // المسار متوافق مع baseURL = /api
      const { data } = await api.get("/orders/mine"); // => http://localhost:4000/api/orders/mine
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setAuthed(false);
        localStorage.removeItem("token");
        setErr("انتهت صلاحية الجلسة. يرجى تسجيل الدخول من جديد.");
      } else {
        setErr(e?.response?.data?.error || e?.message || "فشل تحميل الطلبات");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // إعادة التحميل عند الرجوع للنافذة أو عند تغيّر التوكن (تسجيل/تسجيل خروج من تبويب آخر)
    const onFocus = () => load();
    const onStorage = (ev) => {
      if (ev.key === "token") load();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // إنشاء طلب تجريبي بمنتج فعلي من قاعدة البيانات
  const createDemo = async () => {
    try {
      const token = ensureAuth();
      if (!token) return setErr("تحتاج تسجيل الدخول لإنشاء طلب.");

      // 1) احضر أي منتج فعلي
      const { data: prods } = await api.get("/products?limit=1"); // => /api/products
      const first =
        Array.isArray(prods?.items) ? prods.items[0] :
        Array.isArray(prods) ? prods[0] :
        prods?.docs?.[0]; // دعم أشكال استجابة مختلفة (قديمة/جديدة)

      if (!first?._id) {
        return setErr("لا يوجد منتجات لتجربة إنشاء الطلب.");
      }

      // 2) جهّز عنصر السلة بما يناسب اسكيمة الـ backend:
      // بعض النسخ تسميه "product" وأخرى "productId"
      const line = {
        product: first._id,
        productId: first._id,
        name: first.name || "Product",
        quantity: 1,
        price: Number(first.price) || 20,
      };

      const payload = {
        items: [line],
        total: Number(first.price) || 20,
        payment_id: "test_payment",
      };

      // لا حاجة لتمرير الهيدر يدويًا لأن setAuthToken ضبطه عالميًا
      await api.post("/orders", payload); // => /api/orders

      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "فشل إنشاء الطلب التجريبي";
      alert(msg);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl font-bold text-indigo-700 mb-1">طلباتي</h1>
      <p className="text-gray-500 mb-6">كل مشترياتك في مكان واحد.</p>

      {loading && <div className="text-indigo-600">جارٍ التحميل…</div>}

      {!loading && err && (
        <div className="text-red-600 flex items-center gap-3 flex-wrap">
          <span>{err}</span>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={load}>
            إعادة المحاولة
          </button>
          {!authed && (
            <Link className="underline text-indigo-700" to="/login">
              تسجيل الدخول
            </Link>
          )}
        </div>
      )}

      {!loading && !err && orders.length === 0 && (
        <div className="bg-white border rounded-xl p-6 max-w-md">
          <p className="text-gray-600 mb-4">لا توجد طلبات بعد.</p>
          {authed ? (
            <button onClick={createDemo} className="px-4 py-2 rounded bg-indigo-600 text-white">
              إنشاء طلب تجريبي
            </button>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded bg-indigo-600 text-white inline-block">
              تسجيل الدخول
            </Link>
          )}
        </div>
      )}

      {!loading && !err && orders.length > 0 && (
        <div className="grid gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between font-semibold text-indigo-700">
                <span>#{o?._id?.slice?.(-6)} — {o?.status || "new"}</span>
                <span>€{Number(o?.total || 0).toFixed(2)}</span>
              </div>
              <ul className="mt-2 text-sm text-gray-700 list-disc pr-5">
                {o?.items?.map?.((it, i) => (
                  <li key={i}>
                    {(it?.name || "منتج")} × {Number(it?.quantity || 0)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}