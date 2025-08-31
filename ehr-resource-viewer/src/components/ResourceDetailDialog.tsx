'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResourceWrapper } from '@/lib/types'
import { formatDateTime, formatRelativeTime } from '@/lib/dateUtils'
import { ProcessingStateBadge } from './ProcessingStateBadge'
import { Separator } from '@/components/ui/separator'

interface ResourceDetailDialogProps {
  resource: ResourceWrapper | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResourceDetailDialog({ resource, open, onOpenChange }: ResourceDetailDialogProps) {
  if (!resource) return null

  const { metadata, humanReadableStr, aiSummary } = resource.resource

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-6 pr-12">
          <div>
            <DialogTitle className="text-xl font-medium flex items-center gap-3">
              {metadata.resourceType} Resource
              <ProcessingStateBadge state={metadata.state} />
            </DialogTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Resource ID: <span className="font-mono text-foreground">{metadata.identifier.key.split('-').slice(-1)[0]}</span>
            </div>
            <DialogDescription className="mt-2 text-base">
              Detailed resource information and processing metadata
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Resource Type</h4>
                  <p className="text-sm">{metadata.resourceType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">FHIR Version</h4>
                  <Badge variant="outline">{metadata.version.replace('FHIR_VERSION_', '')}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Processing State</h4>
                  <ProcessingStateBadge state={metadata.state} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Patient ID</h4>
                  <p className="text-sm font-mono">{metadata.identifier.patientId}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Created</h4>
                  <p className="text-sm">{formatRelativeTime(metadata.createdTime)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(metadata.createdTime)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Fetched</h4>
                  <p className="text-sm">{formatRelativeTime(metadata.fetchTime)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(metadata.fetchTime)}</p>
                </div>
                {metadata.processedTime && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Processed</h4>
                    <p className="text-sm">{formatRelativeTime(metadata.processedTime)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(metadata.processedTime)}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Resource Key</h4>
                  <p className="text-xs font-mono break-all">{metadata.identifier.key}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">UID</h4>
                  <p className="text-xs font-mono break-all">{metadata.identifier.uid}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Human Readable Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Human Readable Description</CardTitle>
              <CardDescription>
                Human-friendly interpretation of the resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-4">
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {humanReadableStr}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          {aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Summary</CardTitle>
                <CardDescription>
                  AI-generated summary of the resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-md p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {aiSummary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}