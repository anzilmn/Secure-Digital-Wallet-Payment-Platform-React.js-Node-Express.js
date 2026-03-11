import React,{useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency,formatDateTime,getInitials } from '../utils/helpers';

export default function Dashboard(){
  const{user}=useAuth(); const nav=useNavigate();
  const[wallet,setWallet]=useState(null);
  const[txns,setTxns]=useState([]);
  const[requests,setRequests]=useState([]);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([api.get('/wallet'),api.get('/transactions?limit=5'),api.get('/requests/incoming')])
      .then(([w,t,r])=>{ setWallet(w.data.wallet); setTxns(t.data.transactions); setRequests(r.data.requests); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading)return<div className="loading"><div className="spinner"/></div>;
  const qa=[
    {icon:'↗️',label:'Send Money',to:'/send',color:'#1E4FD8'},
    {icon:'📷',label:'QR Pay',to:'/qr',color:'#8B5CF6'},
    {icon:'🤝',label:'Requests',to:'/requests',color:'#10B981'},
    {icon:'💰',label:'Add Money',to:'/wallet',color:'#059669'},
    {icon:'📊',label:'Analytics',to:'/analytics',color:'#F59E0B'},
    {icon:'⏰',label:'Scheduled',to:'/scheduled',color:'#EC4899'},
    {icon:'📋',label:'History',to:'/transactions',color:'#06B6D4'},
    {icon:'👤',label:'Profile',to:'/profile',color:'#6366F1'},
  ];

  return(
    <div>
      <div className="page-header"><h1>Good day, {user?.name?.split(' ')[0]} 👋</h1><p>Your financial overview</p></div>

      {/* Wallet Hero */}
      <div style={{background:'linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 50%,#1E4FD8 100%)',borderRadius:24,padding:'32px 36px',marginBottom:28,position:'relative',overflow:'hidden',boxShadow:'0 20px 60px rgba(10,22,40,.25)'}}>
        <div style={{position:'absolute',top:'-50%',right:'-5%',width:280,height:280,background:'radial-gradient(circle,rgba(0,212,255,.15),transparent)',borderRadius:'50%'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{color:'rgba(255,255,255,.55)',fontSize:12,fontWeight:600,letterSpacing:2,textTransform:'uppercase',marginBottom:10}}>💳 Wallet Balance</div>
          <div style={{color:'white',fontSize:44,fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-2px',marginBottom:20}}>{formatCurrency(wallet?.balance)}</div>
          <div style={{display:'flex',gap:28}}>
            <div><div style={{color:'rgba(255,255,255,.45)',fontSize:11}}>Sent</div><div style={{color:'#FCA5A5',fontWeight:700,fontSize:17,fontFamily:'var(--mono)'}}>{formatCurrency(wallet?.totalSent)}</div></div>
            <div><div style={{color:'rgba(255,255,255,.45)',fontSize:11}}>Received</div><div style={{color:'#6EE7B7',fontWeight:700,fontSize:17,fontFamily:'var(--mono)'}}>{formatCurrency(wallet?.totalReceived)}</div></div>
          </div>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {requests.length>0&&(
        <div style={{background:'linear-gradient(135deg,#FEF3C7,#FDE68A)',border:'2px solid #F59E0B',borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontWeight:700,color:'#92400E'}}>🤝 {requests.length} Pending Money Request{requests.length>1?'s':''}</div><div style={{fontSize:13,color:'#B45309',marginTop:2}}>Someone is waiting for payment</div></div>
          <button className="btn btn-sm" onClick={()=>nav('/requests')} style={{background:'#F59E0B',color:'white',border:'none'}}>View →</button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid-4" style={{marginBottom:28}}>
        {qa.map(a=>(
          <button key={a.to} onClick={()=>nav(a.to)} style={{background:'var(--surface)',border:'2px solid var(--border)',borderRadius:18,padding:'18px',cursor:'pointer',transition:'all .2s',textAlign:'center',fontFamily:'var(--font)'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 25px rgba(0,0,0,.1)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
            <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
            <div style={{fontWeight:600,fontSize:13,color:'var(--text)'}}>{a.label}</div>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <h2 style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>Recent Transactions</h2>
          <button onClick={()=>nav('/transactions')} style={{background:'none',border:'none',color:'var(--blue)',cursor:'pointer',fontWeight:600,fontSize:14,fontFamily:'var(--font)'}}>View All →</button>
        </div>
        {txns.length===0?<div className="empty-state"><div className="empty-icon">📭</div><p>No transactions yet</p></div>:
        txns.map(txn=>{
          const isSender=txn.sender?._id===user?.id||txn.sender?._id?.toString()===user?.id;
          const isTopup=txn.type==='topup';
          const other=isSender?txn.receiver:txn.sender;
          return(
            <div key={txn._id} className="txn-item">
              <div className="txn-avatar" style={{background:isSender&&!isTopup?'#FEE2E2':'#D1FAE5',color:isSender&&!isTopup?'#DC2626':'#059669'}}>
                {isTopup?'💰':getInitials(other?.name||'U')}
              </div>
              <div className="txn-info">
                <div className="txn-name">{isTopup?'Wallet Top-up':other?.name||'Unknown'}</div>
                <div className="txn-date">{formatDateTime(txn.createdAt)}<span style={{margin:'0 6px',fontFamily:'var(--mono)',fontSize:11}}>{txn.transactionId}</span></div>
              </div>
              <div className={`txn-amount ${isSender&&!isTopup?'debit':'credit'}`}>
                {isSender&&!isTopup?'-':'+'}{formatCurrency(txn.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
