import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
if (!baseURL) {
  throw new Error('VITE_API_URL is required for Slotopol Admin')
}

const api = axios.create({ baseURL })
let refreshPromise = null

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const refreshToken = localStorage.getItem('refreshToken')

    if (status === 401 && refreshToken && original && !original._slotopolRetried && !String(original.url || '').includes('/refresh')) {
      original._slotopolRetried = true
      try {
        refreshPromise ||= axios.get(`${baseURL}/refresh`, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        const response = await refreshPromise
        refreshPromise = null
        const access = response.data?.access
        const nextRefresh = response.data?.refrsh
        if (!access) throw new Error('Refresh response did not contain an access token')
        localStorage.setItem('token', access)
        if (nextRefresh) localStorage.setItem('refreshToken', nextRefresh)
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${access}`
        return api(original)
      } catch (refreshError) {
        refreshPromise = null
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        if (window.location.pathname !== '/login') window.location.replace('/login')
        return Promise.reject(refreshError)
      }
    }

    if (status === 403) {
      console.warn(error.response?.data?.what || 'Access denied.')
    }

    return Promise.reject(error)
  }
)

export default api
