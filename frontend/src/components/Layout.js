import React,{useEffect} from 'react';
import { Outlet,NavLink,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { getInitials } from '../utils/helpers';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const nav=[
  {to:'/dashboard',icon:'⚡',label:'Dashboard'},
  {to:'/wallet',   icon:'💳',label:'Wallet'},
  {to:'/send',     icon:'↗️', label:'Send Money'},
  {to:'/qr',       icon:'📷',label:'QR Pay'},
  {to:'/requests', icon:'🤝',label:'Requests'},
  {to:'/transactions',icon:'📋',label:'Transactions'},
  {to:'/analytics',icon:'📊',label:'Analytics'},
  {to:'/scheduled',icon:'⏰',label:'Scheduled'},
  {to:'/profile',  icon:'👤',label:'Profile'},
];

export default function Layout(){
  const{user,logout,theme,toggleTheme}=useAuth();
  const navigate=useNavigate();

  useEffect(()=>{
    const s=getSocket();
    s.on('notification',d=>{ toast.success(d.message,{icon:d.type==='credit'?'💰':'💸'}); });
    s.on('money_request',d=>{ toast(d.message,{icon:'🤝',duration:5000}); });
    s.on('fraud_alert',d=>{ toast.error('⚠️ '+d.message,{duration:8000}); });
    return()=>{ s.off('notification'); s.off('money_request'); s.off('fraud_alert'); };
  },[]);

  const allNav=[...nav];
  if(['merchant','admin'].includes(user?.role)) allNav.push({to:'/merchant',icon:'🏪',label:'Merchant'});
  if(user?.role==='admin') allNav.push({to:'/admin',icon:'🛡️',label:'Admin'});

  return(
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      <aside style={{width:248,background:'var(--navy)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,zIndex:100,boxShadow:'4px 0 20px rgba(10,22,40,.18)'}}>
        <div style={{padding:'24px 20px 18px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,background:'linear-gradient(135deg,#1E4FD8,#00D4FF)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💸</div>
            <div>
              <div style={{color:'white',fontWeight:800,fontSize:17,letterSpacing:'-.5px'}}>PayFlow</div>
              <div style={{color:'rgba(255,255,255,.35)',fontSize:10,fontWeight:500}}>V2 · DIGITAL PAYMENTS</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,padding:'12px 10px',overflowY:'auto'}}>
          {allNav.map(item=>(
            <NavLink key={item.to} to={item.to} style={({isActive})=>({
              display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,marginBottom:2,
              textDecoration:'none',transition:'all .2s',fontSize:13,fontWeight:isActive?600:400,
              background:isActive?'linear-gradient(135deg,rgba(30,79,216,.8),rgba(0,212,255,.2))':'transparent',
              color:isActive?'white':'rgba(255,255,255,.5)',
              boxShadow:isActive?'0 4px 15px rgba(30,79,216,.3)':'none'
            })}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{padding:'12px 10px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(255,255,255,.05)',borderRadius:12,marginBottom:8}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,overflow:'hidden',flexShrink:0}}>
              {user?.avatar?<img src={user.avatar} alt="" style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>:getInitials(user?.name)}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:'white',fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
              <div style={{color:'rgba(255,255,255,.35)',fontSize:11}}>{user?.role}</div>
            </div>
          </div>
          <button onClick={toggleTheme} style={{width:'100%',padding:'8px',background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.6)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,cursor:'pointer',fontFamily:'var(--font)',fontSize:12,fontWeight:600,marginBottom:6,transition:'all .2s'}}>
            {theme==='dark'?'☀️ Light Mode':'🌙 Dark Mode'}
          </button>
          <button onClick={()=>{logout();navigate('/login');}} style={{width:'100%',padding:'8px',background:'rgba(239,68,68,.15)',color:'#FCA5A5',border:'1px solid rgba(239,68,68,.2)',borderRadius:10,cursor:'pointer',fontFamily:'var(--font)',fontSize:12,fontWeight:600,transition:'all .2s'}}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <div style={{flex:1,marginLeft:248,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
        <header style={{background:'var(--surface)',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'flex-end',borderBottom:'1px solid var(--border)',position:'sticky',top:0,zIndex:50,gap:12}}>
          <NotificationBell/>
        </header>
        <main style={{flex:1,padding:'28px 32px',maxWidth:1200}}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
