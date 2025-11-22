import { useCallback } from 'react'

interface ActionButtonsProps {
  onFetch: () => void
  onClear: () => void
  onClearSavedData: () => void
  hasOutput: boolean
  output: string
  isLoading: boolean
  hasAddresses: boolean
}

export function ActionButtons({
  onFetch,
  onClear,
  onClearSavedData,
  hasOutput,
  output,
  isLoading,
  hasAddresses,
}: ActionButtonsProps) {
  const downloadOutput = useCallback(() => {
    if (!output) return

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ethereum-transactions-${new Date().toISOString().split('T')[0]}.beancount`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output])

  return (
    <div className="action-buttons">
      <div className="primary-actions">
        <button
          type="button"
          onClick={onFetch}
          disabled={isLoading || !hasAddresses}
          className="btn btn-primary"
        >
          {isLoading ? 'Fetching...' : 'Fetch Transactions'}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Clear
        </button>
        {hasOutput && (
          <button
            type="button"
            onClick={downloadOutput}
            disabled={isLoading}
            className="btn btn-success"
          >
            Download .beancount
          </button>
        )}
      </div>
      <div className="secondary-actions">
        <button
          type="button"
          onClick={onClearSavedData}
          disabled={isLoading}
          className="btn btn-danger btn-small"
        >
          Clear Saved Data
        </button>
      </div>
    </div>
  )
}
