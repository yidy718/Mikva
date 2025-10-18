'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, Users } from 'lucide-react'
import { Mikvah } from '@/lib/supabase/database.types'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { StarRating } from '@/components/ui/star-rating'
import { MikvahCardSkeleton } from './MikvahCardSkeleton'

interface MikvahListViewProps {
  mikvahs: Mikvah[]
  onMikvahSelect: (mikvah: Mikvah) => void
  selectedMikvahId?: string
  isLoading?: boolean
}

// Extended type for mikvahs with distance and ratings
type MikvahWithDistance = Mikvah & {
  distance?: number
  averageRating?: number
  reviewCount?: number
}

export function MikvahListView({ mikvahs, onMikvahSelect, selectedMikvahId, isLoading = false }: MikvahListViewProps) {
  const { t } = useTranslation()
  const [mikvahsWithRatings, setMikvahsWithRatings] = useState<MikvahWithDistance[]>(mikvahs)
  const supabase = createClient()

  const loadRatings = useCallback(async () => {
    const mikvahIds = mikvahs.map(m => m.id)

    const { data, error } = await supabase
      .from('reviews')
      .select('mikvah_id, rating')
      .in('mikvah_id', mikvahIds)
      .eq('is_approved', true)

    if (!error && data) {
      // Calculate average ratings per mikvah
      const ratingsByMikvah = data.reduce((acc, review) => {
        if (!acc[review.mikvah_id]) {
          acc[review.mikvah_id] = []
        }
        acc[review.mikvah_id].push(review.rating)
        return acc
      }, {} as Record<string, number[]>)

      // Add ratings to mikvahs
      const enriched = mikvahs.map(mikvah => {
        const ratings = ratingsByMikvah[mikvah.id] || []
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : undefined

        return {
          ...mikvah,
          averageRating,
          reviewCount: ratings.length,
        }
      })

      setMikvahsWithRatings(enriched)
    }
  }, [mikvahs, supabase])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const getMikvahTypeLabel = (type: string) => {
    switch (type) {
      case 'separate_hours':
        return t('mikvah.types.separateHours')
      case 'mixed_hours':
        return t('mikvah.types.mixedHours')
      case 'women_only':
        return t('mikvah.types.womenOnly')
      default:
        return type
    }
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return ''
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="space-y-3 flex-1 overflow-y-auto py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <MikvahCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-3 flex-1 overflow-y-auto py-4">
        {mikvahsWithRatings.map((mikvah: MikvahWithDistance) => (
          <Card
            key={mikvah.id}
            className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
              selectedMikvahId === mikvah.id ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => onMikvahSelect(mikvah)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {mikvah.name_en || mikvah.name_he}
                </CardTitle>
                {mikvah.averageRating !== undefined && mikvah.reviewCount && mikvah.reviewCount > 0 && (
                  <div className="flex-shrink-0">
                    <StarRating
                      rating={mikvah.averageRating}
                      size="sm"
                      showCount={false}
                    />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-2">
              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{mikvah.address}</span>
              </div>

              {/* Phone */}
              {mikvah.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{mikvah.phone}</span>
                </div>
              )}

              {/* Type and Distance */}
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {getMikvahTypeLabel(mikvah.mikvah_type)}
                </Badge>

                {mikvah.distance && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDistance(mikvah.distance)} away
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
