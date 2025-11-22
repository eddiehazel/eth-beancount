import type { StatusMessage as StatusMessageType } from '../../types'

interface StatusMessageProps {
  status: StatusMessageType | null
}

export function StatusMessage({ status }: StatusMessageProps) {
  if (!status) return null

  return (
    <div className={`status-message status-${status.type}`} role="alert">
      {status.message}
    </div>
  )
}
