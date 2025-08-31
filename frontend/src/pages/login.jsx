// src/pages/login.jsx
import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/axios.js";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../css/login.css";

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation(); // للرجوع للصفحة المطلوبة بعد الحماية
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // لو المستخدم مُسجّل من قبل → انتقل مباشرة
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      nav(state?.redirectTo || "/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");

    // فحص سريع قبل الإرسال
    if (!email.includes("@") || password.length < 8) {
      setErr("تحقق من البريد وكلمة المرور (٨ أحرف على الأقل).");
      return;
    }

    try {
      setLoading(true);

      // axios instance يضيف Content-Type تلقائياً
      const { data } = await api.post("/auth/login", { email, password });

      const token = data?.token;
      if (!token) {
        setErr("فشل تسجيل الدخول: لم يتم استلام رمز الدخول.");
        return;
      }

      // خزّن وفعّل التوكن ثم وجّه
      localStorage.setItem("token", token);
      setAuthToken(token);
      nav(state?.redirectTo || "/", { replace: true });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) setErr("بيانات الاعتماد غير صحيحة.");
      else setErr(e?.response?.data?.error || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="page-login bg-gradient-to-br from-indigo-50 to-white min-h-screen flex items-center justify-center"
      dir="rtl"
    >
      <div className="login-card bg-white rounded-xl shadow p-8 w-full max-w-md border">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">تسجيل الدخول</h1>

        <form onSubmit={submit} className="login-form flex flex-col gap-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="email"
            required
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="كلمة المرور (٨ أحرف على الأقل)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              minLength={8}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
              aria-label="إظهار/إخفاء كلمة المرور"
            >
              {showPw ? "إخفاء" : "إظهار"}
            </button>
          </div>

          {err && <div className="text-red-600 text-center">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="login-btn w-full font-bold rounded-lg py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "جارٍ تسجيل الدخول…" : "دخول"}
          </button>
        </form>

        <p className="login-alt text-center mt-4 text-gray-600">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="text-indigo-600 font-semibold underline">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </main>
  );
}