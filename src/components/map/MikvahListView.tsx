'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, Users } from 'lucide-react'
import { Mikvah } from '@/lib/supabase/database.types'
import { useTranslation } from 'react-i18next'

interface MikvahListViewProps {
  mikvahs: Mikvah[]
  onMikvahSelect: (mikvah: Mikvah) => void
  selectedMikvahId?: string
}

// Extended type for mikvahs with distance
type MikvahWithDistance = Mikvah & { distance?: number }

export function MikvahListView({ mikvahs, onMikvahSelect, selectedMikvahId }: MikvahListViewProps) {
  const { t } = useTranslation()

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('map.nearbyMikvahs')}</h3>
        <Badge variant="secondary">{mikvahs.length} {t('map.results')}</Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mikvahs.map((mikvah: MikvahWithDistance) => (
          <Card 
            key={mikvah.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMikvahId === mikvah.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onMikvahSelect(mikvah)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2">
                {mikvah.name_en || mikvah.name_he}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{mikvah.address}</span>
                </div>

                {/* Phone */}
                {mikvah.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{mikvah.phone}</span>
                  </div>
                )}

                {/* Hours */}
                {mikvah.hours_of_operation && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5" />
                    <span className="line-clamp-1">
                      {typeof mikvah.hours_of_operation === 'string'
                        ? mikvah.hours_of_operation
                        : 'See details'}
                    </span>
                  </div>
                )}

                {/* Type and Distance */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {getMikvahTypeLabel(mikvah.mikvah_type)}
                  </Badge>
                  
                  {mikvah.distance && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(mikvah.distance)}
                    </span>
                  )}
                </div>

                {/* Additional Info */}
                {mikvah.mikvah_type && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{getMikvahTypeLabel(mikvah.mikvah_type)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
