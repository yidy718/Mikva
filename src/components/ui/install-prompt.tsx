'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, Smartphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    setIsStandalone(isStandalone || isInWebAppiOS)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay to not be too intrusive
      setTimeout(() => {
        if (!localStorage.getItem('install-prompt-dismissed')) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show iOS install instructions if not standalone
    if (iOS && !isInWebAppiOS && !localStorage.getItem('ios-install-shown')) {
      setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setShowPrompt(false)
      }

      setDeferredPrompt(null)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Install prompt failed:', error)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('install-prompt-dismissed', 'true')
    if (isIOS) {
      localStorage.setItem('ios-install-shown', 'true')
    }
  }

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) {
    return null
  }

  if (isIOS) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install Mikvah Locator</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Install this app on your iPhone for the best experience with offline access and quick launch.
          </CardDescription>
          <div className="space-y-2 text-sm">
            <p>1. Tap the share button <span className="inline-block w-6 h-6 bg-gray-200 rounded mx-1 align-middle">⬆️</span></p>
            <p>2. Scroll down and tap &ldquo;Add to Home Screen&rdquo;</p>
            <p>3. Tap &ldquo;Add&rdquo; to install</p>
          </div>
          <Button onClick={handleDismiss} className="w-full mt-4" variant="outline">
            Got it!
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Standard install prompt for other devices
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Install Mikvah Locator</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Install this app for offline access, quick launch, and a native app experience.
        </CardDescription>
        <div className="flex gap-2">
          <Button onClick={handleInstallClick} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button onClick={handleDismiss} variant="outline">
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
