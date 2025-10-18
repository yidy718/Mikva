'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseAccessibilityOptions {
  announceChanges?: boolean
  focusManagement?: boolean
  keyboardNavigation?: boolean
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardNavigation = true,
  } = options

  // Announce changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [announceChanges])

  // Focus management utilities
  const focusElement = useCallback((selector: string) => {
    if (!focusManagement) return

    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }, [focusManagement])

  const trapFocus = useCallback((container: HTMLElement) => {
    if (!focusManagement) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [focusManagement])

  // Keyboard navigation utilities
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    handlers: {
      onEnter?: () => void
      onEscape?: () => void
      onArrowUp?: () => void
      onArrowDown?: () => void
      onArrowLeft?: () => void
      onArrowRight?: () => void
      onSpace?: () => void
    }
  ) => {
    if (!keyboardNavigation) return

    switch (event.key) {
      case 'Enter':
        handlers.onEnter?.()
        break
      case 'Escape':
        handlers.onEscape?.()
        break
      case 'ArrowUp':
        handlers.onArrowUp?.()
        break
      case 'ArrowDown':
        handlers.onArrowDown?.()
        break
      case 'ArrowLeft':
        handlers.onArrowLeft?.()
        break
      case 'ArrowRight':
        handlers.onArrowRight?.()
        break
      case ' ':
        event.preventDefault()
        handlers.onSpace?.()
        break
    }
  }, [keyboardNavigation])

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string = 'Skip to main content') => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50'
    skipLink.setAttribute('tabindex', '0')
    
    return skipLink
  }, [])

  // High contrast mode detection
  const isHighContrastMode = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches
  }, [])

  // Reduced motion detection
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Color scheme detection
  const prefersDarkMode = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  return {
    announce,
    focusElement,
    trapFocus,
    handleKeyboardNavigation,
    createSkipLink,
    isHighContrastMode,
    prefersReducedMotion,
    prefersDarkMode,
  }
}

// Hook for managing focus on mount/unmount
export function useFocusOnMount(selector: string, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }, [selector, enabled])
}

// Hook for managing focus restoration
export function useFocusRestoration() {
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [])

  return { saveFocus, restoreFocus }
}

// Hook for managing ARIA live regions
export function useLiveRegion(priority: 'polite' | 'assertive' = 'polite') {
  const announce = useCallback((message: string) => {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = message

    document.body.appendChild(liveRegion)

    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }, [priority])

  return { announce }
}
