import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/signin', { email, secret })
      const access = res.data?.access
      const refresh = res.data?.refrsh
      if (!access || !refresh) throw new Error('Invalid authentication response from Slotopol-server')

      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)

      const rbac = await api.get('/admin/rbac/me')
      if (!rbac.data?.uid || !rbac.data?.access) throw new Error('Authenticated account is not an administrator')

      localStorage.setItem('adminUid', String(rbac.data.uid))
      localStorage.setItem('adminAccess', String(rbac.data.access))
      navigate('/')
    } catch (err) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('adminUid')
      localStorage.removeItem('adminAccess')
      setError(err.response?.data?.what || err.message || 'Unable to sign in to Slotopol-server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Slotopol Admin</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
        </div>
        <div className="form-group">
          <label>Secret</label>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)} required autoComplete="current-password" />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  )
}
