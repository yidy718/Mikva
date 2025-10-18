// Component composition utilities for better code organization and reusability

import React from 'react'
import { cn } from '@/lib/utils'

// Higher-order component for adding common props
export function withCommonProps<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = React.forwardRef<
    HTMLElement,
    P & { className?: string; 'data-testid'?: string }
  >(({ className, 'data-testid': testId, ...props }, ref) => {
    return React.createElement(Component, {
      ref,
      className: cn(className),
      'data-testid': testId,
      ...(props as P)
    })
  })
  WrappedComponent.displayName = `withCommonProps(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Utility types for better TypeScript support
export type ComponentWithRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>
export type ComponentWithoutRef<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>

// Conditional rendering utility
export interface ConditionalProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Conditional: React.FC<ConditionalProps> = ({
  condition,
  children,
  fallback = null
}) => {
  return condition ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback)
}
Conditional.displayName = 'Conditional'

// Component state management utility
export interface ComponentState<T> {
  value: T
  setValue: (value: T) => void
  reset: () => void
}

export function useComponentState<T>(initialValue: T): ComponentState<T> {
  const [value, setValue] = React.useState<T>(initialValue)
  
  const reset = React.useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return {
    value,
    setValue,
    reset
  }
}

// Memo with props comparison
export function memoWithProps<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, areEqual)
}