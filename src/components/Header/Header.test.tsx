import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  it('should render the title', () => {
    render(<Header />)

    expect(screen.getByRole('heading', { name: /eth to beancount/i })).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<Header />)

    expect(screen.getByText(/convert your ethereum transactions/i)).toBeInTheDocument()
  })
})
