import React,{useState,useEffect,useRef} from 'react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { formatDateTime } from '../utils/helpers';

export default function NotificationBell(){
  const[notifs,setNotifs]=useState([]);
  const[unread,setUnread]=useState(0);
  const[open,setOpen]=useState(false);
  const ref=useRef();

  const fetch=async()=>{ try{ const r=await api.get('/notifications'); setNotifs(r.data.notifications); setUnread(r.data.unreadCount); }catch{} };
  useEffect(()=>{
    fetch();
    const s=getSocket();
    s.on('notification',d=>{ setNotifs(p=>[{...d,_id:Date.now(),isRead:false,createdAt:new Date()},...p]); setUnread(c=>c+1); });
    return()=>s.off('notification');
  },[]);
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h);
  },[]);

  const markRead=async()=>{ await api.put('/notifications/read-all'); setUnread(0); setNotifs(n=>n.map(x=>({...x,isRead:true}))); };
  const ic={credit:'💚',debit:'🔴',info:'💙',alert:'⚠️'};
  const cc={credit:'#10B981',debit:'#EF4444',info:'#3B82F6',alert:'#F59E0B'};

  return(
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>{setOpen(!open);if(!open&&unread)markRead();}} style={{position:'relative',background:'var(--gray-100)',border:'none',borderRadius:12,width:42,height:42,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
        🔔
        {unread>0&&<span style={{position:'absolute',top:4,right:4,background:'#EF4444',color:'white',borderRadius:'50%',width:17,height:17,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{unread>9?'9+':unread}</span>}
      </button>
      {open&&(
        <div style={{position:'absolute',right:0,top:'110%',width:340,background:'var(--surface)',borderRadius:20,boxShadow:'0 20px 60px rgba(10,22,40,.2)',border:'1px solid var(--border)',overflow:'hidden',zIndex:200}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>Notifications</span>
            {unread>0&&<button onClick={markRead} style={{background:'none',border:'none',color:'var(--blue)',cursor:'pointer',fontSize:13,fontWeight:600}}>Mark all read</button>}
          </div>
          <div style={{maxHeight:340,overflowY:'auto'}}>
            {notifs.length===0?<div style={{padding:32,textAlign:'center',color:'var(--gray-400)'}}>No notifications</div>:
            notifs.map((n,i)=>(
              <div key={i} style={{padding:'12px 18px',borderBottom:'1px solid var(--border)',background:n.isRead?'var(--surface)':'var(--gray-50)'}}>
                <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{fontSize:16}}>{ic[n.type]||'🔔'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13,color:cc[n.type]||'var(--text)'}}>{n.title}</div>
                    <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{n.message}</div>
                    {n.createdAt&&<div style={{fontSize:11,color:'var(--gray-400)',marginTop:3}}>{formatDateTime(n.createdAt)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
