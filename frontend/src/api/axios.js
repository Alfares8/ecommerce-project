// src/api/axios.js
import axios from 'axios';

const base =
  import.meta.env?.VITE_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:4000/api`;

export const api = axios.create({ baseURL: base });

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};

// ✅ هنا نقرأ التوكن من localStorage عند تشغيل الموقع
const saved = localStorage.getItem('token');
if (saved) {
  setAuthToken(saved);
}

// (اختياري) إن حصل 401 نمسح التوكن ونوجه المستخدم
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      setAuthToken(null);
    }
    return Promise.reject(err);
  }
);