import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OutputDisplay } from './OutputDisplay'

describe('OutputDisplay', () => {
  it('should render nothing when output is empty', () => {
    const { container } = render(<OutputDisplay output="" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should display output in textarea', () => {
    const output = '; Beancount output\n2024-01-01 commodity ETH'

    render(<OutputDisplay output={output} />)

    expect(screen.getByRole('textbox')).toHaveValue(output)
  })

  it('should render with copy button', () => {
    render(<OutputDisplay output="test output" />)

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('should copy output to clipboard when copy button clicked', async () => {
    const output = 'test output to copy'
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator.clipboard, { writeText: writeTextMock })

    render(<OutputDisplay output={output} />)

    fireEvent.click(screen.getByRole('button', { name: /copy/i }))

    expect(writeTextMock).toHaveBeenCalledWith(output)
  })

  it('should have readonly textarea', () => {
    render(<OutputDisplay output="test" />)

    expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
  })

  it('should display Beancount Output heading', () => {
    render(<OutputDisplay output="test" />)

    expect(screen.getByText(/beancount output/i)).toBeInTheDocument()
  })
})
