interface FailedRequestsProps {
  failedAddresses: Map<string, { address: string; nickname?: string; error: string }>
  onRetry: (address: string, nickname: string | undefined) => void
  disabled?: boolean
}

export function FailedRequests({
  failedAddresses,
  onRetry,
  disabled,
}: FailedRequestsProps) {
  if (failedAddresses.size === 0) return null

  return (
    <div className="failed-requests" role="alert">
      <h3>Failed Requests</h3>
      <ul>
        {Array.from(failedAddresses.values()).map(
          ({ address, nickname, error }) => (
            <li key={address} className="failed-item">
              <div className="failed-info">
                <span className="failed-address">
                  {nickname ? `${nickname} (${address})` : address}
                </span>
                <span className="failed-error">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => onRetry(address, nickname)}
                disabled={disabled}
                className="retry-button"
                aria-label={`Retry fetching ${nickname || address}`}
              >
                Retry
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
