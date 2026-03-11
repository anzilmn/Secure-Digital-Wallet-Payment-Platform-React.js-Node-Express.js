import React,{useEffect,useState} from 'react';
import { LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,PieChart,Pie,Cell } from 'recharts';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const COLORS=['#1E4FD8','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];

export default function Analytics(){
  const[data,setData]=useState(null); const[loading,setLoading]=useState(true); const[period,setPeriod]=useState('daily');
  useEffect(()=>{ api.get('/analytics/overview').then(r=>setData(r.data)).finally(()=>setLoading(false)); },[]);
  if(loading)return<div className="loading"><div className="spinner"/></div>;

  const totalSent=data?.monthly?.reduce((a,m)=>a+m.sent,0)||0;
  const totalRecv=data?.monthly?.reduce((a,m)=>a+m.received,0)||0;
  const pieData=[{name:'Sent',value:totalSent},{name:'Received',value:totalRecv}];

  const fmt=v=>'₹'+Number(v).toLocaleString('en-IN');
  const CustomTip=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',boxShadow:'0 4px 20px rgba(0,0,0,.1)'}}>
      <p style={{fontWeight:700,marginBottom:6,color:'var(--text)'}}>{label}</p>
      {payload.map(p=><p key={p.name} style={{color:p.color,fontSize:13}}>{p.name}: {fmt(p.value)}</p>)}
    </div>);
  };

  return(
    <div>
      <div className="page-header"><h1>📊 Payment Analytics</h1><p>Insights into your financial activity</p></div>

      {/* Summary Cards */}
      <div className="grid-4" style={{marginBottom:28}}>
        {[
          {label:'6-Month Sent',value:formatCurrency(totalSent),icon:'↗️',color:'blue'},
          {label:'6-Month Received',value:formatCurrency(totalRecv),icon:'↙️',color:'success'},
          {label:'Net Flow',value:formatCurrency(totalRecv-totalSent),icon:'⚖️',color:'gold'},
          {label:'Avg/Month',value:formatCurrency((totalSent+totalRecv)/6),icon:'📈',color:'accent'},
        ].map(s=>(
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon" style={{background:'var(--gray-100)'}}>{s.icon}</div>
            <div className="stat-value" style={{fontSize:20}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Period Toggle */}
      <div className="tab-bar" style={{maxWidth:300,marginBottom:20}}>
        {[['daily','Last 30 Days'],['monthly','6 Months']].map(([k,v])=>(
          <button key={k} className={`tab-btn ${period===k?'active':''}`} onClick={()=>setPeriod(k)}>{v}</button>
        ))}
      </div>

      {/* Line/Bar Chart */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{fontWeight:700,fontSize:16,marginBottom:20,color:'var(--text)'}}>Transaction Volume — {period==='daily'?'Last 30 Days':'Last 6 Months'}</h3>
        <ResponsiveContainer width="100%" height={280}>
          {period==='daily'?(
            <LineChart data={data?.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="date" tick={{fontSize:11,fill:'var(--text-secondary)'}} tickFormatter={d=>d.slice(5)}/>
              <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}} tickFormatter={v=>'₹'+v}/>
              <Tooltip content={<CustomTip/>}/>
              <Legend/>
              <Line type="monotone" dataKey="sent" stroke="#EF4444" strokeWidth={2} dot={false} name="Sent"/>
              <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} dot={false} name="Received"/>
            </LineChart>
          ):(
            <BarChart data={data?.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-secondary)'}}/>
              <YAxis tick={{fontSize:11,fill:'var(--text-secondary)'}} tickFormatter={v=>'₹'+v}/>
              <Tooltip content={<CustomTip/>}/>
              <Legend/>
              <Bar dataKey="sent" fill="#EF4444" radius={[4,4,0,0]} name="Sent"/>
              <Bar dataKey="received" fill="#10B981" radius={[4,4,0,0]} name="Received"/>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{fontWeight:700,fontSize:16,marginBottom:20,color:'var(--text)'}}>Sent vs Received</h3>
          {totalSent===0&&totalRecv===0?<div className="empty-state" style={{padding:40}}><p>No data yet</p></div>:(
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>name+': '+formatCurrency(value)}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip formatter={v=>formatCurrency(v)}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Type Breakdown */}
        <div className="card">
          <h3 style={{fontWeight:700,fontSize:16,marginBottom:20,color:'var(--text)'}}>Transaction Types</h3>
          {!data?.typeBreakdown?.length?<div className="empty-state" style={{padding:40}}><p>No data yet</p></div>:
          data.typeBreakdown.map((t,i)=>(
            <div key={t._id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:12,height:12,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:14,color:'var(--text)',textTransform:'capitalize'}}>{t._id}</span>
                  <span style={{fontSize:13,color:'var(--text-secondary)'}}>{t.count} txns</span>
                </div>
                <div style={{background:'var(--gray-100)',borderRadius:4,height:6,overflow:'hidden'}}>
                  <div style={{background:COLORS[i%COLORS.length],height:'100%',borderRadius:4,width:Math.min(100,(t.total/Math.max(...data.typeBreakdown.map(x=>x.total)))*100)+'%'}}/>
                </div>
              </div>
              <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color:'var(--text)',minWidth:80,textAlign:'right'}}>{formatCurrency(t.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
