import React, { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'wmc_auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
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
          setUser(parsed.user || null)
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

  // Admin Login
  async function loginAdmin({ email, password }) {
    const res = await client.post('/api/admin/login', { email, password })
    const { token, admin } = res.data || {}

    if (!token) {
      throw new Error('Login failed: no token returned')
    }

    setToken(token)
    setAdmin(admin || null)
    setUser(null)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, admin, user: null })
    )

    return admin
  }

  // User Login
  async function loginUser({ email, password }) {
    const res = await client.post('/api/users/auth/login', { email, password })
    const { token, user } = res.data || {}

    if (!token) {
      throw new Error('Login failed: no token returned')
    }

    // Ensure user object has all required fields
    if (!user || !user.id || !user.name || !user.email || !user.phone || !user.role) {
      throw new Error('Login failed: incomplete user data')
    }

    setToken(token)
    setUser(user)
    setAdmin(null)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user, admin: null })
    )

    return user
  }

  // User Register (After OTP verification)
  async function registerUser({ name, email, phone, password }) {
    const res = await client.post('/api/users/auth/register', {
      name,
      email,
      phone,
      password
    })
    const { token, user } = res.data || {}

    if (!token) {
      throw new Error('Registration failed: no token returned')
    }

    // Ensure user object has all required fields
    if (!user || !user.id || !user.name || !user.email || !user.phone || !user.role) {
      throw new Error('Registration failed: incomplete user data')
    }

    setToken(token)
    setUser(user)
    setAdmin(null)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user, admin: null })
    )

    return user
  }

  // Check email availability (FRONTEND ONLY - calls backend)
  async function checkEmail(email) {
    const res = await client.post('/api/users/auth/check-email', { email })
    return res.data
  }

  // Send OTP (FRONTEND ONLY - calls backend)
  async function sendOtp(email) {
    const res = await client.post('/api/users/auth/send-otp', { email })
    return res.data
  }

  // Verify OTP (FRONTEND ONLY - calls backend)
  async function verifyOtp(email, otp) {
    const res = await client.post('/api/users/auth/verify-otp', { email, otp })
    return res.data
  }

  // Resend OTP (FRONTEND ONLY - calls backend)
  async function resendOtp(email) {
    const res = await client.post('/api/users/auth/resend-otp', { email })
    return res.data
  }

  // Logout
  function logout() {
    setToken(null)
    setUser(null)
    setAdmin(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  // Check auth
  function isAuthenticated() {
    return Boolean(token)
  }

  // Check if user (not admin)
  function isUser() {
    return Boolean(token && user && !admin)
  }

  // Check if admin
  function isAdminUser() {
    return Boolean(token && admin)
  }

  // Get user role
  function getUserRole() {
    if (admin) return 'admin'
    if (user) return 'user'
    return null
  }

  const value = {
    token,
    user,
    admin,
    loading,
    loginAdmin,
    loginUser,
    registerUser,
    checkEmail,
    sendOtp,
    verifyOtp,
    resendOtp,
    logout,
    isAuthenticated,
    isUser,
    isAdminUser,
    getUserRole
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
