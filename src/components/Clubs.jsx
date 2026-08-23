import { useEffect, useState } from 'react'
import api from '../api/client'

const unwrap = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.clubs)) return data.clubs
  if (Array.isArray(data?.data?.clubs)) return data.data.clubs
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.list)) return data.list
  return []
}

export default function Clubs() {
  const [clubs, setClubs] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(false)
  const fetchClubs = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/club/list', {})
      const list = unwrap(res.data)
      setClubs(list)
      if (!list.length && res.data?.what) setError(res.data.what)
    } catch (e) {
      setClubs([])
      setError(e.response?.data?.what || e.response?.data?.error || e.message || 'Unable to load clubs')
    } finally { setLoading(false) }
  }
  useEffect(() => { fetchClubs() }, [])
  const call = async (path, body) => { try { await api.post(path, body); await fetchClubs() } catch(e) { setError(e.response?.data?.what || e.message) } }
  return <div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>🏛️ Club Management</h2><button className="action-btn action-btn-save" onClick={fetchClubs}>Refresh</button></div>{error&&<div className="error">{error}</div>}<div className="glass-card" style={{minHeight:200,overflowX:'auto'}}>{loading?<p>Loading clubs…</p>:clubs.length===0?<p>No clubs returned. Check that the logged-in Slotopol account has global/club administrator permission and that VITE_API_URL points to the current Slotopol-server.</p>:<table style={{width:'100%'}}><thead><tr><th>ID</th><th>Name</th><th>Bank</th><th>Fund</th><th>Actions</th></tr></thead><tbody>{clubs.map(c=><tr key={c.cid||c.id}><td>{c.cid||c.id}</td><td>{c.name}</td><td>{Number(c.bank||0).toLocaleString()}</td><td>{Number(c.fund||0).toLocaleString()}</td><td><button className="action-btn action-btn-save" onClick={()=>{const sum=prompt('Balance adjustment');if(sum!==null)call('/club/cashin',{cid:c.cid||c.id,sum:Number(sum)})}}>Balance</button><button className="action-btn action-btn-edit" onClick={()=>{const name=prompt('Club name',c.name);if(name)call('/club/rename',{cid:c.cid||c.id,name})}}>Rename</button></td></tr>)}</tbody></table>}</div></div>
}
