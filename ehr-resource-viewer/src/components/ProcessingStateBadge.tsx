import { Badge } from '@/components/ui/badge'
import { ProcessingState } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProcessingStateBadgeProps {
  state: ProcessingState
}

export function ProcessingStateBadge({ state }: ProcessingStateBadgeProps) {
  const getBadgeProps = (state: ProcessingState) => {
    switch (state) {
      case ProcessingState.PROCESSING_STATE_COMPLETED:
        return {
          variant: 'default' as const,
          className: 'medical-badge-success font-medium'
        }
      case ProcessingState.PROCESSING_STATE_PROCESSING:
        return {
          variant: 'secondary' as const,
          className: 'medical-badge-warning font-medium'
        }
      case ProcessingState.PROCESSING_STATE_FAILED:
        return {
          variant: 'destructive' as const,
          className: 'medical-badge-error font-medium'
        }
      case ProcessingState.PROCESSING_STATE_NOT_STARTED:
        return {
          variant: 'outline' as const,
          className: 'medical-badge-neutral font-medium'
        }
      case ProcessingState.PROCESSING_STATE_UNSPECIFIED:
      default:
        return {
          variant: 'outline' as const,
          className: 'medical-badge-info font-medium'
        }
    }
  }

  const getDisplayText = (state: ProcessingState) => {
    switch (state) {
      case ProcessingState.PROCESSING_STATE_COMPLETED:
        return 'Completed'
      case ProcessingState.PROCESSING_STATE_PROCESSING:
        return 'Processing'
      case ProcessingState.PROCESSING_STATE_FAILED:
        return 'Failed'
      case ProcessingState.PROCESSING_STATE_NOT_STARTED:
        return 'Not Started'
      case ProcessingState.PROCESSING_STATE_UNSPECIFIED:
        return 'Unspecified'
      default:
        return 'Unknown'
    }
  }

  const badgeProps = getBadgeProps(state)

  return (
    <Badge 
      variant={badgeProps.variant}
      className={cn(badgeProps.className)}
    >
      {getDisplayText(state)}
    </Badge>
  )
}