import axios from 'axios';

const base = import.meta?.env?.VITE_API_BASE
  || window.__API_BASE__
  || `${window.location.protocol}//${window.location.hostname}:4000/api`;

export const api = axios.create({ baseURL: base });

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
};
