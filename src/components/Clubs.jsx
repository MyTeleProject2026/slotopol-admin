import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  const [editMode, setEditMode] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchClubs = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/club/list')
      setClubs(res.data?.clubs || res.data?.data?.clubs || [])
    } catch (e) {
      setClubs([])
      setError(e.response?.data?.what || e.response?.data?.error || e.message || 'Unable to load clubs')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchClubs() }, [])
  const handleRename = async (cid, name) => { await api.post('/club/rename', { cid, name }); setEditMode(null); await fetchClubs() }
  const handleCashin = async (cid, sum) => { await api.post('/club/cashin', { cid, sum }); await fetchClubs() }
  const handleJackpot = async (cid, fund) => { await api.post('/club/jpfund', { cid, fund }); await fetchClubs() }

  return <div><div style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between'}}><h2>🏛️ Club Management</h2><button className="action-btn action-btn-save" onClick={fetchClubs} disabled={loading}>🔄 Refresh</button></div>{error&&<div className="error">{error}</div>}<div className="glass-card" style={{minHeight:200,overflowX:'auto'}}>{loading?<div style={{textAlign:'center',padding:40}}>Loading clubs...</div>:clubs.length===0?<div style={{textAlign:'center',color:'#aaa',padding:40}}>No clubs returned by Slotopol-server.</div>:<table style={{minWidth:700,width:'100%'}}><thead><tr><th>ID</th><th>Name</th><th>Provider Bank</th><th>Jackpot Fund</th><th>Deposit</th><th>Actions</th></tr></thead><tbody>{clubs.map(c=><tr key={c.cid}><td>{c.cid}</td><td>{editMode===c.cid?<div className="inline-edit"><input defaultValue={c.name} id={`name-${c.cid}`}/><button className="action-btn action-btn-save" onClick={()=>handleRename(c.cid,document.getElementById(`name-${c.cid}`).value)}>Save</button><button className="action-btn action-btn-delete" onClick={()=>setEditMode(null)}>Cancel</button></div>:<span className="highlight">{c.name}</span>}</td><td>{Number(c.bank||0).toLocaleString()}</td><td><div className="inline-edit"><span>{Number(c.fund||0).toLocaleString()}</span><button className="action-btn action-btn-edit" onClick={()=>{const v=prompt('Enter new jackpot fund amount',c.fund||0);if(v!==null&&!Number.isNaN(Number(v)))handleJackpot(c.cid,Number(v))}}>Edit</button></div></td><td>{Number(c.lock||0).toLocaleString()}</td><td><div style={{display:'flex',gap:6,flexWrap:'wrap'}}><button className="action-btn action-btn-edit" onClick={()=>setEditMode(c.cid)}>Rename</button><button className="action-btn action-btn-save" onClick={()=>{const v=prompt('Enter provider balance adjustment','0');if(v!==null&&!Number.isNaN(Number(v)))handleCashin(c.cid,Number(v))}}>Add / Remove Balance</button></div></td></tr>)}</tbody></table>}</div></div>
}
