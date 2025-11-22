'use client'

import type { FailedAddress } from '@/types'
import { Button } from './ui'

export interface FailedRequestsProps {
  failedAddresses: FailedAddress[]
  onRetry: (address: string) => void
  isLoading: boolean
}

export function FailedRequests({ failedAddresses, onRetry, isLoading }: FailedRequestsProps) {
  if (failedAddresses.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Failed Requests ({failedAddresses.length})
      </h3>
      <div className="space-y-2">
        {failedAddresses.map((failed) => (
          <div
            key={failed.address}
            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">
                {failed.nickname ? (
                  <>
                    <span className="font-semibold">{failed.nickname}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      ({failed.address.slice(0, 10)}...{failed.address.slice(-8)})
                    </span>
                  </>
                ) : (
                  <>
                    {failed.address.slice(0, 10)}...{failed.address.slice(-8)}
                  </>
                )}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{failed.error}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRetry(failed.address)}
              disabled={isLoading}
              className="ml-4 flex-shrink-0"
            >
              Retry
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
