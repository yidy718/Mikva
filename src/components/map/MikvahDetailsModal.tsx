'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Phone,
  Clock,
  Users,
  Navigation,
  MessageSquare
} from 'lucide-react'
import { Mikvah } from '@/lib/supabase/database.types'

// Extended type for mikvahs with distance
type MikvahWithDistance = Mikvah & { distance?: number }
import { useTranslation } from 'react-i18next'
import { CorrectionForm } from './CorrectionForm'

interface MikvahDetailsModalProps {
  mikvah: Mikvah | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (mikvah: Mikvah) => void
}

export function MikvahDetailsModal({ mikvah, isOpen, onClose, onNavigate }: MikvahDetailsModalProps) {
  const { t } = useTranslation()
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)

  if (!mikvah) return null

  const mikvahWithDistance = mikvah as MikvahWithDistance

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

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(mikvah)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mikvah.name_en || mikvah.name_he}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{mikvah.address}</p>
                    {mikvahWithDistance.distance && (
                      <p className="text-sm text-muted-foreground">
                        {formatDistance(mikvahWithDistance.distance)} {t('map.away')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                {mikvah.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{mikvah.phone}</p>
                      <a 
                        href={`tel:${mikvah.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('mikvah.call')}
                      </a>
                    </div>
                  </div>
                )}

                {/* Hours */}
                {mikvah.hours_of_operation && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{t('mikvah.hours')}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof mikvah.hours_of_operation === 'string'
                          ? mikvah.hours_of_operation
                          : JSON.stringify(mikvah.hours_of_operation)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Type */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('mikvah.type')}</p>
                    <Badge variant="outline">
                      {getMikvahTypeLabel(mikvah.mikvah_type)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          {(mikvah.directions_parking || mikvah.accessibility_info) && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">{t('mikvah.details')}</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {mikvah.directions_parking && (
                    <p><strong>{t('mikvah.parking')}:</strong> {mikvah.directions_parking}</p>
                  )}
                  {mikvah.accessibility_info && (
                    <p><strong>{t('mikvah.accessibility')}:</strong> {mikvah.accessibility_info}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {mikvah.photos && mikvah.photos.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">{t('mikvah.photos')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {mikvah.photos.map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`${mikvah.name_en} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onNavigate && (
              <Button onClick={handleNavigate} className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                {t('mikvah.navigate')}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowCorrectionForm(true)}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('mikvah.reportCorrection')}
            </Button>
          </div>
        </div>

        {/* Correction Form Modal */}
        {showCorrectionForm && (
          <CorrectionForm
            mikvah={mikvah}
            isOpen={showCorrectionForm}
            onClose={() => setShowCorrectionForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
