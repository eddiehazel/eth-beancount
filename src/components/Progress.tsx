import type { FetchProgress } from '@/types'

export interface ProgressProps {
  progress: FetchProgress
}

export function Progress({ progress }: ProgressProps) {
  const percentage = Math.round((progress.current / progress.total) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Fetching transactions...
        </span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {progress.current} / {progress.total}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {progress.currentAddress && (
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          Processing: {progress.currentAddress}
        </p>
      )}
    </div>
  )
}
