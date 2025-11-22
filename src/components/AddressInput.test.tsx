import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressInput } from './AddressInput'

describe('AddressInput', () => {
  it('renders textarea with label', () => {
    render(<AddressInput value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Ethereum Addresses')).toBeInTheDocument()
  })

  it('displays the provided value', () => {
    const testValue = '0x1234567890abcdef1234567890abcdef12345678'
    render(<AddressInput value={testValue} onChange={() => {}} />)
    const textarea = screen.getByLabelText('Ethereum Addresses')
    expect(textarea).toHaveValue(testValue)
  })

  it('calls onChange when text is entered', () => {
    const handleChange = vi.fn()
    render(<AddressInput value="" onChange={handleChange} />)
    const textarea = screen.getByLabelText('Ethereum Addresses')
    fireEvent.change(textarea, { target: { value: '0x123' } })
    expect(handleChange).toHaveBeenCalledWith('0x123')
  })

  it('disables textarea when disabled prop is true', () => {
    render(<AddressInput value="" onChange={() => {}} disabled />)
    const textarea = screen.getByLabelText('Ethereum Addresses')
    expect(textarea).toBeDisabled()
  })

  it('shows helper text', () => {
    render(<AddressInput value="" onChange={() => {}} />)
    expect(screen.getByText(/Format: address or address:nickname/)).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    render(<AddressInput value="" onChange={() => {}} />)
    const textarea = screen.getByLabelText('Ethereum Addresses')
    expect(textarea).toHaveAttribute('placeholder')
  })
})
