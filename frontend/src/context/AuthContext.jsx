import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    // Initialize from localStorage
    try{
      const raw = localStorage.getItem('wmc_auth')
      if(raw){
        const parsed = JSON.parse(raw)
        if(parsed?.token){
          setToken(parsed.token)
          setAdmin(parsed.admin || null)
        }
      }
    }catch(e){
      console.warn('Failed to parse auth from localStorage', e)
    }finally{
      setLoading(false)
    }
  }, [])

  async function login(credentials){
    // credentials: { email, password } or similar - backend shape may vary
    const res = await client.post('/api/admin/login', credentials)
    // Expecting { token, admin } in response body
    const body = res.data || {}
    const t = body.token || body.accessToken || null
    const a = body.admin || body.user || null
    if(!t) throw new Error('No token returned from login')
    setToken(t)
    setAdmin(a)
    try{ localStorage.setItem('wmc_auth', JSON.stringify({ token: t, admin: a })) }catch(e){}
    return { token: t, admin: a }
  }

  function setAuth(t, a){
    setToken(t)
    setAdmin(a || null)
    try{ localStorage.setItem('wmc_auth', JSON.stringify({ token: t, admin: a })) }catch(e){}
  }

  function logout(){
    setToken(null)
    setAdmin(null)
    try{ localStorage.removeItem('wmc_auth') }catch(e){}
  }

  function isAuthenticated(){
    return Boolean(token)
  }

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, isAuthenticated, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
