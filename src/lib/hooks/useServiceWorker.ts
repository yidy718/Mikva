import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isInstalling: boolean
  isWaiting: boolean
  isActive: boolean
  updateAvailable: boolean
  registration: ServiceWorkerRegistration | null
}

export const useServiceWorker = () => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
    updateAvailable: false,
    registration: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    setSwState(prev => ({ ...prev, isSupported: true }))

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log('Service Worker registered:', registration)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            setSwState(prev => ({ ...prev, isInstalling: true }))

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setSwState(prev => ({
                  ...prev,
                  isInstalling: false,
                  updateAvailable: true,
                  isWaiting: true,
                }))
              } else if (newWorker.state === 'activated') {
                // New version activated
                setSwState(prev => ({
                  ...prev,
                  isWaiting: false,
                  isActive: true,
                  updateAvailable: false,
                }))
              }
            })
          }
        })

        // Check if there's already a waiting worker
        if (registration.waiting) {
          setSwState(prev => ({
            ...prev,
            updateAvailable: true,
            isWaiting: true,
          }))
        }

        setSwState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
          isActive: !!navigator.serviceWorker.controller,
        }))

        // Listen for controller change (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed')
          setSwState(prev => ({
            ...prev,
            isActive: true,
            updateAvailable: false,
            isWaiting: false,
          }))
        })

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from Service Worker:', event.data)
          if (event.data?.type === 'SYNC_COMPLETED') {
            // Handle sync completion if needed
          }
        })

      } catch (error) {
        console.error('Service Worker registration failed:', error)
        setSwState(prev => ({ ...prev, isSupported: false }))
      }
    }

    registerSW()
  }, [])

  const updateServiceWorker = () => {
    if (swState.registration?.waiting) {
      // Tell the waiting worker to skip waiting
      swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const unregisterServiceWorker = async () => {
    if (swState.registration) {
      await swState.registration.unregister()
      setSwState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }))
    }
  }

  return {
    ...swState,
    updateServiceWorker,
    unregisterServiceWorker,
  }
}
