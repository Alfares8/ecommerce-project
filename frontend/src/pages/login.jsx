// src/pages/login.jsx
import { useState } from "react";
import { api, setAuthToken } from "../api/axios.js";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../css/login.css";

export default function Login() {
  const nav = useNavigate();
  const { state } = useLocation(); // لاستقبال redirect من ProtectedRoute مثلاً
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");

    if (!email.includes("@") || password.length < 8) {
      setErr("تحقق من البريد وكلمة المرور (٨ أحرف على الأقل).");
      return;
    }

    try {
      setLoading(true);
      const res   = await api.post("/auth/login", { email, password });
      const token = res.data?.token;
      if (!token) {
        setErr("فشل تسجيل الدخول: لم يتم استلام رمز الدخول.");
        return;
      }
      localStorage.setItem("token", token);
      setAuthToken(token);
      // إن وُجد مسار مطلوب مسبقًا (redirectTo) نذهب له، وإلا الصفحة الرئيسية
      nav(state?.redirectTo || "/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.error || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="page-login bg-gradient-to-br from-indigo-50 to-white min-h-screen flex items-center justify-center"
      dir="rtl"
    >
      <div
        className="login-card bg-white rounded-xl shadow p-8 w-full max-w-md border"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          تسجيل الدخول
        </h1>

        <form onSubmit={submit} className="login-form flex flex-col gap-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور (٨ أحرف على الأقل)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            minLength={8}
            required
          />

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
          <Link to="/register" className="text-indigo-600 font-semibold">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </main>
  );
}