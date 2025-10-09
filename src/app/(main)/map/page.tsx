'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { LoadingScreen } from '@/components/ui/spinner'

// Dynamic import to avoid SSR issues with Mapbox
const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false }
)

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

export default function MapPage() {
  const { t } = useTranslation()
  const [mikvahs, setMikvahs] = useState<Mikvah[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMikvahs()
  }, [])

  const loadMikvahs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('mikvahs')
      .select('*')
      .eq('status', 'approved')

    if (error) {
      console.error('Error loading mikvahs:', error)
    } else {
      setMikvahs(data || [])
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />
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
