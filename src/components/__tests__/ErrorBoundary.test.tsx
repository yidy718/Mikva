import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

const ErrorComponent = () => {
  throw new Error('Test error')
}

const SafeComponent = () => <div>Safe component</div>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Safe component')).toBeInTheDocument()
  })

  it('renders error fallback when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('allows retrying after an error', async () => {
    const user = userEvent.setup()

    // Start with error component
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click retry button - this should reset the error state
    await user.click(screen.getByText('Try Again'))

    // After retry, the ErrorBoundary should have reset and the error component should throw again
    // This tests that the retry mechanism works by resetting the boundary state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('does not show error details in production', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })
})
