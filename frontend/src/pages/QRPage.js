import React,{useState,useEffect,useRef} from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/helpers';

export default function QRPage(){
  const{user}=useAuth(); const nav=useNavigate();
  const[tab,setTab]=useState('generate');
  const[amount,setAmount]=useState('');
  const[qrValue,setQrValue]=useState('');
  const[scanResult,setScanResult]=useState(null);
  const videoRef=useRef(); const scannerRef=useRef();

  // Generate QR payload
  useEffect(()=>{
    if(user){
      const payload=JSON.stringify({userId:user.id,email:user.email,name:user.name,amount:amount||null});
      setQrValue(payload);
    }
  },[user,amount]);

  const startScan=async()=>{
    try{
      const QrScanner=(await import('qr-scanner')).default;
      if(videoRef.current){
        scannerRef.current=new QrScanner(videoRef.current, result=>{
          try{
            const data=JSON.parse(result.data);
            setScanResult(data);
            scannerRef.current?.stop();
          }catch{ toast.error('Invalid QR code'); }
        },{preferredCamera:'environment'});
        await scannerRef.current.start();
      }
    }catch(e){ toast.error('Camera not available: '+e.message); }
  };
  useEffect(()=>()=>scannerRef.current?.stop(),[]);

  const payFromQr=async()=>{
    if(!scanResult)return;
    nav('/send',{state:{prefill:{email:scanResult.email,amount:scanResult.amount}}});
  };

  return(
    <div>
      <div className="page-header"><h1>📷 QR Payments</h1><p>Generate or scan QR codes to pay instantly</p></div>
      <div style={{maxWidth:520}}>
        <div className="tab-bar" style={{marginBottom:28}}>
          {[['generate','📲 My QR'],['scan','🔍 Scan QR']].map(([k,v])=>(
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
          ))}
        </div>

        {tab==='generate'&&(
          <div className="card" style={{textAlign:'center'}}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:20,color:'var(--text)'}}>Your Payment QR Code</h3>
            <div style={{display:'inline-block',padding:20,background:'white',borderRadius:20,boxShadow:'0 8px 30px rgba(0,0,0,.12)',marginBottom:20}}>
              {qrValue&&<QRCodeCanvas value={qrValue} size={220} fgColor="#0A1628" bgColor="#FFFFFF" level="H"/>}
            </div>
            <div style={{fontWeight:700,fontSize:18,color:'var(--text)',marginBottom:4}}>{user?.name}</div>
            <div style={{color:'var(--text-secondary)',fontSize:14,marginBottom:20}}>{user?.email}</div>
            <div className="input-group" style={{maxWidth:260,margin:'0 auto 20px'}}>
              <label>Amount (optional)</label>
              <input className="input-field" type="number" placeholder="Any amount" value={amount} onChange={e=>setAmount(e.target.value)} min="0"/>
            </div>
            {amount&&<div style={{background:'#D1FAE5',borderRadius:10,padding:'10px 20px',marginBottom:16,color:'#065F46',fontWeight:700,fontFamily:'var(--mono)'}}>Fixed: {formatCurrency(amount)}</div>}
            <p style={{fontSize:12,color:'var(--gray-400)'}}>Share this QR for others to scan and pay you instantly</p>
          </div>
        )}

        {tab==='scan'&&(
          <div className="card" style={{textAlign:'center'}}>
            <h3 style={{fontSize:17,fontWeight:700,marginBottom:16,color:'var(--text)'}}>Scan QR Code</h3>
            {!scanResult?(
              <>
                <div style={{background:'var(--gray-100)',borderRadius:16,overflow:'hidden',marginBottom:16,position:'relative'}}>
                  <video ref={videoRef} style={{width:'100%',maxHeight:300,objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,border:'3px solid var(--blue)',borderRadius:16,pointerEvents:'none'}}/>
                </div>
                <button className="btn btn-primary" onClick={startScan} style={{width:'100%'}}>📷 Start Camera Scan</button>
                <p style={{fontSize:12,color:'var(--gray-400)',marginTop:12}}>Point your camera at a PayFlow QR code</p>
              </>
            ):(
              <div>
                <div style={{fontSize:52,marginBottom:16}}>✅</div>
                <h3 style={{fontWeight:800,color:'var(--text)',fontSize:18}}>QR Scanned!</h3>
                <div style={{background:'var(--gray-100)',borderRadius:12,padding:16,margin:'16px 0',textAlign:'left'}}>
                  <div style={{fontWeight:600,color:'var(--text)'}}>{scanResult.name}</div>
                  <div style={{color:'var(--text-secondary)',fontSize:13}}>{scanResult.email}</div>
                  {scanResult.amount&&<div style={{color:'var(--success)',fontWeight:700,fontFamily:'var(--mono)',marginTop:6}}>Amount: {formatCurrency(scanResult.amount)}</div>}
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-primary" onClick={payFromQr} style={{flex:1}}>💳 Pay Now</button>
                  <button className="btn btn-outline" onClick={()=>setScanResult(null)} style={{flex:1}}>Scan Again</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
