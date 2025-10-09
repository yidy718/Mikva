'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n/config'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Update HTML dir attribute based on language
    const updateDirection = () => {
      const dir = i18n.language === 'he' ? 'rtl' : 'ltr'
      document.documentElement.setAttribute('dir', dir)
    }

    updateDirection()
    i18n.on('languageChanged', updateDirection)

    return () => {
      i18n.off('languageChanged', updateDirection)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
