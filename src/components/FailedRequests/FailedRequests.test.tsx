import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FailedRequests } from './FailedRequests'

describe('FailedRequests', () => {
  it('should render nothing when no failed addresses', () => {
    const { container } = render(
      <FailedRequests failedAddresses={new Map()} onRetry={() => {}} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should display failed addresses', () => {
    const failedAddresses = new Map([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          error: 'Rate limit exceeded',
        },
      ],
    ])

    render(<FailedRequests failedAddresses={failedAddresses} onRetry={() => {}} />)

    expect(screen.getByText(/failed requests/i)).toBeInTheDocument()
    expect(screen.getByText(/0x742d35/i)).toBeInTheDocument()
    expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
  })

  it('should display nickname when provided', () => {
    const failedAddresses = new Map([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          nickname: 'my-wallet',
          error: 'Error',
        },
      ],
    ])

    render(<FailedRequests failedAddresses={failedAddresses} onRetry={() => {}} />)

    expect(screen.getByText(/my-wallet/i)).toBeInTheDocument()
  })

  it('should call onRetry when retry button clicked', () => {
    const handleRetry = vi.fn()

    const failedAddresses = new Map([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          nickname: 'test-wallet',
          error: 'Error',
        },
      ],
    ])

    render(
      <FailedRequests failedAddresses={failedAddresses} onRetry={handleRetry} />
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    expect(handleRetry).toHaveBeenCalledWith(
      '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
      'test-wallet'
    )
  })

  it('should disable retry buttons when disabled prop is true', () => {
    const failedAddresses = new Map([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          error: 'Error',
        },
      ],
    ])

    render(
      <FailedRequests
        failedAddresses={failedAddresses}
        onRetry={() => {}}
        disabled
      />
    )

    expect(screen.getByRole('button', { name: /retry/i })).toBeDisabled()
  })
})
