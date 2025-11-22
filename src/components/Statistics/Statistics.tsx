import type { TransactionStats } from '../../types'

interface StatisticsProps {
  stats: TransactionStats
}

export function Statistics({ stats }: StatisticsProps) {
  if (stats.totalTransactions === 0) return null

  return (
    <div className="statistics" aria-label="Transaction statistics">
      <div className="stat-item">
        <span className="stat-label">Total Transactions:</span>
        <span className="stat-value">{stats.totalTransactions}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">ETH Transfers:</span>
        <span className="stat-value">{stats.ethTransfers}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Token Transfers:</span>
        <span className="stat-value">{stats.tokenTransfers}</span>
      </div>
      {stats.failedTransactions > 0 && (
        <div className="stat-item stat-warning">
          <span className="stat-label">Failed Transactions:</span>
          <span className="stat-value">{stats.failedTransactions}</span>
        </div>
      )}
    </div>
  )
}
