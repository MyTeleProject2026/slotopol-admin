import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'

const baseURL = import.meta.env.VITE_API_URL
const probes = [
  { key: 'ping', label: 'API Ping', method: 'get', path: '/ping' },
  { key: 'service', label: 'Service Info', method: 'get', path: '/servinfo' },
  { key: 'memory', label: 'Runtime Memory', method: 'get', path: '/memusage' },
  { key: 'games', label: 'Game Algorithms', method: 'get', path: '/game/algs' },
]

function pretty(value) { return JSON.stringify(value, null, 2) }

export default function OperationsCenter() {
  const [results,setResults]=useState({}); const [loading,setLoading]=useState(false); const [updated,setUpdated]=useState(null)
  const [logs,setLogs]=useState([]); const [level,setLevel]=useState(''); const [streaming,setStreaming]=useState(false); const abortRef=useRef(null)
  const refresh=useCallback(async()=>{setLoading(true);const entries=await Promise.all(probes.map(async p=>{const started=Date.now();try{const r=await api.request({method:p.method,url:p.path});return [p.key,{ok:true,latency:Date.now()-started,data:r.data}]}catch(e){return [p.key,{ok:false,latency:Date.now()-started,error:e.response?.data?.what||e.message}]} }));setResults(Object.fromEntries(entries));setUpdated(new Date());try{const r=await api.get('/admin/operations/logs',{params:{limit:200,...(level?{level}: {})}});setLogs(r.data?.events||[])}finally{setLoading(false)}},[level])
  useEffect(()=>{refresh()},[refresh])
  useEffect(()=>{let cancelled=false;const connect=async()=>{abortRef.current=new AbortController();try{const token=localStorage.getItem('token');const r=await fetch(`${baseURL}/admin/operations/stream`,{headers:{Authorization:`Bearer ${token}`,Accept:'text/event-stream'},signal:abortRef.current.signal});if(!r.ok||!r.body)throw new Error(`stream ${r.status}`);setStreaming(true);const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';while(!cancelled){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const frames=buffer.split('\n\n');buffer=frames.pop()||'';for(const frame of frames){const type=frame.split('\n').find(x=>x.startsWith('event:'))?.slice(6).trim();const data=frame.split('\n').filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trim()).join('');if(type==='log'&&data){try{const log=JSON.parse(data);setLogs(cur=>[log,...cur.filter(x=>x.id!==log.id)].slice(0,200))}catch{}}}}}catch{if(!cancelled)setStreaming(false)}};connect();return()=>{cancelled=true;abortRef.current?.abort();setStreaming(false)}},[])
  return <section><div className="page-heading"><div><h1>Operations Center</h1><p>Real Slotopol-server health, persisted logs, errors, request telemetry, and live stream.</p></div><button onClick={refresh} disabled={loading}>{loading?'Refreshing…':'Refresh checks'}</button></div>
    <div className="ops-grid">{probes.map(p=>{const r=results[p.key];return <article className="ops-card" key={p.key}><div className="ops-card-title"><strong>{p.label}</strong><span className={r?.ok?'status-ok':'status-error'}>{r?(r.ok?'ONLINE':'FAILED'):'CHECKING'}</span></div><small>{p.path}{r?` · ${r.latency} ms`:''}</small>{r?.error&&<p className="ops-error">{r.error}</p>}{r?.data&&<pre>{pretty(r.data)}</pre>}</article>})}</div>
    <div className="glass-card" style={{padding:'20px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><h3>Live server logs</h3><p>{streaming?'● Connected to Slotopol-server stream':'● Stream disconnected'}</p></div><select value={level} onChange={e=>setLevel(e.target.value)}><option value="">All levels</option><option value="INFO">INFO</option><option value="WARN">WARN</option><option value="ERROR">ERROR</option></select></div><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th>Time</th><th>Level</th><th>Event</th><th>Method</th><th>Endpoint</th><th>Status</th><th>Latency</th><th>Error/Message</th></tr></thead><tbody>{logs.map(l=><tr key={l.id}><td>{new Date(l.timestamp).toLocaleString()}</td><td>{l.level}</td><td>{l.event_type}</td><td>{l.method||'—'}</td><td>{l.endpoint||'—'}</td><td>{l.status||'—'}</td><td>{l.duration_ms??'—'} ms</td><td>{l.error||l.message||'—'}</td></tr>)}</tbody></table></div></div>
    {updated&&<p className="ops-updated">Last checked: {updated.toLocaleString()}</p>}
  </section>
}
