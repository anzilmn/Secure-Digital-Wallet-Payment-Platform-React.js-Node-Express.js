import React,{useState} from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login(){
  const[form,setForm]=useState({email:'',password:''});
  const[loading,setLoading]=useState(false);
  const{login}=useAuth(); const nav=useNavigate();
  const handle=async e=>{ e.preventDefault(); setLoading(true); try{ const u=await login(form.email,form.password); toast.success('Welcome back, '+u.name+'!'); nav('/dashboard'); }catch(e){ toast.error(e.response?.data?.message||'Login failed'); }finally{setLoading(false);} };
  return(
    <div style={{minHeight:'100vh',background:'var(--navy)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0}}>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(30,79,216,.3),transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-10%',left:'-10%',width:500,height:500,background:'radial-gradient(circle,rgba(0,212,255,.15),transparent 70%)',borderRadius:'50%'}}/>
      </div>
      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:60,height:60,background:'linear-gradient(135deg,#1E4FD8,#00D4FF)',borderRadius:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:14,boxShadow:'0 8px 32px rgba(30,79,216,.4)'}}>💸</div>
          <h1 style={{color:'white',fontSize:30,fontWeight:800,letterSpacing:'-1px'}}>PayFlow v2</h1>
          <p style={{color:'rgba(255,255,255,.5)',fontSize:14,marginTop:6}}>Advanced Payment Platform</p>
        </div>
        <div style={{background:'rgba(255,255,255,.06)',backdropFilter:'blur(20px)',borderRadius:24,padding:32,border:'1px solid rgba(255,255,255,.1)'}}>
          <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:18}}>
            {[['email','Email or "admin"','text'],['password','Password','password']].map(([k,ph,t])=>(
              <div key={k} className="input-group">
                <label style={{color:'rgba(255,255,255,.55)'}}>{k.charAt(0).toUpperCase()+k.slice(1)}</label>
                <input className="input-field" type={t} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} required style={{background:'rgba(255,255,255,.08)',borderColor:'rgba(255,255,255,.15)',color:'white'}}/>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{width:'100%',marginTop:6,background:'linear-gradient(135deg,#1E4FD8,#3B82F6)'}}>
              {loading?'Signing in...':'Sign In →'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:18,padding:14,background:'rgba(255,255,255,.04)',borderRadius:10}}>
            <p style={{color:'rgba(255,255,255,.35)',fontSize:11,fontFamily:'var(--mono)'}}>Admin: username=admin · password=admin</p>
          </div>
          <p style={{textAlign:'center',marginTop:18,color:'rgba(255,255,255,.5)',fontSize:14}}>
            No account? <Link to="/register" style={{color:'var(--accent)',fontWeight:600}}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
