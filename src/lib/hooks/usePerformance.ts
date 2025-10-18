'use client'

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized callback hook
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T
}

// Memoized value hook with custom equality function
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  isEqual?: (a: T, b: T) => boolean
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !isEqualDeps(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

// Helper function to compare dependencies
function isEqualDeps(a: React.DependencyList, b: React.DependencyList): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index])
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// Virtual scrolling hook
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStart = useRef<number>()
  const renderCount = useRef(0)

  useEffect(() => {
    renderStart.current = performance.now()
    renderCount.current += 1

    return () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`)
        }
      }
    }
  })

  return {
    renderCount: renderCount.current,
  }
}

// Memory usage monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = useRef<HTMLImageElement>()

  useEffect(() => {
    const img = new Image()
    imgRef.current = img

    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
      setIsError(false)
    }

    img.onerror = () => {
      setIsError(true)
      setIsLoaded(false)
    }

    img.src = src

    return () => {
      if (imgRef.current) {
        imgRef.current.onload = null
        imgRef.current.onerror = null
      }
    }
  }, [src])

  return { imageSrc, isLoaded, isError }
}

// Bundle size optimization hook
export function useCodeSplitting<T>(
  importFn: () => Promise<T>,
  fallback?: T
) {
  const [component, setComponent] = useState<T | null>(fallback || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (component && !isLoading) return component

    setIsLoading(true)
    setError(null)

    try {
      const loadedComponent = await importFn()
      setComponent(loadedComponent)
      return loadedComponent
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [importFn, component, isLoading])

  return {
    component,
    isLoading,
    error,
    loadComponent,
  }
}
