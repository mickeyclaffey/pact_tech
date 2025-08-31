'use client'

import { useState, useEffect } from 'react'
import { ResourceWrapper } from '@/lib/types'
import { subscribeToResources } from '@/lib/firestore'
import { useAuth } from './useAuth'

export function useResources() {
  const [resources, setResources] = useState<ResourceWrapper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeToResources(
      (resources) => {
        setResources(resources)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching resources:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { resources, loading, error, refetch: () => setLoading(true) }
}