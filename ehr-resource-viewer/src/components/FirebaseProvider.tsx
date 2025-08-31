'use client'

import { createContext, useContext } from 'react'
import { User } from 'firebase/auth'
import { useAuth } from '@/hooks/useAuth'

interface FirebaseContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  return (
    <FirebaseContext.Provider value={auth}>
      {children}
    </FirebaseContext.Provider>
  )
}