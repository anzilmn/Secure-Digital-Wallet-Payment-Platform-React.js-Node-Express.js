import React,{useState,useEffect} from 'react';
import api from '../utils/api';
import { formatCurrency,formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Scheduled(){
  const[payments,setPayments]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(false);
  const[form,setForm]=useState({receiverEmail:'',amount:'',note:'',scheduledAt:''});
  const[sub,setSub]=useState(false);

  const fetch=()=>api.get('/scheduled/my').then(r=>setPayments(r.data.payments)).finally(()=>setLoading(false));
  useEffect(()=>{fetch();},[]);

  const create=async()=>{ if(!form.receiverEmail||!form.amount||!form.scheduledAt)return toast.error('All fields required'); setSub(true); try{ await api.post('/scheduled/create',{...form,amount:parseFloat(form.amount)}); toast.success('Scheduled!'); setModal(false);setForm({receiverEmail:'',amount:'',note:'',scheduledAt:''});fetch(); }catch(e){toast.error(e.response?.data?.message||'Failed');}finally{setSub(false);} };
  const cancel=async id=>{ try{ await api.delete('/scheduled/'+id); toast.success('Cancelled'); fetch(); }catch{toast.error('Failed');} };

  const statusColor={pending:'info',completed:'success',failed:'danger',cancelled:'warning'};
  const minDate=new Date(Date.now()+60000).toISOString().slice(0,16);

  return(
    <div>
      <div className="page-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div><h1>⏰ Scheduled Payments</h1><p>Automate future payments</p></div>
          <button className="btn btn-primary" onClick={()=>setModal(true)}>➕ Schedule Payment</button>
        </div>
      </div>

      {loading?<div className="loading"><div className="spinner"/></div>:
      payments.length===0?<div className="card"><div className="empty-state"><div className="empty-icon">⏰</div><p>No scheduled payments</p></div></div>:
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {payments.map(p=>(
          <div key={p._id} className="card" style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#8B5CF6,#EC4899)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>⏰</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'var(--text)'}}>Send <span style={{fontFamily:'var(--mono)',color:'var(--blue)'}}>{formatCurrency(p.amount)}</span> to {p.receiver?.name}</div>
              {p.note&&<div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>"{p.note}"</div>}
              <div style={{fontSize:12,color:'var(--gray-400)',marginTop:4}}>Scheduled: {formatDateTime(p.scheduledAt)}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
              <span className={`badge badge-${statusColor[p.status]}`}>{p.status}</span>
              {p.status==='pending'&&<button className="btn btn-sm btn-danger" onClick={()=>cancel(p._id)}>Cancel</button>}
            </div>
          </div>
        ))}
      </div>}

      {modal&&(
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>⏰ Schedule a Payment</h2>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="input-group"><label>Receiver Email</label><input className="input-field" placeholder="receiver@email.com" value={form.receiverEmail} onChange={e=>setForm({...form,receiverEmail:e.target.value})}/></div>
              <div className="input-group"><label>Amount (₹)</label><input className="input-field" type="number" placeholder="Enter amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} min="1"/></div>
              <div className="input-group"><label>Note</label><input className="input-field" placeholder="Optional note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div>
              <div className="input-group"><label>Schedule Date & Time</label><input className="input-field" type="datetime-local" min={minDate} value={form.scheduledAt} onChange={e=>setForm({...form,scheduledAt:e.target.value})}/></div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-primary" disabled={sub} onClick={create} style={{flex:1}}>{sub?'Scheduling...':'Schedule'}</button>
                <button className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
