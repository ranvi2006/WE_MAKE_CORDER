import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'wmc_auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore auth from localStorage on first load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token) {
          setToken(parsed.token)
          setAdmin(parsed.admin || null)
        }
      }
    } catch (err) {
      console.warn('Failed to restore auth state', err)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  // Login
  async function login({ email, password }) {
    const res = await client.post('/api/admin/login', { email, password })
    const { token, admin } = res.data || {}

    if (!token) {
      throw new Error('Login failed: no token returned')
    }

    setToken(token)
    setAdmin(admin || null)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, admin })
    )

    return admin
  }

  // Logout
  function logout() {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  // Check auth
  function isAuthenticated() {
    return Boolean(token)
  }

  const value = {
    token,
    admin,
    loading,
    login,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export default AuthContext
