import React,{useState} from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
export default function Register(){
  const[form,setForm]=useState({name:'',email:'',password:'',phone:'',role:'user'});
  const[loading,setLoading]=useState(false);
  const{register}=useAuth(); const nav=useNavigate();
  const handle=async e=>{ e.preventDefault(); if(form.password.length<6)return toast.error('Password min 6 chars'); setLoading(true); try{ await register(form); toast.success('Account created!'); nav('/dashboard'); }catch(e){ toast.error(e.response?.data?.message||'Failed'); }finally{setLoading(false);} };
  return(
    <div style={{minHeight:'100vh',background:'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-20%',right:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(30,79,216,.3),transparent 70%)',borderRadius:'50%'}}/>
      <div style={{width:'100%',maxWidth:460,position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{width:54,height:54,background:'linear-gradient(135deg,#1E4FD8,#00D4FF)',borderRadius:16,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:12}}>💸</div>
          <h1 style={{color:'white',fontSize:26,fontWeight:800}}>Create Account</h1>
        </div>
        <div style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',borderRadius:24,padding:30,border:'1px solid rgba(255,255,255,.1)'}}>
          <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:14}}>
            {[['name','Full Name','text','John Doe'],['email','Email','email','john@example.com'],['phone','Phone','tel','+91 98765 43210'],['password','Password (min 6)','password','••••••']].map(([k,l,t,ph])=>(
              <div key={k} className="input-group">
                <label style={{color:'rgba(255,255,255,.55)'}}>{l}</label>
                <input className="input-field" type={t} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required={k!=='phone'} style={{background:'rgba(255,255,255,.08)',borderColor:'rgba(255,255,255,.15)',color:'white'}}/>
              </div>
            ))}
            <div className="input-group">
              <label style={{color:'rgba(255,255,255,.55)'}}>Account Type</label>
              <select className="input-field" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{background:'rgba(255,255,255,.08)',borderColor:'rgba(255,255,255,.15)',color:'white'}}>
                <option value="user" style={{background:'#0A1628'}}>👤 Regular User</option>
                <option value="merchant" style={{background:'#0A1628'}}>🏪 Merchant</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{width:'100%',marginTop:6,background:'linear-gradient(135deg,#1E4FD8,#3B82F6)'}}>
              {loading?'Creating...':'Create Account →'}
            </button>
          </form>
          <p style={{textAlign:'center',marginTop:18,color:'rgba(255,255,255,.5)',fontSize:14}}>
            Have account? <Link to="/login" style={{color:'var(--accent)',fontWeight:600}}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
