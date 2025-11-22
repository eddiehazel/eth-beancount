import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should show progress when provided', () => {
    render(<LoadingSpinner progress={{ completed: 3, total: 5 }} />)

    expect(screen.getByText(/3\/5/)).toBeInTheDocument()
    expect(screen.getByText(/fetching transactions/i)).toBeInTheDocument()
  })

  it('should show generic loading when progress is 0', () => {
    render(<LoadingSpinner progress={{ completed: 0, total: 0 }} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
