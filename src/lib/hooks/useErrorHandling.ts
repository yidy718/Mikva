'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: number
  userId?: string
  sessionId?: string
}

export interface ErrorHandlingOptions {
  showToast?: boolean
  logToConsole?: boolean
  reportToService?: boolean
  retryable?: boolean
  maxRetries?: number
  retryDelay?: number
}

export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    showToast = true,
    logToConsole = true,
    reportToService = false,
    retryable = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = options

  const [errors, setErrors] = useState<ErrorInfo[]>([])
  const [isRetrying, setIsRetrying] = useState(false)
  const retryCount = useRef(0)

  const handleError = useCallback((
    error: Error | string,
    context?: string,
    customOptions?: Partial<ErrorHandlingOptions>
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorCode = typeof error === 'object' && 'code' in error ? error.code : undefined
    
    const errorInfo: ErrorInfo = {
      message: errorMessage,
      code: errorCode,
      details: typeof error === 'object' ? error : undefined,
      timestamp: Date.now(),
      userId: 'current-user-id', // This would come from auth context
      sessionId: 'current-session-id', // This would be generated
    }

    // Log to console in development
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Error'}]`, errorInfo)
    }

    // Show toast notification
    if (showToast) {
      toast.error(errorMessage, {
        description: context ? `Context: ${context}` : undefined,
        action: retryable ? {
          label: 'Retry',
          onClick: () => retryLastOperation(),
        } : undefined,
      })
    }

    // Report to error service (e.g., Sentry, LogRocket)
    if (reportToService) {
      // This would integrate with your error reporting service
      // reportErrorToService(errorInfo)
    }

    // Add to errors list
    setErrors(prev => [...prev.slice(-9), errorInfo]) // Keep last 10 errors
  }, [showToast, logToConsole, reportToService, retryable])

  const retryLastOperation = useCallback(async () => {
    if (isRetrying || retryCount.current >= maxRetries) return

    setIsRetrying(true)
    retryCount.current += 1

    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount.current))
      
      // This would be implemented by the component using this hook
      // The component would provide a retry function
      toast.info(`Retrying... (${retryCount.current}/${maxRetries})`)
    } catch (error) {
      handleError(error as Error, 'Retry operation')
    } finally {
      setIsRetrying(false)
    }
  }, [isRetrying, maxRetries, retryDelay, handleError])

  const clearErrors = useCallback(() => {
    setErrors([])
    retryCount.current = 0
  }, [])

  const clearError = useCallback((timestamp: number) => {
    setErrors(prev => prev.filter(error => error.timestamp !== timestamp))
  }, [])

  return {
    errors,
    handleError,
    retryLastOperation,
    clearErrors,
    clearError,
    isRetrying,
    retryCount: retryCount.current,
  }
}

// Hook for handling async operations with error handling
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: ErrorHandlingOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { handleError } = useErrorHandling(options)

  const execute = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await operation()
      setData(result)
      return result
    } catch (error) {
      handleError(error as Error, 'Async operation')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [operation, handleError])

  return {
    data,
    isLoading,
    execute,
  }
}

// Hook for handling form errors
export function useFormErrorHandling() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors({})
    setGeneralError(null)
  }, [])

  const setGeneralErrorMessage = useCallback((message: string) => {
    setGeneralError(message)
    toast.error(message)
  }, [setGeneralError])

  const hasErrors = Object.keys(fieldErrors).length > 0 || !!generalError

  return {
    fieldErrors,
    generalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setGeneralError: setGeneralErrorMessage,
    hasErrors,
  }
}

// Hook for handling network errors
export function useNetworkErrorHandling() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good')

  const handleNetworkError = useCallback((error: Error) => {
    if (!navigator.onLine) {
      setIsOnline(false)
      setConnectionQuality('offline')
      toast.error('You are offline. Please check your internet connection.')
    } else {
      setConnectionQuality('poor')
      toast.error('Poor connection detected. Some features may not work properly.')
    }
  }, [])

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        setIsOnline(true)
        setConnectionQuality('good')
      } else {
        setConnectionQuality('poor')
      }
    } catch (error) {
      setIsOnline(false)
      setConnectionQuality('offline')
    }
  }, [])

  return {
    isOnline,
    connectionQuality,
    handleNetworkError,
    checkConnection,
  }
}
