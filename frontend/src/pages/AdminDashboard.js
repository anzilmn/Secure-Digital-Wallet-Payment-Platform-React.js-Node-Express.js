import React,{useEffect,useState} from 'react';
import api from '../utils/api';
import { formatCurrency,formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';
export default function AdminDashboard(){
  const[data,setData]=useState(null); const[users,setUsers]=useState([]); const[txns,setTxns]=useState([]); const[loading,setLoading]=useState(true); const[tab,setTab]=useState('overview'); const[search,setSearch]=useState('');
  const fetch=async()=>{ try{ const[d,u,t]=await Promise.all([api.get('/admin/dashboard'),api.get('/admin/users?limit=50'),api.get('/admin/transactions?limit=25')]); setData(d.data); setUsers(u.data.users); setTxns(t.data.transactions); }finally{setLoading(false);} };
  useEffect(()=>{fetch();},[]);
  const block=async(id,bl)=>{ try{ await api.put('/admin/users/'+id+'/'+(bl?'block':'unblock')); toast.success(bl?'Blocked':'Unblocked'); fetch(); }catch{toast.error('Failed');} };
  if(loading)return<div className="loading"><div className="spinner"/></div>;
  const s=data?.stats; const fu=users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div className="page-header"><h1>🛡️ Admin Dashboard</h1><p>Platform overview and controls</p></div>
      <div className="grid-4" style={{marginBottom:28}}>
        {[{label:'Total Users',value:s?.totalUsers,icon:'👥',c:'blue'},{label:'Merchants',value:s?.totalMerchants,icon:'🏪',c:'success'},{label:'Transactions',value:s?.totalTransactions,icon:'📊',c:'gold'},{label:'Total Volume',value:formatCurrency(s?.totalVolume),icon:'💰',c:'accent'}].map(st=>(
          <div key={st.label} className={`stat-card ${st.c}`}><div className="stat-icon" style={{background:'var(--gray-100)'}}>{st.icon}</div><div className="stat-value">{st.value}</div><div className="stat-label">{st.label}</div></div>
        ))}
      </div>
      <div className="tab-bar" style={{marginBottom:24}}>
        {[['overview','📊 Overview'],['users','👥 Users'],['transactions','📋 Transactions']].map(([k,v])=>(
          <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
        ))}
      </div>
      {tab==='overview'&&(<div className="grid-2">
        <div className="card"><h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>Recent Transactions</h3>
          {data?.recentTransactions?.map(t=>(
            <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:14}}>
              <div><div style={{fontWeight:600,color:'var(--text)'}}>{t.sender?.name} → {t.receiver?.name}</div><div style={{fontSize:12,color:'var(--gray-400)'}}>{formatDateTime(t.createdAt)}</div></div>
              <span style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--blue)'}}>{formatCurrency(t.amount)}</span>
            </div>
          ))}
        </div>
        <div className="card"><h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>New Users</h3>
          {data?.recentUsers?.map(u=>(
            <div key={u._id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'var(--blue)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{u.name?.[0]}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14,color:'var(--text)'}}>{u.name}</div><div style={{fontSize:12,color:'var(--text-secondary)'}}>{u.email}</div></div>
              <span className="badge badge-blue" style={{fontSize:11}}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>)}
      {tab==='users'&&(<div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <h3 style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>All Users ({fu.length})</h3>
          <input className="input-field" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:240,padding:'9px 12px'}}/>
        </div>
        <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
        <tbody>{fu.map(u=>(
          <tr key={u._id}>
            <td style={{fontWeight:600,color:'var(--text)'}}>{u.name}</td>
            <td style={{color:'var(--text-secondary)',fontSize:13}}>{u.email}</td>
            <td><span className="badge badge-info">{u.role}</span></td>
            <td><span className={`badge ${u.isBlocked?'badge-danger':'badge-success'}`}>{u.isBlocked?'Blocked':'Active'}</span></td>
            <td style={{fontSize:13,color:'var(--gray-400)'}}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
            <td><button className={`btn btn-sm ${u.isBlocked?'btn-success':'btn-danger'}`} onClick={()=>block(u._id,!u.isBlocked)}>{u.isBlocked?'Unblock':'Block'}</button></td>
          </tr>
        ))}</tbody></table>
      </div>)}
      {tab==='transactions'&&(<div className="card">
        <h3 style={{fontWeight:700,fontSize:15,marginBottom:18,color:'var(--text)'}}>All Transactions</h3>
        <table><thead><tr><th>ID</th><th>Sender</th><th>Receiver</th><th>Amount</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>{txns.map(t=>(
          <tr key={t._id}>
            <td style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--gray-400)'}}>{t.transactionId}</td>
            <td style={{fontWeight:600,color:'var(--text)'}}>{t.sender?.name}</td>
            <td style={{fontWeight:600,color:'var(--text)'}}>{t.receiver?.name}</td>
            <td style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--text)'}}>{formatCurrency(t.amount)}</td>
            <td><span className="badge badge-info">{t.type}</span></td>
            <td><span className={`badge ${t.status==='completed'?'badge-success':'badge-danger'}`}>{t.status}</span></td>
            <td style={{fontSize:13,color:'var(--gray-400)'}}>{formatDateTime(t.createdAt)}</td>
          </tr>
        ))}</tbody></table>
      </div>)}
    </div>
  );
}
