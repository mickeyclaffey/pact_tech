'use client'

import { useState, useEffect } from 'react'
import { ResourceWrapper } from '@/lib/types'
import { subscribeToResources } from '@/lib/firestore'
import { useAuth } from './useAuth'

export function useResources(pageSize: number = 10) {
  const [resources, setResources] = useState<ResourceWrapper[]>([])
  const [loading, setLoading] = useState(true)
  const [partialLoading, setPartialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setPartialLoading(false)
      return
    }

    setLoading(true)
    setPartialLoading(true)
    setError(null)

    const unsubscribe = subscribeToResources(
      (resources) => {
        setResources(resources)
        if (resources.length >= pageSize) setPartialLoading(false) // Enough data to render first page
        if (resources.length > 0) setLoading(false)
      },
      (error) => {
        console.error('Error fetching resources:', error)
        setError(error.message)
        setLoading(false)
        setPartialLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, pageSize])

  return { resources, loading, partialLoading, error, refetch: () => setLoading(true) }
}