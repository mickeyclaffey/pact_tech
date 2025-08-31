'use client'

import { useState } from 'react'
import { ResourceTable } from '@/components/ResourceTable'
import { ResourceDetailDialog } from '@/components/ResourceDetailDialog'
import { useResources } from '@/hooks/useResources'
import { useAuth } from '@/hooks/useAuth'
import { ResourceWrapper } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { user, loading: authLoading, error: authError, signIn } = useAuth()
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources()
  const [selectedResource, setSelectedResource] = useState<ResourceWrapper | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleRowClick = (resource: ResourceWrapper) => {
    setSelectedResource(resource)
    setDialogOpen(true)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Authenticating...</p>
        </div>
      </div>
    )
  }

  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              Unable to authenticate: {authError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signIn} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                EHR Resource Viewer
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <ResourceTable
          resources={resources}
          loading={resourcesLoading}
          error={resourcesError}
          onRowClick={handleRowClick}
        />
      </main>

      <ResourceDetailDialog
        resource={selectedResource}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
