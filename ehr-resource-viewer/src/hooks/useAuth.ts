'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setUser(user)
        setLoading(false)
        if (!user) {
          // Auto sign-in anonymously if no user
          signInAnonymously(auth).catch((error) => {
            setError(error.message)
            setLoading(false)
          })
        }
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInAnonymously(auth)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
      setLoading(false)
    }
  }

  return { user, loading, error, signIn }
}