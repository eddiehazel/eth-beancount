import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(localStorage.getItem).mockReturnValue(null)
  })

  it('should render the main app components', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /eth to beancount/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/ethereum addresses/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/etherscan api key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeInTheDocument()
  })

  it('should disable Fetch button when no addresses entered', () => {
    render(<App />)

    // Button should be disabled when no addresses
    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeDisabled()
  })

  it('should disable Fetch button when no valid addresses', () => {
    render(<App />)

    const textarea = screen.getByLabelText(/ethereum addresses/i)
    fireEvent.change(textarea, { target: { value: 'invalid-address' } })

    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeDisabled()
  })

  it('should enable Fetch button when valid address entered', () => {
    render(<App />)

    const textarea = screen.getByLabelText(/ethereum addresses/i)
    fireEvent.change(textarea, { target: { value: '0x742d35Cc6634C0532925a3b844Bc9e7595f2e678' } })

    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeEnabled()
  })

  it('should fetch and display transactions', async () => {
    const mockTransactions = [
      {
        blockNumber: '12345',
        timeStamp: '1704067200',
        hash: '0xabc123',
        from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        to: '0x1234567890123456789012345678901234567890',
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '50000000000',
        gasUsed: '21000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        cumulativeGasUsed: '21000',
        confirmations: '100',
        methodId: '0x',
        functionName: '',
      },
    ]

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: mockTransactions,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'No transactions found',
          result: [],
        }),
      } as Response)

    render(<App />)

    const textarea = screen.getByLabelText(/ethereum addresses/i)
    fireEvent.change(textarea, { target: { value: '0x742d35Cc6634C0532925a3b844Bc9e7595f2e678' } })

    fireEvent.click(screen.getByRole('button', { name: /fetch transactions/i }))

    await waitFor(() => {
      expect(screen.getByText(/transactions fetched successfully/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/total transactions/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/beancount output/i)).toBeInTheDocument()
  })

  it('should clear saved data when Clear Saved Data clicked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /clear saved data/i }))

    expect(localStorage.removeItem).toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/saved data cleared/i)
  })

  it('should load saved addresses from localStorage', () => {
    const savedAddresses = '0x742d35Cc6634C0532925a3b844Bc9e7595f2e678:my-wallet'
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === 'eth-beancount-addresses') return savedAddresses
      return null
    })

    render(<App />)

    expect(screen.getByLabelText(/ethereum addresses/i)).toHaveValue(savedAddresses)
  })

  it('should display footer with attribution', () => {
    render(<App />)

    // Footer contains Etherscan link and client-side mention
    expect(screen.getByRole('link', { name: /etherscan/i })).toBeInTheDocument()
    expect(screen.getByText(/client-side/i)).toBeInTheDocument()
  })
})
