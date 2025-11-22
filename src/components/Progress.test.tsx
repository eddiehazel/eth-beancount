import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './Progress'
import type { FetchProgress } from '@/types'

describe('Progress', () => {
  it('displays current and total progress', () => {
    const progress: FetchProgress = {
      current: 3,
      total: 10,
    }
    render(<Progress progress={progress} />)
    expect(screen.getByText('3 / 10')).toBeInTheDocument()
  })

  it('displays fetching message', () => {
    const progress: FetchProgress = {
      current: 1,
      total: 5,
    }
    render(<Progress progress={progress} />)
    expect(screen.getByText('Fetching transactions...')).toBeInTheDocument()
  })

  it('displays current address when provided', () => {
    const progress: FetchProgress = {
      current: 2,
      total: 5,
      currentAddress: 'MyWallet',
    }
    render(<Progress progress={progress} />)
    expect(screen.getByText('Processing: MyWallet')).toBeInTheDocument()
  })

  it('does not display current address when not provided', () => {
    const progress: FetchProgress = {
      current: 2,
      total: 5,
    }
    render(<Progress progress={progress} />)
    expect(screen.queryByText(/Processing:/)).not.toBeInTheDocument()
  })

  it('renders progress bar', () => {
    const progress: FetchProgress = {
      current: 5,
      total: 10,
    }
    render(<Progress progress={progress} />)
    // Check that progress bar container exists
    const progressBar = document.querySelector('.bg-blue-600')
    expect(progressBar).toBeInTheDocument()
  })

  it('calculates correct percentage', () => {
    const progress: FetchProgress = {
      current: 1,
      total: 4,
    }
    render(<Progress progress={progress} />)
    const progressBar = document.querySelector('.bg-blue-600') as HTMLElement
    // 1/4 = 25%
    expect(progressBar?.style.width).toBe('25%')
  })
})
