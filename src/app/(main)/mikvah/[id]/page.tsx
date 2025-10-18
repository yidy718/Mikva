'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Navigation, Phone, MapPin, Clock, DollarSign, Share2 } from 'lucide-react'
import type { Mikvah } from '@/lib/types'

export default function MikvahDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const [mikvah, setMikvah] = useState<Mikvah | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadMikvah = useCallback(async (id: string) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('mikvahs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error loading mikvah:', error)
    } else {
      setMikvah(data)
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    if (params.id) {
      loadMikvah(params.id as string)
    }
  }, [params.id, loadMikvah])

  const handleGetDirections = () => {
    if (!mikvah) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mikvah.latitude},${mikvah.longitude}`
    window.open(url, '_blank')
  }

  const handleShare = async () => {
    if (!mikvah) return
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: mikvah.name_en,
          text: `${mikvah.name_en} - ${mikvah.address}`,
          url,
        })
        toast.success('Shared successfully')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  if (!mikvah) {
    return (
      <div className="container py-8">
        <p>{t('common.error')}</p>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">{mikvah.name_en}</h1>
          {mikvah.name_he && (
            <p className="text-2xl text-muted-foreground mt-2">{mikvah.name_he}</p>
          )}
          <div className="flex gap-2 mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleGetDirections}>
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('mikvah.getDirections')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open in Google Maps</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('mikvah.share')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this mikvah</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Photos */}
        {mikvah.photos && mikvah.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mikvah.photos.map((photo, idx) => (
              <div key={idx} className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={photo}
                  alt={`${mikvah.name_en} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}

        {/* Main Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('mikvah.details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('mikvah.address')}</p>
                <p className="text-muted-foreground">{mikvah.address}</p>
              </div>
            </div>

            {mikvah.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('mikvah.phone')}</p>
                  <a
                    href={`tel:${mikvah.phone}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {mikvah.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('mikvah.type')}</p>
                <p className="text-muted-foreground capitalize">
                  {mikvah.mikvah_type.replace('_', ' ')}
                </p>
              </div>
            </div>

            {mikvah.price_info && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('mikvah.price')}</p>
                  <p className="text-muted-foreground">{mikvah.price_info}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(mikvah.directions_parking || mikvah.accessibility_info) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {mikvah.directions_parking && (
                <div>
                  <p className="font-medium mb-2">{t('mikvah.parking')}</p>
                  <p className="text-muted-foreground">{mikvah.directions_parking}</p>
                </div>
              )}

              {mikvah.accessibility_info && (
                <div>
                  <p className="font-medium mb-2">{t('mikvah.accessibility')}</p>
                  <p className="text-muted-foreground">{mikvah.accessibility_info}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
