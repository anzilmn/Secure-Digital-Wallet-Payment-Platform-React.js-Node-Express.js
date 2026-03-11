import React,{createContext,useContext,useState,useEffect} from 'react';
import api from '../utils/api';
import { connectSocket, disconnectSocket } from '../utils/socket';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({children}) {
  const [user,setUser]       = useState(null);
  const [loading,setLoading] = useState(true);
  const [theme,setTheme]     = useState(localStorage.getItem('pf_theme')||'light');

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
  },[theme]);

  useEffect(()=>{
    const t=localStorage.getItem('pf_token');
    if(t){ api.get('/auth/me').then(r=>{setUser(r.data.user);connectSocket(r.data.user.id);setTheme(r.data.user.theme||'light');}).catch(()=>localStorage.removeItem('pf_token')).finally(()=>setLoading(false)); }
    else setLoading(false);
  },[]);

  const login = async (email,password) => {
    const r=await api.post('/auth/login',{email,password});
    localStorage.setItem('pf_token',r.data.token);
    setUser(r.data.user); connectSocket(r.data.user.id);
    setTheme(r.data.user.theme||'light');
    return r.data.user;
  };
  const register = async (data) => {
    const r=await api.post('/auth/register',data);
    localStorage.setItem('pf_token',r.data.token);
    setUser(r.data.user); connectSocket(r.data.user.id);
    return r.data.user;
  };
  const logout = () => { localStorage.removeItem('pf_token'); disconnectSocket(); setUser(null); };
  const refreshUser = async () => { const r=await api.get('/auth/me'); setUser(r.data.user); };
  const toggleTheme = async () => {
    const next=theme==='light'?'dark':'light';
    setTheme(next); localStorage.setItem('pf_theme',next);
    document.documentElement.setAttribute('data-theme',next);
    if(user) api.put('/auth/theme',{theme:next}).catch(()=>{});
  };

  return <Ctx.Provider value={{user,loading,login,register,logout,refreshUser,theme,toggleTheme}}>{children}</Ctx.Provider>;
}
