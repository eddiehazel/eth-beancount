import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('renders message text', () => {
    render(<StatusMessage message="Test message" type="info" />)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders with info styling', () => {
    render(<StatusMessage message="Info message" type="info" />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-blue-50')
  })

  it('renders with success styling', () => {
    render(<StatusMessage message="Success message" type="success" />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-green-50')
  })

  it('renders with error styling', () => {
    render(<StatusMessage message="Error message" type="error" />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-red-50')
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn()
    render(<StatusMessage message="Dismissable" type="info" onDismiss={handleDismiss} />)
    const dismissButton = screen.getByLabelText('Dismiss')
    fireEvent.click(dismissButton)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<StatusMessage message="Not dismissable" type="info" />)
    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument()
  })
})
