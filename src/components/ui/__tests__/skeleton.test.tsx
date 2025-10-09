import { render } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'custom-class')
  })

  it('passes through other props', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton).toHaveAttribute('data-testid', 'skeleton')
  })
})
