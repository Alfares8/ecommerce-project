// src/pages/products.jsx
import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import "../css/products.css";

const DUMMY_PRODUCTS = [
  { _id:"p1",  name:"قميص قطن أبيض",        price:29.9,  image_url:"https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800" },
  { _id:"p2",  name:"قميص جينز أزرق",        price:39.9,  image_url:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800" },
  { _id:"p3",  name:"كنزة صوف رمادية",       price:44.0,  image_url:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800" },
  { _id:"p4",  name:"جاكيت خفيف أسود",       price:59.0,  image_url:"https://images.unsplash.com/photo-1520974749540-6c1d6fd8b7df?w=800" },
  { _id:"p5",  name:"هودي رياضي",            price:49.0,  image_url:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800" },
  { _id:"p6",  name:"تيشيرت مطبوع",          price:19.5,  image_url:"https://images.unsplash.com/photo-1520975432090-6e7430e2a3a5?w=800" },
  { _id:"p7",  name:"بنطال جينز Slim",       price:54.9,  image_url:"https://images.unsplash.com/photo-1519741497674-611481863552?w=800" },
  { _id:"p8",  name:"بنطال قماش كاجوال",     price:42.0,  image_url:"https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800" },
  { _id:"p9",  name:"شورت صيفي",             price:24.0,  image_url:"https://images.unsplash.com/photo-1519741497674-611481863552?w=800" },
  { _id:"p10", name:"تنورة سوداء",           price:34.0,  image_url:"https://images.unsplash.com/photo-1520975682071-6a6b1b3b59f2?w=800" },
  { _id:"p11", name:"فستان كاجوال",          price:69.0,  image_url:"https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800" },
  { _id:"p12", name:"فستان سهره بسيط",       price:89.0,  image_url:"https://images.unsplash.com/photo-1520975940788-3aa05f8640d1?w=800" },
  { _id:"p13", name:"حذاء رياضي أبيض",       price:79.0,  image_url:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
  { _id:"p14", name:"حذاء لوفر جلدي",        price:99.0,  image_url:"https://images.unsplash.com/photo-1520975693411-b6c9c7bd876a?w=800" },
  { _id:"p15", name:"حقيبة كتف",             price:45.0,  image_url:"https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800" },
  { _id:"p16", name:"قبعة كاب",              price:15.0,  image_url:"https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800" },
  { _id:"p17", name:"حزام جلدي",             price:22.0,  image_url:"https://images.unsplash.com/photo-1592878849125-2f3a2d2a4a9a?w=800" },
  { _id:"p18", name:"نظارة شمسية",           price:35.0,  image_url:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800" },
  { _id:"p19", name:"جوارب قطن (٣ أزواج)",   price:12.0,  image_url:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800" },
  { _id:"p20", name:"وشاح شتوي",             price:18.0,  image_url:"https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=800" },
];

export default function Products() {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [err, setErr]       = useState("");

  useEffect(() => {
    let cancelled = false;

    const tryFetch = async (path) => {
      const res   = await api.get(path);
      const data  = Array.isArray(res.data?.items) ? res.data.items
                  : Array.isArray(res.data)        ? res.data : [];
      return data;
    };

    (async () => {
      try {
        setLoad(true); setErr("");
        let data;
        try { data = await tryFetch("/products"); }
        catch { data = await tryFetch("/api/products"); }
        if (!cancelled) setItems(data.length ? data : DUMMY_PRODUCTS);
      } catch (e) {
        if (!cancelled) { setItems(DUMMY_PRODUCTS); setErr("عرضنا منتجات تجريبية لعدم توفر الـ API."); }
      } finally {
        if (!cancelled) setLoad(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="page-products" dir="rtl">
      <header className="products-header">
        <h1 className="products-title">المنتجات</h1>
        <p className="products-subtitle">تسوّق من تشكيلتنا المختارة بعناية</p>
      </header>

      {loading ? (
        <div className="products-loading">جاري التحميل…</div>
      ) : (
        <>
          {err && <div className="products-hint">{err}</div>}
          <section className="products-grid">
            {items.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}