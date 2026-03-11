import React,{useEffect,useState} from 'react';
import api from '../utils/api';
import { formatCurrency,formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';
export default function MerchantPanel(){
  const[requests,setRequests]=useState([]); const[loading,setLoading]=useState(true); const[modal,setModal]=useState(false); const[form,setForm]=useState({amount:'',description:''}); const[created,setCreated]=useState(null); const[sub,setSub]=useState(false);
  const fetch=()=>api.get('/payments/my-requests').then(r=>setRequests(r.data.requests)).finally(()=>setLoading(false));
  useEffect(()=>{fetch();},[]);
  const create=async e=>{ e.preventDefault(); if(!form.amount||form.amount<=0)return toast.error('Enter valid amount'); setSub(true); try{ const r=await api.post('/payments/create-request',{amount:parseFloat(form.amount),description:form.description}); setCreated(r.data.request); fetch(); }catch(e){toast.error(e.response?.data?.message||'Failed');}finally{setSub(false);} };
  const copy=link=>{ navigator.clipboard.writeText(window.location.origin+'/pay/'+link); toast.success('Link copied!'); };
  const sc={pending:'warning',paid:'success',expired:'danger'};
  return(
    <div>
      <div className="page-header"><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div><h1>🏪 Merchant Panel</h1><p>Create payment requests and links</p></div><button className="btn btn-primary" onClick={()=>{setModal(true);setCreated(null);setForm({amount:'',description:''});}}>➕ New Request</button></div></div>
      <div className="card">
        <h3 style={{fontWeight:700,fontSize:16,marginBottom:18,color:'var(--text)'}}>Payment Requests</h3>
        {loading?<div className="loading"><div className="spinner"/></div>:
        requests.length===0?<div className="empty-state"><div className="empty-icon">🧾</div><p>No requests yet</p></div>:
        <table><thead><tr><th>Order ID</th><th>Amount</th><th>Description</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>{requests.map(r=>(
          <tr key={r._id}>
            <td style={{fontFamily:'var(--mono)',fontWeight:600,fontSize:13}}>{r.orderId}</td>
            <td style={{fontWeight:700,fontFamily:'var(--mono)'}}>{formatCurrency(r.amount)}</td>
            <td style={{color:'var(--text-secondary)'}}>{r.description||'—'}</td>
            <td><span className={`badge badge-${sc[r.status]}`}>{r.status}</span></td>
            <td style={{color:'var(--gray-400)',fontSize:13}}>{formatDateTime(r.createdAt)}</td>
            <td>{r.status==='pending'&&<button className="btn btn-sm btn-outline" onClick={()=>copy(r.paymentLink)}>🔗 Copy</button>}{r.paidBy&&<div style={{fontSize:12,color:'var(--success)',marginTop:4}}>by {r.paidBy.name}</div>}</td>
          </tr>
        ))}</tbody></table>}
      </div>
      {modal&&(<div className="modal-overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        {!created?(<><h2>🧾 Create Payment Request</h2><form onSubmit={create} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="input-group"><label>Amount (₹)</label><input className="input-field" type="number" placeholder="Enter amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} min="1" required/></div>
          <div className="input-group"><label>Description</label><input className="input-field" placeholder="Product or service" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div style={{display:'flex',gap:10}}><button type="submit" disabled={sub} className="btn btn-primary" style={{flex:1}}>{sub?'Creating...':'Create'}</button><button type="button" className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1}}>Cancel</button></div>
        </form></>):(
          <div style={{textAlign:'center'}}><div style={{fontSize:48,marginBottom:14}}>✅</div><h2 style={{color:'var(--success)',marginBottom:8}}>Created!</h2>
          <div style={{background:'var(--gray-100)',borderRadius:12,padding:14,marginBottom:18,textAlign:'left'}}>
            <div style={{fontSize:12,color:'var(--text-secondary)',marginBottom:4}}>Payment Link</div>
            <div style={{fontFamily:'var(--mono)',fontSize:12,wordBreak:'break-all',color:'var(--blue)'}}>{window.location.origin}/pay/{created.paymentLink}</div>
          </div>
          <div style={{display:'flex',gap:10}}><button className="btn btn-primary" onClick={()=>copy(created.paymentLink)} style={{flex:1}}>🔗 Copy</button><button className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1}}>Done</button></div>
          </div>
        )}
      </div></div>)}
    </div>
  );
}
