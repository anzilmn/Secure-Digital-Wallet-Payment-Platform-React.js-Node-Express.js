import React,{useEffect,useState} from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency,formatDateTime,getInitials } from '../utils/helpers';

export default function Transactions(){
  const{user}=useAuth();
  const[txns,setTxns]=useState([]); const[loading,setLoading]=useState(true); const[total,setTotal]=useState(0); const[page,setPage]=useState(1);
  const[filters,setFilters]=useState({type:'all',status:'',search:'',dateFrom:'',dateTo:'',amountMin:'',amountMax:''});
  const[showFilters,setShowFilters]=useState(false);

  const fetch=async()=>{ setLoading(true); const q=new URLSearchParams({page,limit:15,...Object.fromEntries(Object.entries(filters).filter(([,v])=>v&&v!=='all'))}); try{ const r=await api.get('/transactions?'+q); setTxns(r.data.transactions); setTotal(r.data.total); }catch{}finally{setLoading(false);} };
  useEffect(()=>{fetch();},[page,filters]);

  const upd=(k,v)=>{ setFilters(p=>({...p,[k]:v})); setPage(1); };
  const clear=()=>{ setFilters({type:'all',status:'',search:'',dateFrom:'',dateTo:'',amountMin:'',amountMax:''}); setPage(1); };
  const activeFilters=Object.values(filters).filter(v=>v&&v!=='all').length;
  const typeIcon={transfer:'↔️',topup:'💰',withdrawal:'💸',payment:'🛒',scheduled:'⏰',refund:'↩️'};

  return(
    <div>
      <div className="page-header"><h1>Transactions</h1><p>Complete payment history</p></div>

      {/* Filter Bar */}
      <div style={{background:'var(--surface)',borderRadius:16,padding:'16px 20px',marginBottom:20,border:'1px solid var(--border)'}}>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <input className="input-field" placeholder="🔍 Search TXN ID..." value={filters.search} onChange={e=>upd('search',e.target.value)} style={{flex:1,minWidth:180,padding:'10px 14px'}}/>
          {[['all','All'],['sent','Sent'],['received','Received']].map(([k,v])=>(
            <button key={k} onClick={()=>upd('type',k)} className={`btn btn-sm ${filters.type===k?'btn-primary':'btn-outline'}`}>{v}</button>
          ))}
          <button className="btn btn-sm btn-outline" onClick={()=>setShowFilters(!showFilters)}>
            🎛️ Filters {activeFilters>0&&<span style={{background:'var(--blue)',color:'white',borderRadius:'50%',width:18,height:18,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:11}}>{activeFilters}</span>}
          </button>
          {activeFilters>0&&<button className="btn btn-sm btn-danger" onClick={clear}>✕ Clear</button>}
          <span style={{color:'var(--text-secondary)',fontSize:13,marginLeft:'auto'}}>{total} results</span>
        </div>

        {showFilters&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
            <div className="input-group"><label>Status</label>
              <select className="input-field" value={filters.status} onChange={e=>upd('status',e.target.value)} style={{padding:'10px 12px'}}>
                <option value="">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option>
              </select>
            </div>
            <div className="input-group"><label>From Date</label><input className="input-field" type="date" value={filters.dateFrom} onChange={e=>upd('dateFrom',e.target.value)} style={{padding:'10px 12px'}}/></div>
            <div className="input-group"><label>To Date</label><input className="input-field" type="date" value={filters.dateTo} onChange={e=>upd('dateTo',e.target.value)} style={{padding:'10px 12px'}}/></div>
            <div className="input-group"><label>Min Amount</label><input className="input-field" type="number" placeholder="₹0" value={filters.amountMin} onChange={e=>upd('amountMin',e.target.value)} style={{padding:'10px 12px'}}/></div>
            <div className="input-group"><label>Max Amount</label><input className="input-field" type="number" placeholder="₹∞" value={filters.amountMax} onChange={e=>upd('amountMax',e.target.value)} style={{padding:'10px 12px'}}/></div>
          </div>
        )}
      </div>

      <div className="card">
        {loading?<div className="loading"><div className="spinner"/></div>:
        txns.length===0?<div className="empty-state"><div className="empty-icon">📭</div><p>No transactions match your filters</p></div>:
        <div>
          {txns.map(txn=>{
            const isSender=txn.sender?._id===user?.id||txn.sender?._id?.toString()===user?.id;
            const isTopup=txn.type==='topup', isWd=txn.type==='withdrawal';
            const other=isSender?txn.receiver:txn.sender;
            const isCredit=!isSender||isTopup;
            return(
              <div key={txn._id} className="txn-item">
                <div style={{width:44,height:44,borderRadius:'50%',flexShrink:0,background:isCredit?'#D1FAE5':'#FEE2E2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{typeIcon[txn.type]||'💳'}</div>
                <div className="txn-info">
                  <div className="txn-name">{isTopup?'Wallet Top-up':isWd?'Withdrawal':other?.name||'Unknown'}</div>
                  <div className="txn-date">
                    {formatDateTime(txn.createdAt)}<span style={{margin:'0 5px'}}>·</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--gray-400)'}}>{txn.transactionId}</span><span style={{margin:'0 5px'}}>·</span>
                    <span className={`badge ${txn.status==='completed'?'badge-success':txn.status==='failed'?'badge-danger':'badge-warning'}`} style={{fontSize:11}}>{txn.status}</span>
                  </div>
                  {txn.note&&<div style={{fontSize:12,color:'var(--gray-400)',marginTop:2}}>"{txn.note}"</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div className={`txn-amount ${isCredit?'credit':'debit'}`}>{isCredit?'+':'-'}{formatCurrency(txn.amount)}</div>
                  <a href={'/api/receipts/'+txn.transactionId} target="_blank" rel="noreferrer" style={{fontSize:11,color:'var(--blue)',textDecoration:'none',fontWeight:600}}>📄 Receipt</a>
                </div>
              </div>
            );
          })}
          {total>15&&(
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20,paddingTop:18,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-sm btn-outline" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
              <span style={{display:'flex',alignItems:'center',fontSize:14,color:'var(--text-secondary)',padding:'0 12px'}}>Page {page} of {Math.ceil(total/15)}</span>
              <button className="btn btn-sm btn-outline" disabled={page*15>=total} onClick={()=>setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </div>}
      </div>
    </div>
  );
}
