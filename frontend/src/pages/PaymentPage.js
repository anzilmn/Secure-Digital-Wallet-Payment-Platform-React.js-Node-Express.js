import React,{useEffect,useState} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
export default function PaymentPage(){
  const{link}=useParams(); const{user}=useAuth(); const nav=useNavigate();
  const[request,setRequest]=useState(null); const[loading,setLoading]=useState(true); const[paying,setPaying]=useState(false); const[paid,setPaid]=useState(false);
  useEffect(()=>{ api.get('/payments/link/'+link).then(r=>{setRequest(r.data.request);if(r.data.alreadyPaid)setPaid(true);}).catch(()=>{}).finally(()=>setLoading(false)); },[link]);
  const pay=async()=>{ if(!user){toast.error('Login to pay');return nav('/login');} setPaying(true); try{ await api.post('/payments/pay/'+request._id); setPaid(true); toast.success('Payment successful!'); }catch(e){toast.error(e.response?.data?.message||'Failed');}finally{setPaying(false);} };
  if(loading)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--navy)'}}><div className="spinner" style={{borderTopColor:'white'}}/></div>;
  return(
    <div style={{minHeight:'100vh',background:'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{width:52,height:52,background:'linear-gradient(135deg,#1E4FD8,#00D4FF)',borderRadius:16,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:10}}>💸</div>
          <h1 style={{color:'white',fontSize:22,fontWeight:800}}>PayFlow</h1>
        </div>
        {!request?(
          <div style={{background:'rgba(255,255,255,.06)',borderRadius:22,padding:28,textAlign:'center',border:'1px solid rgba(255,255,255,.1)'}}>
            <div style={{fontSize:44,marginBottom:12}}>❌</div><h2 style={{color:'white',fontSize:18,fontWeight:700}}>Link Not Found</h2>
          </div>
        ):paid?(
          <div style={{background:'rgba(255,255,255,.06)',borderRadius:22,padding:28,textAlign:'center',border:'1px solid rgba(16,185,129,.3)'}}>
            <div style={{fontSize:52,marginBottom:12}}>✅</div><h2 style={{color:'#6EE7B7',fontSize:20,fontWeight:800}}>Payment Complete!</h2>
            <p style={{color:'rgba(255,255,255,.5)',marginTop:8}}>{formatCurrency(request.amount)} paid to {request.merchant?.name}</p>
            {user&&<button className="btn btn-primary" style={{marginTop:18,width:'100%'}} onClick={()=>nav('/dashboard')}>Dashboard</button>}
          </div>
        ):(
          <div style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',borderRadius:22,padding:28,border:'1px solid rgba(255,255,255,.1)'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{color:'rgba(255,255,255,.5)',fontSize:13,marginBottom:6}}>Request from</div>
              <div style={{color:'white',fontWeight:800,fontSize:20}}>{request.merchant?.name}</div>
            </div>
            <div style={{background:'rgba(255,255,255,.08)',borderRadius:14,padding:18,marginBottom:22}}>
              {[['Order ID',request.orderId,true],['Amount',formatCurrency(request.amount),true],['Description',request.description||'—',false]].map(([k,v,mono])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.08)',fontSize:14}}>
                  <span style={{color:'rgba(255,255,255,.5)'}}>{k}</span>
                  <span style={{color:'white',fontWeight:700,fontFamily:mono?'var(--mono)':'var(--font)'}}>{v}</span>
                </div>
              ))}
            </div>
            {user?(
              <button className="btn btn-lg" style={{width:'100%',background:'linear-gradient(135deg,#10B981,#059669)',color:'white',fontSize:16}} onClick={pay} disabled={paying}>
                {paying?'Processing...':'💳 Pay '+formatCurrency(request.amount)}
              </button>
            ):(
              <div style={{textAlign:'center'}}>
                <p style={{color:'rgba(255,255,255,.5)',marginBottom:14,fontSize:13}}>Login to complete payment</p>
                <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={()=>nav('/login')}>Login to Pay</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
