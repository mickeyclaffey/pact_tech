'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceWrapper } from '@/lib/types'
import { formatRelativeTime } from '@/lib/dateUtils'
import { ProcessingStateBadge } from './ProcessingStateBadge'
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'

interface ResourceTableProps {
  resources: ResourceWrapper[]
  loading?: boolean
  error?: string | null
  onRowClick?: (resource: ResourceWrapper) => void
}

export function ResourceTable({ resources, loading, error, onRowClick }: ResourceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdTime', desc: true }
  ])

  const columns: ColumnDef<ResourceWrapper>[] = [
    {
      accessorKey: 'resource.metadata.resourceType',
      header: ({ column }) => {
        const sorted = column.getIsSorted()
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(sorted === 'asc')}
            className={`h-auto p-0 font-semibold cursor-pointer ${sorted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Resource Type
            {sorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : sorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const resourceType = row.original.resource.metadata.resourceType
        return <div className="font-medium">{resourceType}</div>
      },
    },
    {
      id: 'createdTime',
      accessorKey: 'resource.metadata.createdTime',
      header: ({ column }) => {
        const sorted = column.getIsSorted()
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(sorted === 'asc')}
            className={`h-auto p-0 font-semibold cursor-pointer ${sorted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Created
            {sorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : sorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row, table, column }) => {
        const createdTime = row.original.resource.metadata.createdTime
        const isSorted = column.getIsSorted()
        return (
          <div className={`relative flex flex-col${isSorted ? ' justify-start' : ''}`} style={isSorted ? { minHeight: '2.4em' } : {}}>
            <span className={isSorted ? 'mb-4' : ''}>{formatRelativeTime(createdTime)}</span>
            {isSorted && (
              <div className="absolute left-[-8px] top-6 text-xs text-muted-foreground bg-background px-1 rounded shadow z-10 whitespace-nowrap">
                {new Date(createdTime).toLocaleString()}
              </div>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.resource.metadata.createdTime)
        const b = new Date(rowB.original.resource.metadata.createdTime)
        return a.getTime() - b.getTime()
      },
    },
    {
      id: 'fetchTime',
      accessorKey: 'resource.metadata.fetchTime',
      header: ({ column }) => {
        const sorted = column.getIsSorted()
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(sorted === 'asc')}
            className={`h-auto p-0 font-semibold cursor-pointer ${sorted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Fetched
            {sorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : sorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row, table, column }) => {
        const fetchTime = row.original.resource.metadata.fetchTime
        const isSorted = column.getIsSorted()
        return (
          <div className={`relative flex flex-col${isSorted ? ' justify-start' : ''}`} style={isSorted ? { minHeight: '2.4em' } : {}}>
            <span className={isSorted ? 'mb-4' : ''}>{formatRelativeTime(fetchTime)}</span>
            {isSorted && (
              <div className="absolute left-[-8px] top-6 text-xs text-muted-foreground bg-background px-1 rounded shadow z-10 whitespace-nowrap">
                {new Date(fetchTime).toLocaleString()}
              </div>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.resource.metadata.fetchTime)
        const b = new Date(rowB.original.resource.metadata.fetchTime)
        return a.getTime() - b.getTime()
      },
    },
    {
      accessorKey: 'resource.metadata.state',
      header: 'Status',
      cell: ({ row }) => {
        const state = row.original.resource.metadata.state
        return <ProcessingStateBadge state={state} />
      },
    },
  ]

  const table = useReactTable({
    data: resources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load resources: {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">EHR Resources</CardTitle>
            <CardDescription className="mt-1">
              Electronic Health Record resources with processing status
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-foreground">{resources.length}</div>
            <div className="text-xs text-muted-foreground">Total Resources</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resources found
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/40">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-medium text-muted-foreground">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-accent/50 transition-colors duration-150 border-b border-border/50"
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-sm">No resources found</div>
                        <div className="text-xs text-muted-foreground/70">
                          Resources will appear here once they are loaded
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}