import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddressInput } from './AddressInput'

describe('AddressInput', () => {
  it('should render textarea with label', () => {
    render(<AddressInput value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/ethereum addresses/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should display placeholder text', () => {
    render(<AddressInput value="" onChange={() => {}} />)

    expect(screen.getByPlaceholderText(/0x742d35/i)).toBeInTheDocument()
  })

  it('should call onChange when typing', () => {
    const handleChange = vi.fn()

    render(<AddressInput value="" onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })

    expect(handleChange).toHaveBeenCalledWith('test')
  })

  it('should display current value', () => {
    const testValue = '0x742d35Cc6634C0532925a3b844Bc9e7595f2e678'
    render(<AddressInput value={testValue} onChange={() => {}} />)

    expect(screen.getByRole('textbox')).toHaveValue(testValue)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<AddressInput value="" onChange={() => {}} disabled />)

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should show hint about nickname format', () => {
    render(<AddressInput value="" onChange={() => {}} />)

    expect(screen.getByText(/address:nickname/i)).toBeInTheDocument()
  })
})
