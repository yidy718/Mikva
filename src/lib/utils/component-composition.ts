// Component composition utilities for better code organization and reusability

import React from 'react'
import { cn } from './utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/components/ThemeProvider'

// Placeholder for AccessibilityProvider
const AccessibilityProvider: React.FC<{ children: React.ReactNode; config?: any }> = ({ children }) => <>{children}</>

// Higher-order component for adding common props
export function withCommonProps<P extends object>(
  Component: React.ComponentType<P>
) {
  return React.forwardRef<
    HTMLElement,
    P & { className?: string; 'data-testid'?: string }
  >(({ className, 'data-testid': testId, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(className)}
        data-testid={testId}
        {...(props as P)}
      />
    )
  })
}

// Compound component pattern helper
export function createCompoundComponent<T extends Record<string, React.ComponentType<any>>>(
  components: T
): T & { displayName: string } {
  const CompoundComponent = components as T & { displayName: string }
  CompoundComponent.displayName = 'CompoundComponent'
  return CompoundComponent
}

// Slot component for flexible composition
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ asChild, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(props.children as React.ReactElement, {
        ...props,
        ref,
      })
    }
    return <div ref={ref} {...props} />
  }
)
Slot.displayName = 'Slot'

// Polymorphic component utility
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref']

export type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = {
  as?: C
} & React.ComponentPropsWithoutRef<C> &
  Props & {
    ref?: PolymorphicRef<C>
  }

export type PolymorphicComponent<
  DefaultElement extends React.ElementType,
  Props = {}
> = <C extends React.ElementType = DefaultElement>(
  props: PolymorphicComponentProp<C, Props>
) => React.ReactElement | null

// Component variant utility
export interface VariantProps<T extends Record<string, any>> {
  variants?: T
  defaultVariants?: Partial<T>
}

export function createVariantComponent<T extends Record<string, any>>(
  baseComponent: React.ComponentType<any>,
  variantConfig: {
    variants: T
    defaultVariants?: Partial<T>
    compoundVariants?: Array<{
      variants: Partial<T>
      className?: string
    }>
  }
) {
  return React.forwardRef<
    HTMLElement,
    React.ComponentProps<typeof baseComponent> & VariantProps<T>
  >(({ variants, defaultVariants, className, ...props }, ref) => {
    const resolvedVariants = { ...defaultVariants, ...variants }
    
    // Apply compound variants
    let compoundClassName = ''
    if (variantConfig.compoundVariants) {
      for (const compound of variantConfig.compoundVariants) {
        const matches = Object.entries(compound.variants).every(
          ([key, value]) => resolvedVariants[key] === value
        )
        if (matches && compound.className) {
          compoundClassName = cn(compoundClassName, compound.className)
        }
      }
    }

    return (
      <baseComponent
        ref={ref}
        className={cn(className, compoundClassName)}
        {...props}
      />
    )
  })
}

// Context provider composition
export function composeProviders(...providers: React.ComponentType<{ children: React.ReactNode }>[]) {
  return providers.reduce(
    (AccumulatedProviders, CurrentProvider) => {
      return ({ children }: { children: React.ReactNode }) => (
        <AccumulatedProviders>
          <CurrentProvider>{children}</CurrentProvider>
        </AccumulatedProviders>
      )
    },
    ({ children }: { children: React.ReactNode }) => <>{children}</>
  )
}

// Conditional rendering utility
export interface ConditionalProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Conditional: React.FC<ConditionalProps> = ({
  condition,
  children,
  fallback = null,
}) => {
  return condition ? <>{children}</> : <>{fallback}</>
}

// Render prop pattern utility
export interface RenderProps<T = any> {
  children: (props: T) => React.ReactNode
}

export function createRenderPropComponent<T>(
  hook: () => T
): React.FC<RenderProps<T>> {
  return ({ children }) => {
    const props = hook()
    return <>{children(props)}</>
  }
}

// Component state management utility
export interface ComponentState<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  reset: () => void
}

export function useComponentState<T>(initialValue: T): ComponentState<T> {
  const [value, setValue] = React.useState(initialValue)
  
  const reset = React.useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return { value, setValue, reset }
}

// Component lifecycle utilities
export function useComponentDidMount(callback: () => void) {
  React.useEffect(callback, [])
}

export function useComponentWillUnmount(callback: () => void) {
  React.useEffect(() => callback, [])
}

// Component ref forwarding utility
export function forwardRefWithAs<T extends React.ElementType>(
  component: T
): PolymorphicComponent<T> {
  return React.forwardRef(
    (props: PolymorphicComponentProp<T>, ref: PolymorphicRef<T>) => {
      const { as, ...rest } = props
      const Component = as || component
      return <Component ref={ref} {...rest} />
    }
  ) as PolymorphicComponent<T>
}

// Component composition with hooks
export function withHooks<P extends object>(
  Component: React.ComponentType<P>,
  hooks: Array<(props: P) => any>
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    const hookResults = hooks.map(hook => hook(props))
    return <Component ref={ref} {...props} {...hookResults} />
  })
}

// Component memoization utility
export function memoWithProps<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, areEqual)
}

// Component lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn)
  
  return React.forwardRef<HTMLElement, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <LazyComponent ref={ref} {...props} />
    </React.Suspense>
  ))
}

// Component error boundary wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component ref={ref} {...props} />
      </ErrorBoundary>
    )
  })
}

// Component theme wrapper
export function withTheme<P extends object>(
  Component: React.ComponentType<P>,
  themeConfig?: Record<string, any>
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    return (
      <ThemeProvider config={themeConfig}>
        <Component ref={ref} {...props} />
      </ThemeProvider>
    )
  })
}

// Component accessibility wrapper
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  a11yConfig?: Record<string, any>
) {
  return React.forwardRef<HTMLElement, P>((props, ref) => {
    return (
      <AccessibilityProvider config={a11yConfig}>
        <Component ref={ref} {...props} />
      </AccessibilityProvider>
    )
  })
}

// Component composition builder
export class ComponentBuilder<T extends React.ComponentType<any>> {
  private component: T
  private wrappers: Array<(component: React.ComponentType<any>) => React.ComponentType<any>> = []

  constructor(component: T) {
    this.component = component
  }

  withCommonProps() {
    this.wrappers.push(withCommonProps)
    return this
  }

  withErrorBoundary(fallback?: React.ComponentType<{ error: Error; retry: () => void }>) {
    this.wrappers.push(comp => withErrorBoundary(comp, fallback))
    return this
  }

  withTheme(themeConfig?: Record<string, any>) {
    this.wrappers.push(comp => withTheme(comp, themeConfig))
    return this
  }

  withAccessibility(a11yConfig?: Record<string, any>) {
    this.wrappers.push(comp => withAccessibility(comp, a11yConfig))
    return this
  }

  withMemo(areEqual?: (prevProps: any, nextProps: any) => boolean) {
    this.wrappers.push(comp => memoWithProps(comp, areEqual))
    return this
  }

  build(): T {
    return this.wrappers.reduce(
      (component, wrapper) => wrapper(component),
      this.component
    ) as T
  }
}

// Utility function to create a component builder
export function createComponent<T extends React.ComponentType<any>>(component: T) {
  return new ComponentBuilder(component)
}
