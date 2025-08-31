import { formatDistanceToNow, parseISO } from 'date-fns'

export function formatRelativeTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Unknown time'
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = parseISO(isoString)
    return date.toLocaleString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}