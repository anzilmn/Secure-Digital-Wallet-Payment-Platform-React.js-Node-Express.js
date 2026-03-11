import React,{useState,useEffect} from 'react';
import api from '../utils/api';
import { formatCurrency,formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function MoneyRequests(){
  const[tab,setTab]=useState('incoming');
  const[incoming,setIncoming]=useState([]);
  const[outgoing,setOutgoing]=useState([]);
  const[modal,setModal]=useState(false);
  const[form,setForm]=useState({payerEmail:'',amount:'',note:''});
  const[loading,setLoading]=useState(true);
  const[sub,setSub]=useState(false);

  const fetchAll=async()=>{ const[i,o]=await Promise.all([api.get('/requests/incoming'),api.get('/requests/outgoing')]); setIncoming(i.data.requests); setOutgoing(o.data.requests); setLoading(false); };
  useEffect(()=>{fetchAll();},[]);

  const createReq=async()=>{ if(!form.payerEmail||!form.amount||form.amount<=0)return toast.error('Fill all fields'); setSub(true); try{ await api.post('/requests/create',{...form,amount:parseFloat(form.amount)}); toast.success('Request sent!'); setModal(false);setForm({payerEmail:'',amount:'',note:''});fetchAll(); }catch(e){toast.error(e.response?.data?.message||'Failed');}finally{setSub(false);} };
  const accept=async id=>{ try{ await api.post('/requests/'+id+'/accept'); toast.success('Payment sent!'); fetchAll(); }catch(e){toast.error(e.response?.data?.message||'Failed');} };
  const decline=async id=>{ try{ await api.post('/requests/'+id+'/decline'); toast.success('Declined'); fetchAll(); }catch{} };

  const statusColor={pending:'warning',paid:'success',declined:'danger'};

  return(
    <div>
      <div className="page-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><h1>🤝 Money Requests</h1><p>Request and manage money between users</p></div>
          <button className="btn btn-primary" onClick={()=>setModal(true)}>➕ Request Money</button>
        </div>
      </div>

      <div className="tab-bar" style={{maxWidth:400,marginBottom:24}}>
        {[['incoming','📥 Incoming'],['outgoing','📤 Outgoing']].map(([k,v])=>(
          <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
        ))}
      </div>

      {loading?<div className="loading"><div className="spinner"/></div>:(
        <div>
          {tab==='incoming'&&(
            incoming.length===0?<div className="empty-state"><div className="empty-icon">📭</div><p>No pending requests</p></div>:
            incoming.map(r=>(
              <div key={r._id} className="card" style={{marginBottom:14,display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#F59E0B,#EF4444)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:18,flexShrink:0}}>{r.requester?.name?.[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'var(--text)'}}>{r.requester?.name} <span style={{color:'var(--text-secondary)',fontWeight:400}}>requested</span> <span style={{color:'var(--danger)',fontFamily:'var(--mono)',fontWeight:700}}>{formatCurrency(r.amount)}</span></div>
                  {r.note&&<div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>"{r.note}"</div>}
                  <div style={{fontSize:12,color:'var(--gray-400)',marginTop:2}}>{formatDateTime(r.createdAt)}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-sm btn-success" onClick={()=>accept(r._id)}>✅ Pay</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>decline(r._id)}>✕</button>
                </div>
              </div>
            ))
          )}
          {tab==='outgoing'&&(
            outgoing.length===0?<div className="empty-state"><div className="empty-icon">📤</div><p>No outgoing requests</p></div>:
            outgoing.map(r=>(
              <div key={r._id} className="card" style={{marginBottom:14,display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:18,flexShrink:0}}>{r.payer?.name?.[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:'var(--text)'}}>Requested <span style={{color:'var(--blue)',fontFamily:'var(--mono)',fontWeight:700}}>{formatCurrency(r.amount)}</span> from {r.payer?.name}</div>
                  {r.note&&<div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>"{r.note}"</div>}
                  <div style={{fontSize:12,color:'var(--gray-400)',marginTop:2}}>{formatDateTime(r.createdAt)}</div>
                </div>
                <span className={`badge badge-${statusColor[r.status]}`}>{r.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {modal&&(
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>🤝 Request Money</h2>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="input-group"><label>Payer Email</label><input className="input-field" placeholder="who@example.com" value={form.payerEmail} onChange={e=>setForm({...form,payerEmail:e.target.value})}/></div>
              <div className="input-group"><label>Amount (₹)</label><input className="input-field" type="number" placeholder="Enter amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} min="1"/></div>
              <div className="input-group"><label>Note (optional)</label><input className="input-field" placeholder="Reason for request" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-primary" disabled={sub} onClick={createReq} style={{flex:1}}>{sub?'Sending...':'Send Request'}</button>
                <button className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
