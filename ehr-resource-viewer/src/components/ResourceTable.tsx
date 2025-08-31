'use client'

import { useState, useMemo, Fragment } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  type Row,
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
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, ChevronDown, ChevronRight, ChevronLeft, Download, Check } from 'lucide-react'
import React from 'react'

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
  // Filter state
  const [resourceType, setResourceType] = useState('')
  const [status, setStatus] = useState('')
  const [createdStart, setCreatedStart] = useState('')
  const [createdEnd, setCreatedEnd] = useState('')
  const [fetchedStart, setFetchedStart] = useState('')
  const [fetchedEnd, setFetchedEnd] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [columnsOpen, setColumnsOpen] = useState(false)

  // Multi-select state
  const [resourceTypesSelected, setResourceTypesSelected] = useState<string[]>([])
  const [statusesSelected, setStatusesSelected] = useState<string[]>([])

  // Get unique resource types from data
  const resourceTypes = useMemo(() => Array.from(new Set(resources.map(r => r.resource.metadata.resourceType))), [resources])
  // Get status options from ProcessingState enum
  const statusOptions = [
    'PROCESSING_STATE_UNSPECIFIED',
    'PROCESSING_STATE_NOT_STARTED',
    'PROCESSING_STATE_PROCESSING',
    'PROCESSING_STATE_COMPLETED',
    'PROCESSING_STATE_FAILED',
  ]

  // Columns config for show/hide
  const allColumns = [
    { id: 'resourceType', label: 'Resource Type' },
    { id: 'createdTime', label: 'Created' },
    { id: 'fetchTime', label: 'Fetched' },
    { id: 'state', label: 'Status' },
    { id: 'resourceId', label: 'Resource ID' },
    { id: 'fhirVersion', label: 'FHIR Version' },
    { id: 'patientId', label: 'Patient ID' },
    { id: 'processedTime', label: 'Processed Time' },
    { id: 'resourceKey', label: 'Resource Key' },
    { id: 'uid', label: 'UID' },
  ]
  const [visibleColumns, setVisibleColumns] = useState({
    resourceType: true,
    createdTime: true,
    fetchTime: true,
    state: true,
    resourceId: false,
    fhirVersion: false,
    patientId: false,
    processedTime: false,
    resourceKey: false,
    uid: false,
  })
  // Search state (move below allColumns/visibleColumns)
  const visibleColumnOptions = allColumns.filter(col => visibleColumns[col.id as keyof typeof visibleColumns])
  const [searchColumn, setSearchColumn] = useState(visibleColumnOptions[0]?.id || '')
  const [searchValue, setSearchValue] = useState('')

  // Dropdown open state
  const [resourceTypeDropdownOpen, setResourceTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  // Helper to normalize date/time strings for lenient search
  function normalizeDateString(str: string) {
    return str.replace(/[\/:,\-\s]/g, '').toLowerCase()
  }

  // Filtering logic (add multi-select)
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const meta = r.resource.metadata
      // Resource type (multi)
      if (resourceTypesSelected.length && !resourceTypesSelected.includes(meta.resourceType)) return false
      // Status (multi)
      if (statusesSelected.length && !statusesSelected.includes(meta.state)) return false
      // Created date range
      if (createdStart && new Date(meta.createdTime) < new Date(createdStart)) return false
      if (createdEnd && new Date(meta.createdTime) > new Date(createdEnd)) return false
      // Fetched date range
      if (fetchedStart && new Date(meta.fetchTime) < new Date(fetchedStart)) return false
      if (fetchedEnd && new Date(meta.fetchTime) > new Date(fetchedEnd)) return false
      // Search
      if (searchValue && searchColumn) {
        let val = ''
        switch (searchColumn) {
          case 'resourceType': val = meta.resourceType; break
          case 'createdTime': val = new Date(meta.createdTime).toLocaleString(); break
          case 'fetchTime': val = new Date(meta.fetchTime).toLocaleString(); break
          case 'state': val = meta.state; break
          case 'resourceId': val = meta.identifier.key.split('-').slice(-1)[0]; break
          case 'fhirVersion': val = meta.version.replace('FHIR_VERSION_', ''); break
          case 'patientId': val = meta.identifier.patientId; break
          case 'processedTime': val = meta.processedTime ? new Date(meta.processedTime).toLocaleString() : ''; break
          case 'resourceKey': val = meta.identifier.key; break
          case 'uid': val = meta.identifier.uid; break
          default: val = ''
        }
        if (["createdTime", "fetchTime", "processedTime"].includes(searchColumn)) {
          if (!normalizeDateString(val).includes(normalizeDateString(searchValue))) return false
        } else {
          if (!val?.toString().toLowerCase().includes(searchValue.toLowerCase())) return false
        }
      }
      return true
    })
  }, [resources, resourceTypesSelected, statusesSelected, createdStart, createdEnd, fetchedStart, fetchedEnd, searchValue, searchColumn])

  // Determine if any filter is active
  const anyFilterActive = !!(resourceType || status || createdStart || createdEnd || fetchedStart || fetchedEnd)
  const [filtersOpen, setFiltersOpen] = useState(anyFilterActive)

  // Columns definition, only include visible columns
  const columns: ColumnDef<ResourceWrapper>[] = [
    visibleColumns.resourceType && {
      accessorKey: 'resource.metadata.resourceType',
      header: ({ column }: { column: any }) => {
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
      cell: ({ row }: { row: Row<ResourceWrapper> }) => {
        const resourceType = row.original.resource.metadata.resourceType
        return <div className="font-medium">{resourceType}</div>
      },
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.resourceType || ''
        const b = rowB.original.resource.metadata.resourceType || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.createdTime && {
      id: 'createdTime',
      accessorKey: 'resource.metadata.createdTime',
      header: ({ column }: { column: any }) => {
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
      cell: ({ row, column }: { row: Row<ResourceWrapper>, column: any }) => {
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
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = new Date(rowA.original.resource.metadata.createdTime)
        const b = new Date(rowB.original.resource.metadata.createdTime)
        return a.getTime() - b.getTime()
      },
    },
    visibleColumns.fetchTime && {
      id: 'fetchTime',
      accessorKey: 'resource.metadata.fetchTime',
      header: ({ column }: { column: any }) => {
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
      cell: ({ row, column }: { row: Row<ResourceWrapper>, column: any }) => {
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
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = new Date(rowA.original.resource.metadata.fetchTime)
        const b = new Date(rowB.original.resource.metadata.fetchTime)
        return a.getTime() - b.getTime()
      },
    },
    visibleColumns.state && {
      accessorKey: 'resource.metadata.state',
      header: 'Status',
      cell: ({ row }: { row: Row<ResourceWrapper> }) => {
        const state = row.original.resource.metadata.state
        return <ProcessingStateBadge state={state} />
      },
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.state || ''
        const b = rowB.original.resource.metadata.state || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.resourceId && {
      id: 'resourceId',
      header: 'Resource ID',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.identifier.key.split('-').slice(-1)[0],
      cell: ({ row }: { row: Row<ResourceWrapper> }) => row.original.resource.metadata.identifier.key.split('-').slice(-1)[0],
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.identifier.key.split('-').slice(-1)[0] || ''
        const b = rowB.original.resource.metadata.identifier.key.split('-').slice(-1)[0] || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.fhirVersion && {
      id: 'fhirVersion',
      header: 'FHIR Version',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.version.replace('FHIR_VERSION_', ''),
      cell: ({ row }: { row: Row<ResourceWrapper> }) => row.original.resource.metadata.version.replace('FHIR_VERSION_', ''),
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.version || ''
        const b = rowB.original.resource.metadata.version || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.patientId && {
      id: 'patientId',
      header: 'Patient ID',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.identifier.patientId,
      cell: ({ row }: { row: Row<ResourceWrapper> }) => row.original.resource.metadata.identifier.patientId,
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.identifier.patientId || ''
        const b = rowB.original.resource.metadata.identifier.patientId || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.processedTime && {
      id: 'processedTime',
      header: 'Processed Time',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.processedTime || '',
      cell: ({ row }: { row: Row<ResourceWrapper> }) => {
        const processed = row.original.resource.metadata.processedTime
        return processed ? new Date(processed).toLocaleString() : ''
      },
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.processedTime || ''
        const b = rowB.original.resource.metadata.processedTime || ''
        return a.localeCompare(b)
      },
      enableHiding: true,
    },
    visibleColumns.resourceKey && {
      id: 'resourceKey',
      header: 'Resource Key',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.identifier.key,
      cell: ({ row }: { row: Row<ResourceWrapper> }) => row.original.resource.metadata.identifier.key,
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.identifier.key || ''
        const b = rowB.original.resource.metadata.identifier.key || ''
        return a.localeCompare(b)
      },
    },
    visibleColumns.uid && {
      id: 'uid',
      header: 'UID',
      accessorFn: (row: ResourceWrapper) => row.resource.metadata.identifier.uid,
      cell: ({ row }: { row: Row<ResourceWrapper> }) => row.original.resource.metadata.identifier.uid,
      sortingFn: (rowA: Row<ResourceWrapper>, rowB: Row<ResourceWrapper>) => {
        const a = rowA.original.resource.metadata.identifier.uid || ''
        const b = rowB.original.resource.metadata.identifier.uid || ''
        return a.localeCompare(b)
      },
    },
  ].filter(Boolean) as ColumnDef<ResourceWrapper>[]

  const table = useReactTable({
    data: filteredResources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    // Pagination
    pageCount: Math.ceil(filteredResources.length / pageSize),
    manualPagination: false,
    initialState: { pagination: { pageSize } },
  })
  // Update page size when changed
  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize])

  // CSV export helper
  function exportToCSV() {
    // Get visible column ids and labels
    const visibleCols = allColumns.filter(col => visibleColumns[col.id as keyof typeof visibleColumns])
    const headers = visibleCols.map(col => col.label)
    // Get all filtered rows (not just paginated)
    const rows = filteredResources.map(r => {
      return visibleCols.map(col => {
        switch (col.id) {
          case 'resourceType': return r.resource.metadata.resourceType
          case 'createdTime': return r.resource.metadata.createdTime
          case 'fetchTime': return r.resource.metadata.fetchTime
          case 'state': return r.resource.metadata.state
          case 'resourceId': return r.resource.metadata.identifier.key.split('-').slice(-1)[0]
          case 'fhirVersion': return r.resource.metadata.version.replace('FHIR_VERSION_', '')
          case 'patientId': return r.resource.metadata.identifier.patientId
          case 'processedTime': return r.resource.metadata.processedTime || ''
          case 'resourceKey': return r.resource.metadata.identifier.key
          case 'uid': return r.resource.metadata.identifier.uid
          default: return ''
        }
      })
    })
    // CSV string
    const csv = [headers, ...rows].map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ehr-resources.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
            {/* Filter UI */}
            <div className="mt-4">
              {/* Filters expandable */}
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer mb-2"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
              >
                {filtersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Filters
                {anyFilterActive && <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Active</span>}
              </button>
              {filtersOpen && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-wrap gap-4 items-end">
                    {/* Resource Type Multi-select */}
                    <div className="relative" tabIndex={0} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setResourceTypeDropdownOpen(false) }}>
                      <label className="block text-xs mb-1">Resource Type</label>
                      <button
                        type="button"
                        className="border rounded px-2 py-1 w-40 text-left flex items-center gap-2 cursor-pointer bg-background"
                        onClick={() => setResourceTypeDropdownOpen((open) => !open)}
                      >
                        {resourceTypesSelected.length === 0 ? 'All' : resourceTypesSelected.join(', ')}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </button>
                      {resourceTypeDropdownOpen && (
                        <div className="absolute z-10 mt-1 bg-background border rounded shadow w-40 max-h-48 overflow-auto" tabIndex={-1}>
                          <div className="px-2 py-1">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={resourceTypesSelected.length === 0}
                                onChange={() => setResourceTypesSelected([])}
                              />
                              All
                            </label>
                            {resourceTypes.map(type => (
                              <label key={type} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={resourceTypesSelected.includes(type)}
                                  onChange={() => {
                                    setResourceTypesSelected(selected =>
                                      selected.includes(type)
                                        ? selected.filter(t => t !== type)
                                        : [...selected, type]
                                    )
                                  }}
                                />
                                {type}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Status Multi-select */}
                    <div className="relative" tabIndex={0} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setStatusDropdownOpen(false) }}>
                      <label className="block text-xs mb-1">Status</label>
                      <button
                        type="button"
                        className="border rounded px-2 py-1 w-40 text-left flex items-center gap-2 cursor-pointer bg-background"
                        onClick={() => setStatusDropdownOpen((open) => !open)}
                      >
                        {statusesSelected.length === 0 ? 'All' : statusesSelected.map(opt => opt.replace('PROCESSING_STATE_', '').replace('_', ' ')).join(', ')}
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </button>
                      {statusDropdownOpen && (
                        <div className="absolute z-10 mt-1 bg-background border rounded shadow w-40 max-h-48 overflow-auto" tabIndex={-1}>
                          <div className="px-2 py-1">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={statusesSelected.length === 0}
                                onChange={() => setStatusesSelected([])}
                              />
                              All
                            </label>
                            {statusOptions.map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={statusesSelected.includes(opt)}
                                  onChange={() => {
                                    setStatusesSelected(selected =>
                                      selected.includes(opt)
                                        ? selected.filter(s => s !== opt)
                                        : [...selected, opt]
                                    )
                                  }}
                                />
                                {opt.replace('PROCESSING_STATE_', '').replace('_', ' ')}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs mb-1">Created Start</label>
                      <input type="datetime-local" className="border rounded px-2 py-1" value={createdStart} onChange={e => setCreatedStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Created End</label>
                      <input type="datetime-local" className="border rounded px-2 py-1" value={createdEnd} onChange={e => setCreatedEnd(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs mb-1">Fetched Start</label>
                      <input type="datetime-local" className="border rounded px-2 py-1" value={fetchedStart} onChange={e => setFetchedStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Fetched End</label>
                      <input type="datetime-local" className="border rounded px-2 py-1" value={fetchedEnd} onChange={e => setFetchedEnd(e.target.value)} />
                    </div>
                  </div>
                  <button
                    className="mt-2 text-xs underline text-muted-foreground hover:text-foreground cursor-pointer w-fit"
                    type="button"
                    onClick={() => {
                      setResourceTypesSelected([]); setStatusesSelected([]); setCreatedStart(''); setCreatedEnd(''); setFetchedStart(''); setFetchedEnd('');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
              {/* Columns expandable */}
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer mt-4 mb-2"
                onClick={() => setColumnsOpen((open) => !open)}
                aria-expanded={columnsOpen}
              >
                {columnsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Columns
              </button>
              {columnsOpen && (
                <div className="flex flex-wrap gap-4 items-center">
                  {allColumns.map(col => (
                    <label key={col.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.id as keyof typeof visibleColumns]}
                        onChange={() => setVisibleColumns(v => ({ ...v, [col.id]: !v[col.id as keyof typeof visibleColumns] }))}
                        className="accent-primary"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-2xl font-semibold text-foreground">{filteredResources.length}</div>
              <div className="text-xs text-muted-foreground">{anyFilterActive ? 'Matched Resources' : 'Total Resources'}</div>
            </div>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium shadow transition-colors cursor-pointer mt-2"
              onClick={exportToCSV}
              type="button"
            >
              <Download className="h-4 w-4" /> Export as CSV
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Search bar and column selector */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <label className="text-xs text-muted-foreground">Search:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={searchColumn}
            onChange={e => setSearchColumn(e.target.value)}
          >
            {visibleColumnOptions.map(col => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="border rounded px-2 py-1 text-sm min-w-[180px]"
              placeholder={`Search ${(() => {
                const col = visibleColumnOptions.find(c => c.id === searchColumn)
                if (!col) return ''
                if (["createdTime", "fetchTime", "processedTime"].includes(col.id)) {
                  return col.label + " Time"
                }
                return col.label
              })()}`}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            {['createdTime', 'fetchTime', 'processedTime'].includes(searchColumn) && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">Search absolute time (not relative time)</span>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading resources...
          </div>
        ) : filteredResources.length === 0 ? (
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          {/* Page size picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded hover:bg-muted/50 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="p-1 rounded hover:bg-muted/50 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}