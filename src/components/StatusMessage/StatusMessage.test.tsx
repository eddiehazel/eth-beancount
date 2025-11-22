import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('should render nothing when status is null', () => {
    const { container } = render(<StatusMessage status={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render error message with correct styling', () => {
    render(<StatusMessage status={{ type: 'error', message: 'Error occurred' }} />)

    const message = screen.getByRole('alert')
    expect(message).toHaveTextContent('Error occurred')
    expect(message).toHaveClass('status-error')
  })

  it('should render success message with correct styling', () => {
    render(<StatusMessage status={{ type: 'success', message: 'Success!' }} />)

    const message = screen.getByRole('alert')
    expect(message).toHaveTextContent('Success!')
    expect(message).toHaveClass('status-success')
  })

  it('should render info message with correct styling', () => {
    render(<StatusMessage status={{ type: 'info', message: 'Loading...' }} />)

    const message = screen.getByRole('alert')
    expect(message).toHaveTextContent('Loading...')
    expect(message).toHaveClass('status-info')
  })

  it('should render warning message with correct styling', () => {
    render(<StatusMessage status={{ type: 'warning', message: 'Warning!' }} />)

    const message = screen.getByRole('alert')
    expect(message).toHaveTextContent('Warning!')
    expect(message).toHaveClass('status-warning')
  })
})
