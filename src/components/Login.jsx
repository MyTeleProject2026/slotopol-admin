import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('admin@slotopol.com')
  const [secret, setSecret] = useState('admin123')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/signin', { email, secret })
      localStorage.setItem('token', res.data.access)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h2>Slotopol Admin</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Secret</label>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)} required />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
          }
