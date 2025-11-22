import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'

describe('Statistics', () => {
  it('should render nothing when totalTransactions is 0', () => {
    const { container } = render(
      <Statistics
        stats={{
          totalTransactions: 0,
          ethTransfers: 0,
          tokenTransfers: 0,
          failedTransactions: 0,
        }}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should display all statistics', () => {
    render(
      <Statistics
        stats={{
          totalTransactions: 100,
          ethTransfers: 60,
          tokenTransfers: 40,
          failedTransactions: 5,
        }}
      />
    )

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should display labels for each statistic', () => {
    render(
      <Statistics
        stats={{
          totalTransactions: 10,
          ethTransfers: 5,
          tokenTransfers: 5,
          failedTransactions: 0,
        }}
      />
    )

    expect(screen.getByText(/total transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/eth transfers/i)).toBeInTheDocument()
    expect(screen.getByText(/token transfers/i)).toBeInTheDocument()
  })

  it('should not show failed transactions when count is 0', () => {
    render(
      <Statistics
        stats={{
          totalTransactions: 10,
          ethTransfers: 5,
          tokenTransfers: 5,
          failedTransactions: 0,
        }}
      />
    )

    expect(screen.queryByText(/failed transactions/i)).not.toBeInTheDocument()
  })

  it('should show failed transactions when count > 0', () => {
    render(
      <Statistics
        stats={{
          totalTransactions: 10,
          ethTransfers: 5,
          tokenTransfers: 5,
          failedTransactions: 2,
        }}
      />
    )

    expect(screen.getByText(/failed transactions/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
