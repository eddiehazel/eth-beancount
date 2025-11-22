interface LoadingSpinnerProps {
  progress?: { completed: number; total: number }
}

export function LoadingSpinner({ progress }: LoadingSpinnerProps) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="loading-text">
        {progress && progress.total > 0
          ? `Fetching transactions... (${progress.completed}/${progress.total})`
          : 'Loading...'}
      </span>
    </div>
  )
}
