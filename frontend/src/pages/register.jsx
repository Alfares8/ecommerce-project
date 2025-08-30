// src/pages/register.jsx
import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios.js";
import "../css/register.css";

export default function Register() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  // قواعد بسيطة وسريعة للتحقق
  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passOk = useMemo(() => password.length >= 8, [password]);
  const matchOk = useMemo(() => password === confirm && passOk, [password, confirm, passOk]);

  const canSubmit = emailOk && matchOk && !loading;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr("");
    setLoading(true);
    try {
      // ملاحظة: يعتمد على baseURL في axios.js
      await api.post("/auth/register", { email, password });
      setOk(true);
      setTimeout(() => nav("/login", { state: { justRegistered: true, email } }), 900);
    } catch (e) {
      setErr(e?.response?.data?.error || "فشل إنشاء الحساب. حاول مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4"
      dir="rtl"
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow p-8 border"
        style={{ borderColor: "#e5e7eb" }}
      >
        <h1 className="text-2xl font-bold text-indigo-700 mb-2 text-center">إنشاء حساب</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">أنشئ حسابك وتابع طلباتك بسهولة</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
                email && !emailOk ? "border-red-300 focus:ring-red-400" : "focus:ring-indigo-500"
              }`}
              autoComplete="email"
              required
            />
            {email && !emailOk && (
              <p className="text-xs text-red-600 mt-1">أدخل بريدًا إلكترونيًا صحيحًا.</p>
            )}
          </div>

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="كلمة المرور (٨ أحرف على الأقل)"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring-2 ${
                password && !passOk ? "border-red-300 focus:ring-red-400" : "focus:ring-indigo-500"
              }`}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
              aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {show ? "إخفاء" : "إظهار"}
            </button>
            {password && (
              <p className="text-xs mt-1 text-gray-500">
                القوة: {password.length >= 12 ? "قوية" : password.length >= 9 ? "متوسطة" : "ضعيفة"}
              </p>
            )}
          </div>

          <div>
            <input
              type={show ? "text" : "password"}
              placeholder="تأكيد كلمة المرور"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
                confirm && !matchOk ? "border-red-300 focus:ring-red-400" : "focus:ring-indigo-500"
              }`}
              autoComplete="new-password"
              required
            />
            {confirm && !matchOk && (
              <p className="text-xs text-red-600 mt-1">كلمتا المرور غير متطابقتين.</p>
            )}
          </div>

          {err && <div className="text-center text-red-600 text-sm">{err}</div>}
          {ok && <div className="text-center text-green-600 text-sm">تم التسجيل! سيتم تحويلك…</div>}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full font-bold rounded-lg py-3 transition ${
              canSubmit ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {loading ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          لديك حساب؟{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}