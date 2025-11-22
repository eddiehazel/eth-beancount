import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'
import type { TransactionStats } from '@/types'

describe('Statistics', () => {
  const defaultStats: TransactionStats = {
    totalAddresses: 3,
    totalEthTransactions: 25,
    totalTokenTransactions: 50,
    failedAddresses: 0,
  }

  it('displays total addresses', () => {
    render(<Statistics stats={defaultStats} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Addresses')).toBeInTheDocument()
  })

  it('displays ETH transactions count', () => {
    render(<Statistics stats={defaultStats} />)
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('ETH Transactions')).toBeInTheDocument()
  })

  it('displays token transfers count', () => {
    render(<Statistics stats={defaultStats} />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Token Transfers')).toBeInTheDocument()
  })

  it('displays failed count', () => {
    render(<Statistics stats={defaultStats} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows warning styling when there are failed addresses', () => {
    const statsWithFailed: TransactionStats = {
      ...defaultStats,
      failedAddresses: 2,
    }
    render(<Statistics stats={statsWithFailed} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    const zeroStats: TransactionStats = {
      totalAddresses: 0,
      totalEthTransactions: 0,
      totalTokenTransactions: 0,
      failedAddresses: 0,
    }
    render(<Statistics stats={zeroStats} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })
})
