'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Phone,
  Clock,
  Users,
  Navigation,
  MessageSquare,
  Star,
  PenSquare
} from 'lucide-react'
import { Mikvah } from '@/lib/supabase/database.types'
import { useTranslation } from 'react-i18next'
import { createClient } from '@/lib/supabase/client'
import { CorrectionForm } from './CorrectionForm'
import { ReviewsList } from '@/components/reviews/ReviewsList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { StarRating } from '@/components/ui/star-rating'
import { FavoriteButton } from '@/components/ui/favorite-button'
import { ReportMikvahForm } from '@/components/community/ReportMikvahForm'
import { VerifyButton } from '@/components/community/VerifyButton'
import { QASection } from '@/components/community/QASection'

// Extended type for mikvahs with distance
type MikvahWithDistance = Mikvah & { distance?: number }

interface MikvahDetailsModalProps {
  mikvah: Mikvah | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (mikvah: Mikvah) => void
}

export function MikvahDetailsModal({ mikvah, isOpen, onClose, onNavigate }: MikvahDetailsModalProps) {
  const { t } = useTranslation()
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (mikvah?.id) {
      loadRatings()
    }
  }, [mikvah?.id])

  const loadRatings = async () => {
    if (!mikvah) return

    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('mikvah_id', mikvah.id)
      .eq('is_approved', true)

    if (!error && data && data.length > 0) {
      const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length
      setAverageRating(avg)
      setReviewCount(data.length)
    } else {
      setAverageRating(null)
      setReviewCount(0)
    }
  }

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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle>
                {mikvah.name_en || mikvah.name_he}
              </DialogTitle>
              {averageRating !== null && (
                <div className="mt-2">
                  <StarRating
                    rating={averageRating}
                    showCount={true}
                    count={reviewCount}
                    size="sm"
                  />
                </div>
              )}
            </div>
            <FavoriteButton
              mikvahId={mikvah.id}
              size="sm"
              variant="ghost"
              className="ml-2"
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">{t('mikvah.details') || 'Details'}</TabsTrigger>
            <TabsTrigger value="reviews">
              {t('reviews.title') || 'Reviews'} {reviewCount > 0 && `(${reviewCount})`}
            </TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
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
          <div className="space-y-3">
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
                Suggest Edit
              </Button>
            </div>

            {/* Community Actions */}
            <div className="flex gap-3">
              <VerifyButton
                mikvahId={mikvah.id}
                verificationCount={(mikvah as any).verification_count || 0}
                onVerified={loadRatings}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportForm(true)}
                className="flex-1"
              >
                Report Issue
              </Button>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {t('reviews.title') || 'Reviews'}
                </h3>
                <Button onClick={() => setShowReviewForm(true)} size="sm">
                  <PenSquare className="h-4 w-4 mr-2" />
                  {t('reviews.writeReview') || 'Write Review'}
                </Button>
              </div>

              <ReviewsList mikvahId={mikvah.id} />
            </div>
          </TabsContent>

          <TabsContent value="qa" className="mt-4">
            <QASection mikvahId={mikvah.id} />
          </TabsContent>
        </Tabs>

        {/* Correction Form Modal */}
        {showCorrectionForm && (
          <CorrectionForm
            mikvah={mikvah}
            isOpen={showCorrectionForm}
            onClose={() => setShowCorrectionForm(false)}
          />
        )}

        {/* Review Form Modal */}
        <ReviewForm
          mikvahId={mikvah.id}
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            loadRatings()
          }}
        />

        {/* Report Form Modal */}
        {mikvah && (
          <ReportMikvahForm
            mikvah={mikvah}
            isOpen={showReportForm}
            onClose={() => setShowReportForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
