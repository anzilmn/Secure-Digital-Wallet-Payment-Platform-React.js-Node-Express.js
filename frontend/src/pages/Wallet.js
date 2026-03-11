import React,{useEffect,useState} from 'react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Wallet(){
  const[wallet,setWallet]=useState(null);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(null);
  const[amount,setAmount]=useState('');
  const[sub,setSub]=useState(false);
  const fetch=()=>api.get('/wallet').then(r=>setWallet(r.data.wallet)).finally(()=>setLoading(false));
  useEffect(()=>{fetch();},[]);
  const handle=async type=>{ if(!amount||amount<=0)return toast.error('Enter valid amount'); setSub(true); try{ await api.post('/wallet/'+type,{amount:parseFloat(amount)}); toast.success(type==='add-money'?'Money added!':'Withdrawn!'); setModal(null);setAmount('');fetch(); }catch(e){ toast.error(e.response?.data?.message||'Failed'); }finally{setSub(false);} };
  const presets=[100,500,1000,2000,5000,10000];
  if(loading)return<div className="loading"><div className="spinner"/></div>;
  return(
    <div>
      <div className="page-header"><h1>My Wallet</h1><p>Manage your balance</p></div>
      <div style={{background:'linear-gradient(135deg,#0A1628,#1a3a6b,#1E4FD8)',borderRadius:24,padding:'36px',marginBottom:24,boxShadow:'0 20px 60px rgba(10,22,40,.25)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-40%',right:'5%',width:260,height:260,background:'radial-gradient(circle,rgba(0,212,255,.12),transparent)',borderRadius:'50%'}}/>
        <div style={{color:'rgba(255,255,255,.55)',fontSize:12,fontWeight:600,letterSpacing:2,marginBottom:6}}>AVAILABLE BALANCE</div>
        <div style={{color:'white',fontSize:48,fontWeight:800,fontFamily:'var(--mono)',letterSpacing:'-2px',marginBottom:24}}>{formatCurrency(wallet?.balance)}</div>
        <div style={{display:'flex',gap:12}}>
          <button className="btn" onClick={()=>setModal('add-money')} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.2)',color:'white'}}>➕ Add Money</button>
          <button className="btn" onClick={()=>setModal('withdraw')}  style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.8)'}}>💸 Withdraw</button>
        </div>
      </div>
      <div className="grid-3" style={{marginBottom:24}}>
        {[{label:'Total Sent',value:wallet?.totalSent,icon:'↗️',color:'#EF4444'},{label:'Total Received',value:wallet?.totalReceived,icon:'↙️',color:'#10B981'},{label:'Currency',value:wallet?.currency,icon:'🏦',color:'#1E4FD8'}].map(s=>(
          <div key={s.label} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:30,marginBottom:10}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:'var(--mono)',color:s.color}}>{s.label==='Currency'?s.value:formatCurrency(s.value)}</div>
            <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
      {modal&&(
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>{modal==='add-money'?'➕ Add Money':'💸 Withdraw'}</h2>
            <div className="input-group" style={{marginBottom:14}}>
              <label>Amount (₹)</label>
              <input className="input-field" type="number" placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)} min="1"/>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
              {presets.map(p=><button key={p} onClick={()=>setAmount(p)} className="btn btn-sm btn-outline">{formatCurrency(p)}</button>)}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" disabled={sub} onClick={()=>handle(modal)} style={{flex:1}}>{sub?'Processing...':'Confirm'}</button>
              <button className="btn btn-outline" onClick={()=>{setModal(null);setAmount('');}} style={{flex:1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
