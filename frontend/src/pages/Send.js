import React,{useState} from 'react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Send(){
  const[step,setStep]=useState(1);
  const[search,setSearch]=useState('');
  const[results,setResults]=useState([]);
  const[selected,setSelected]=useState(null);
  const[amount,setAmount]=useState('');
  const[note,setNote]=useState('');
  const[loading,setLoading]=useState(false);
  const[success,setSuccess]=useState(null);
  const[otp,setOtp]=useState('');
  const[requireOtp,setRequireOtp]=useState(false);

  const searchUsers=async q=>{ setSearch(q); if(!q)return setResults([]); try{ const r=await api.get('/users/search?q='+q); setResults(r.data.users); }catch{} };
  const handleSend=async(otpConfirmed=false)=>{
    if(!amount||amount<=0)return toast.error('Enter valid amount');
    setLoading(true);
    try{
      const r=await api.post('/transactions/send',{receiverEmail:selected.email,amount:parseFloat(amount),note,otpConfirmed});
      setSuccess(r.data.transaction); setStep(3); toast.success('Money sent!');
    }catch(e){
      if(e.response?.data?.requireOTP){ setRequireOtp(true); toast('Enter OTP to confirm large transfer',{icon:'🔐'}); }
      else toast.error(e.response?.data?.message||'Failed');
    }finally{setLoading(false);}
  };
  const handleOtp=()=>{ if(otp==='123456'||otp.length===6){ handleSend(true); setRequireOtp(false); }else toast.error('Invalid OTP'); };
  const reset=()=>{ setStep(1);setSearch('');setResults([]);setSelected(null);setAmount('');setNote('');setSuccess(null);setRequireOtp(false);setOtp(''); };
  const presets=[100,200,500,1000,2000];
  const{formatDateTime}=require('../utils/helpers');

  return(
    <div>
      <div className="page-header"><h1>Send Money</h1><p>Instant peer-to-peer transfers</p></div>
      <div style={{maxWidth:540}}>
        <div className="tab-bar" style={{marginBottom:28}}>
          {['Select Recipient','Enter Amount','Success'].map((s,i)=>(
            <div key={s} className={`tab-btn ${step===i+1?'active':''}`} style={{color:step>i+1?'var(--success)':undefined}}>{step>i+1?'✓ ':''}{s}</div>
          ))}
        </div>

        {step===1&&(
          <div className="card">
            <h3 style={{marginBottom:18,fontSize:16,fontWeight:700}}>🔍 Find Recipient</h3>
            <div className="input-group" style={{marginBottom:14}}><label>Search by name or email</label>
              <input className="input-field" placeholder="Type to search..." value={search} onChange={e=>searchUsers(e.target.value)}/>
            </div>
            {results.length>0&&<div style={{border:'2px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
              {results.map(u=>(
                <div key={u._id} onClick={()=>{setSelected(u);setStep(2);}} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',cursor:'pointer',borderBottom:'1px solid var(--border)',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='var(--gray-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>{u.name?.[0]?.toUpperCase()}</div>
                  <div><div style={{fontWeight:600,color:'var(--text)'}}>{u.name}</div><div style={{fontSize:13,color:'var(--text-secondary)'}}>{u.email}</div></div>
                  <span className="badge badge-blue" style={{marginLeft:'auto'}}>{u.role}</span>
                </div>
              ))}
            </div>}
            {search&&results.length===0&&<p style={{color:'var(--gray-400)',textAlign:'center',padding:'24px 0'}}>No users found</p>}
          </div>
        )}

        {step===2&&selected&&!requireOtp&&(
          <div className="card">
            <div style={{display:'flex',alignItems:'center',gap:12,padding:14,background:'var(--gray-100)',borderRadius:12,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:17}}>{selected.name?.[0]?.toUpperCase()}</div>
              <div><div style={{fontWeight:700,fontSize:15,color:'var(--text)'}}>{selected.name}</div><div style={{color:'var(--text-secondary)',fontSize:13}}>{selected.email}</div></div>
              <button onClick={()=>setStep(1)} style={{marginLeft:'auto',background:'none',border:'none',color:'var(--gray-400)',cursor:'pointer',fontSize:18}}>✕</button>
            </div>
            <div className="input-group" style={{marginBottom:14}}>
              <label>Amount (₹)</label>
              <input className="input-field" type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)} min="1" style={{fontSize:24,fontFamily:'var(--mono)',fontWeight:700}}/>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>{presets.map(p=><button key={p} onClick={()=>setAmount(p)} className="btn btn-sm btn-outline">{formatCurrency(p)}</button>)}</div>
            <div className="input-group" style={{marginBottom:20}}>
              <label>Note (optional)</label>
              <input className="input-field" placeholder="What's this for?" value={note} onChange={e=>setNote(e.target.value)}/>
            </div>
            {parseFloat(amount)>=50000&&<div style={{background:'#FEF3C7',border:'1px solid #F59E0B',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#92400E'}}>⚠️ Large transfer — OTP confirmation may be required</div>}
            <button className="btn btn-primary" style={{width:'100%'}} onClick={()=>handleSend(false)} disabled={loading}>
              {loading?'Sending...':amount?'Send '+formatCurrency(amount)+' →':'Send →'}
            </button>
          </div>
        )}

        {requireOtp&&(
          <div className="card">
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{fontSize:48,marginBottom:12}}>🔐</div>
              <h3 style={{fontSize:18,fontWeight:800,color:'var(--text)'}}>OTP Confirmation</h3>
              <p style={{color:'var(--text-secondary)',marginTop:6}}>Enter 6-digit OTP to confirm this large transfer</p>
              <p style={{fontSize:12,color:'var(--gray-400)',marginTop:4}}>(Demo OTP: 123456)</p>
            </div>
            <div className="input-group" style={{marginBottom:20}}>
              <label>Enter OTP</label>
              <input className="input-field" placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} style={{fontSize:24,letterSpacing:8,textAlign:'center',fontFamily:'var(--mono)'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" onClick={handleOtp} style={{flex:1}}>Confirm Transfer</button>
              <button className="btn btn-outline" onClick={()=>{setRequireOtp(false);setOtp('');}} style={{flex:1}}>Cancel</button>
            </div>
          </div>
        )}

        {step===3&&success&&(
          <div className="card" style={{textAlign:'center'}}>
            <div style={{width:72,height:72,background:'#D1FAE5',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 18px'}}>✅</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'var(--success)',marginBottom:6}}>Transfer Successful!</h2>
            <div style={{background:'var(--gray-100)',borderRadius:12,padding:18,marginBottom:24,textAlign:'left'}}>
              {[['TXN ID',success.transactionId],['Amount',formatCurrency(success.amount)],['To',success.receiver?.name],['Status',success.status]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:14}}>
                  <span style={{color:'var(--text-secondary)'}}>{k}</span>
                  <span style={{fontWeight:600,color:'var(--text)',fontFamily:k==='TXN ID'?'var(--mono)':'var(--font)'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" onClick={reset} style={{flex:1}}>Send Another</button>
              <a href={'/api/receipts/'+success.transactionId} target="_blank" rel="noreferrer" className="btn btn-outline" style={{flex:1}}>📄 Receipt</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
