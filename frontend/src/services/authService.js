import client from '../api/client'

/**
 * Call admin login API and persist token+admin to localStorage.
 * Returns { token, admin } as returned by the server.
 */
export async function loginAdmin(email, password){
  const res = await client.post('/api/admin/login', { email, password })
  const data = res.data || {}
  const token = data.token || data.accessToken || null
  const admin = data.admin || data.user || null

  if(token){
    try{
      localStorage.setItem('wmc_auth', JSON.stringify({ token, admin }))
      client.defaults.headers.common = client.defaults.headers.common || {}
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }catch(e){
      // ignore localStorage errors
    }
  }

  return { token, admin }
}

export function logoutAdmin(){
  try{ localStorage.removeItem('wmc_auth') }catch(e){}
  if(client.defaults.headers && client.defaults.headers.common){
    delete client.defaults.headers.common['Authorization']
  }
}

export default { loginAdmin, logoutAdmin }
