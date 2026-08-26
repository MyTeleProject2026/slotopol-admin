import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import './login.css'

function getErrorMessage(err) {
  const status = err.response?.status
  const serverMessage = err.response?.data?.what || err.response?.data?.message
  if (serverMessage) return serverMessage
  if (status === 401) return 'The administrator credentials are incorrect.'
  if (status === 403) return 'This account is authenticated but is not authorized for Slotopol Admin.'
  if (!err.response) return 'Slotopol-server could not be reached. Check the configured API URL and server status.'
  return `Slotopol-server returned HTTP ${status}. Please try again.`
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/signin', { email: email.trim(), secret })
      const access = res.data?.access
      const refresh = res.data?.refrsh
      if (!access || !refresh) throw new Error('Slotopol-server returned an incomplete authentication response.')
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      const rbac = await api.get('/admin/rbac/me')
      if (!rbac.data?.uid || !rbac.data?.access) throw new Error('Authenticated account is not an administrator.')
      localStorage.setItem('adminUid', String(rbac.data.uid))
      localStorage.setItem('adminAccess', String(rbac.data.access))
      navigate('/', { replace: true })
    } catch (err) {
      localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); localStorage.removeItem('adminUid'); localStorage.removeItem('adminAccess')
      setError(getErrorMessage(err))
    } finally { setLoading(false) }
  }

  return <main className="login-shell">
    <section className="login-card" aria-labelledby="login-heading">
      <div className="login-brand" aria-label="Slotopol Admin"><div className="login-mark">S</div><div><strong>SLOTOPOL</strong><span>ADMIN CONTROL PLANE</span></div></div>
      <div className="login-heading"><p className="login-eyebrow">SECURE ADMINISTRATION</p><h1 id="login-heading">Welcome back</h1><p>Sign in with an authorized administrator account to continue.</p></div>
      {error && <div className="login-alert" role="alert"><strong>Sign-in failed</strong><span>{error}</span></div>}
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <label><span>Administrator email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" autoCapitalize="none" spellCheck="false" placeholder="admin@example.com" disabled={loading}/></label>
        <label><span>Password / secret</span><div className="login-secret-field"><input type={showSecret ? 'text' : 'password'} value={secret} onChange={e => setSecret(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" disabled={loading}/><button type="button" className="login-visibility" onClick={() => setShowSecret(value => !value)} aria-label={showSecret ? 'Hide password' : 'Show password'} disabled={loading}>{showSecret ? 'Hide' : 'Show'}</button></div></label>
        <button className="login-submit" type="submit" disabled={loading}>{loading ? <><span className="login-spinner" aria-hidden="true"/> Signing in…</> : 'Sign in securely'}</button>
      </form>
      <div className="login-security"><span className="login-dot"/><span>Authentication is handled by Slotopol-server and protected by the existing administrator RBAC.</span></div>
      <footer className="login-footer">Slotopol Admin · Production Control Plane</footer>
    </section>
  </main>
}
