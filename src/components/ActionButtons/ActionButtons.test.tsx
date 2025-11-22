import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionButtons } from './ActionButtons'

describe('ActionButtons', () => {
  const defaultProps = {
    onFetch: vi.fn(),
    onClear: vi.fn(),
    onClearSavedData: vi.fn(),
    hasOutput: false,
    output: '',
    isLoading: false,
    hasAddresses: true,
  }

  it('should render Fetch Transactions button', () => {
    render(<ActionButtons {...defaultProps} />)

    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeInTheDocument()
  })

  it('should render Clear button', () => {
    render(<ActionButtons {...defaultProps} />)

    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument()
  })

  it('should render Clear Saved Data button', () => {
    render(<ActionButtons {...defaultProps} />)

    expect(screen.getByRole('button', { name: /clear saved data/i })).toBeInTheDocument()
  })

  it('should not render Download button when hasOutput is false', () => {
    render(<ActionButtons {...defaultProps} />)

    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument()
  })

  it('should render Download button when hasOutput is true', () => {
    render(<ActionButtons {...defaultProps} hasOutput={true} output="test" />)

    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
  })

  it('should call onFetch when Fetch button clicked', () => {
    const onFetch = vi.fn()

    render(<ActionButtons {...defaultProps} onFetch={onFetch} />)

    fireEvent.click(screen.getByRole('button', { name: /fetch transactions/i }))

    expect(onFetch).toHaveBeenCalledTimes(1)
  })

  it('should call onClear when Clear button clicked', () => {
    const onClear = vi.fn()

    render(<ActionButtons {...defaultProps} onClear={onClear} />)

    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('should call onClearSavedData when Clear Saved Data button clicked', () => {
    const onClearSavedData = vi.fn()

    render(<ActionButtons {...defaultProps} onClearSavedData={onClearSavedData} />)

    fireEvent.click(screen.getByRole('button', { name: /clear saved data/i }))

    expect(onClearSavedData).toHaveBeenCalledTimes(1)
  })

  it('should disable Fetch button when isLoading is true', () => {
    render(<ActionButtons {...defaultProps} isLoading={true} />)

    expect(screen.getByRole('button', { name: /fetching/i })).toBeDisabled()
  })

  it('should disable Fetch button when hasAddresses is false', () => {
    render(<ActionButtons {...defaultProps} hasAddresses={false} />)

    expect(screen.getByRole('button', { name: /fetch transactions/i })).toBeDisabled()
  })

  it('should show Fetching... text when isLoading', () => {
    render(<ActionButtons {...defaultProps} isLoading={true} />)

    expect(screen.getByRole('button', { name: /fetching/i })).toBeInTheDocument()
  })
})
