// src/pages/checkout.jsx
import { useEffect, useState } from "react";
import { api } from "../api/axios.js";
import { useCart } from "../context/Cartcontext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import "../css/checkout.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || "pk_test_12345");

function CheckoutForm({ clientSecret }) {
  const stripe   = useStripe();
  const elements = useElements();
  const { items, subtotal, clear } = useCart();

  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const isMock = clientSecret === "mock_client_secret";

  const pay = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErr("");
    setLoading(true);

    let payment_id = "mock_pi";

    // في الحالة الحقيقية فقط نؤكد الدفع عبر Stripe
    if (!isMock) {
      if (!stripe || !elements) { setLoading(false); return; }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        setErr(error.message || "فشل تأكيد الدفع");
        setLoading(false);
        return;
      }
      payment_id = paymentIntent.id;
    }

    try {
      await api.post(
        "/orders",
        { items, payment_id, total: subtotal },
        {
          headers: {
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : "",
          },
        }
      );
      clear();
      window.location.assign("/orders");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "فشل إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  const disableBtn =
    loading || (!isMock && (!clientSecret || !stripe || !elements));

  return (
    <form onSubmit={pay} className="checkout-form" dir="rtl">
      <h1 className="title">إتمام الدفع</h1>

      {/* في وضع الموك لا نعرض PaymentElement */}
      {isMock ? (
        <div className="mock-note">وضع الدفع التجريبي (لن يتم تحصيل أي مبلغ).</div>
      ) : (
        <PaymentElement />
      )}

      {err && <div className="checkout-error">{err}</div>}

      <button type="submit" className="pay-btn" disabled={disableBtn}>
        {loading ? "جاري المعالجة..." : "ادفع الآن"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { items } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [note, setNote]                 = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.post("/orders/create-payment-intent", { items });
        if (mounted) setClientSecret(data?.clientSecret || "mock_client_secret");
      } catch {
        // في حال فشل تجهيز الدفع الحقيقي، نرجع للموك بدل شاشة بيضاء
        if (mounted) {
          setClientSecret("mock_client_secret");
          setNote("تعذّر تجهيز الدفع الحقيقي، تم التبديل للوضع التجريبي.");
        }
      }
    })();
    return () => { mounted = false; };
  }, [items]);

  if (!items.length) {
    return (
      <main className="page-checkout" dir="rtl">
        <h1>إتمام الدفع</h1>
        <p>سلتك فارغة.</p>
      </main>
    );
  }

  if (!clientSecret) {
    return (
      <main className="page-checkout" dir="rtl">
        <h1>إتمام الدفع</h1>
        <p className="checkout-loading">جارٍ تجهيز الدفع…</p>
      </main>
    );
  }

  return (
    <main className="page-checkout" dir="rtl">
      {note && <div className="checkout-note">{note}</div>}
      {/* نلف CheckoutForm بـ Elements دائماً حتى في وضع الموك */}
      <Elements stripe={stripePromise} options={clientSecret !== "mock_client_secret" ? { clientSecret } : {}}>
        <CheckoutForm clientSecret={clientSecret} />
      </Elements>
    </main>
  );
}