import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiKeyInput } from './ApiKeyInput'

describe('ApiKeyInput', () => {
  it('should render password input with label', () => {
    render(<ApiKeyInput value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/etherscan api key/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/etherscan api key/i)).toHaveAttribute('type', 'password')
  })

  it('should call onChange when typing', () => {
    const handleChange = vi.fn()

    render(<ApiKeyInput value="" onChange={handleChange} />)

    const input = screen.getByLabelText(/etherscan api key/i)
    fireEvent.change(input, { target: { value: 'test-api-key' } })

    expect(handleChange).toHaveBeenCalledWith('test-api-key')
  })

  it('should display current value', () => {
    render(<ApiKeyInput value="my-api-key" onChange={() => {}} />)

    expect(screen.getByLabelText(/etherscan api key/i)).toHaveValue('my-api-key')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ApiKeyInput value="" onChange={() => {}} disabled />)

    expect(screen.getByLabelText(/etherscan api key/i)).toBeDisabled()
  })

  it('should show hint about optional API key', () => {
    render(<ApiKeyInput value="" onChange={() => {}} />)

    expect(screen.getByText(/optional/i)).toBeInTheDocument()
  })
})
