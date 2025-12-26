import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' }
})

// Attach auth token from localStorage on each request (if present)
api.interceptors.request.use((cfg) => {
  try{
    const raw = localStorage.getItem('wmc_auth')
    if(raw){
      const { token } = JSON.parse(raw)
      if(token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` }
    }
  }catch(e){}
  return cfg
})

export default api
