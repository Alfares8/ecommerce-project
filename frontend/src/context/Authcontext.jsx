import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../api/axios.js';

const AuthCtx = createContext({ user:null, token:'', login:async()=>{}, register:async()=>{}, logout:()=>{} });
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(()=>localStorage.getItem('token')||'');
  const [user, setUser] = useState(null);
  useEffect(()=> setAuthToken(token), [token]);

  useEffect(()=>{
    if(!token){ setUser(null); return; }
    api.get('/auth/me').then(r=>setUser(r.data.user||null))
      .catch(()=>{ setUser(null); setToken(''); localStorage.removeItem('token'); });
  },[token]);

  const login = async (email,password)=>{
    const r = await api.post('/auth/login',{ email,password });
    localStorage.setItem('token', r.data.token); setToken(r.data.token); setUser(r.data.user||null);
    return r.data;
  };
  const register = async (email,password)=> { await api.post('/auth/register',{ email,password }); return true; };
  const logout = ()=>{ localStorage.removeItem('token'); setToken(''); setUser(null); };
  const value = useMemo(()=>({ user, token, login, register, logout }),[user, token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}