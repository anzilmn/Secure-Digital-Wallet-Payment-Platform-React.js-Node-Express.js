import React,{useState} from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';

export default function Profile(){
  const{user,refreshUser,theme,toggleTheme}=useAuth();
  const[form,setForm]=useState({name:user?.name||'',phone:user?.phone||''});
  const[saving,setSaving]=useState(false);
  const handleProfile=async e=>{ e.preventDefault(); setSaving(true); try{ await api.put('/users/profile',form); await refreshUser(); toast.success('Profile updated!'); }catch(e){toast.error(e.response?.data?.message||'Failed');}finally{setSaving(false);} };
  const handleAvatar=async e=>{ const file=e.target.files[0]; if(!file)return; const fd=new FormData(); fd.append('avatar',file); try{ await api.post('/users/avatar',fd,{headers:{'Content-Type':'multipart/form-data'}}); await refreshUser(); toast.success('Avatar updated!'); }catch{toast.error('Failed');} };
  const roleC={user:'#1E4FD8',merchant:'#059669',admin:'#DC2626'};
  return(
    <div>
      <div className="page-header"><h1>Profile Settings</h1><p>Manage your account</p></div>
      <div className="grid-2" style={{maxWidth:900}}>
        <div className="card" style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{textAlign:'center'}}>
            <div style={{position:'relative',display:'inline-block',marginBottom:14}}>
              <div style={{width:90,height:90,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,color:'white',fontWeight:700,overflow:'hidden'}}>
                {user?.avatar?<img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:getInitials(user?.name)}
              </div>
              <label htmlFor="av-up" style={{position:'absolute',bottom:0,right:0,width:30,height:30,background:'var(--blue)',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>📷</label>
              <input id="av-up" type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatar}/>
            </div>
            <div style={{fontWeight:800,fontSize:20,color:'var(--text)'}}>{user?.name}</div>
            <div style={{fontSize:14,color:'var(--text-secondary)',marginTop:2}}>{user?.email}</div>
            <span className="badge" style={{marginTop:8,background:roleC[user?.role]+'22',color:roleC[user?.role],fontWeight:700}}>{user?.role?.toUpperCase()}</span>
          </div>
          <form onSubmit={handleProfile} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="input-group"><label>Full Name</label><input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div className="input-group"><label>Phone</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210"/></div>
            <div className="input-group"><label>Email</label><input className="input-field" value={user?.email} disabled style={{opacity:.6}}/></div>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving?'Saving...':'Save Changes'}</button>
          </form>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div className="card">
            <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>🔐 Account Info</h3>
            {[['Status',user?.isBlocked?'🔴 Blocked':'🟢 Active'],['Verified',user?.isVerified?'✅ Yes':'❌ No'],['Role',user?.role],['Member Since',new Date(user?.createdAt||Date.now()).toLocaleDateString('en-IN',{month:'long',year:'numeric'})]].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:14}}>
                <span style={{color:'var(--text-secondary)'}}>{k}</span>
                <span style={{fontWeight:600,color:'var(--text)'}}>{v}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{fontWeight:700,fontSize:15,marginBottom:14,color:'var(--text)'}}>🌙 Appearance</h3>
            <button onClick={toggleTheme} className="btn" style={{width:'100%',background:'var(--gray-100)',color:'var(--text)',border:'2px solid var(--border)'}}>
              {theme==='dark'?'☀️ Switch to Light Mode':'🌙 Switch to Dark Mode'}
            </button>
          </div>
          {user?.merchantId&&(
            <div className="card" style={{background:'linear-gradient(135deg,#0A1628,#1E4FD8)',color:'white'}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,.55)',marginBottom:6}}>🏪 MERCHANT ID</div>
              <div style={{fontFamily:'var(--mono)',fontSize:18,fontWeight:700,letterSpacing:2}}>{user.merchantId}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
