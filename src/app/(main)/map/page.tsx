'use client'

import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useMikvahs } from '@/lib/hooks/useMikvahs'
import { LoadingScreen } from '@/components/ui/spinner'

// Dynamic import to avoid SSR issues with Mapbox
const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false }
)

export default function MapPage() {
  const { t } = useTranslation()
  const { data: mikvahs = [], isLoading, error } = useMikvahs()

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load mikvahs</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <MapView
        mikvahs={mikvahs}
        showSearch={true}
        isLoading={isLoading}
      />
    </div>
  )
}
