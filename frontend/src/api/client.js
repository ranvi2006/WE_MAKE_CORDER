import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token automatically
client.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('wmc_auth')
      if (raw) {
        const { token } = JSON.parse(raw)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch (err) {
      // ignore parse errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle auth errors globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('wmc_auth')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
