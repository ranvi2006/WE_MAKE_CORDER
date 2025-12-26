import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children }){
  const { loading, isAuthenticated } = useAuth()

  if(loading) return null
  if(isAuthenticated()) return children
  return <Navigate to="/admin/login" replace />
}
