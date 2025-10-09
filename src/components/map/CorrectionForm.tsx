'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mikvah } from '@/lib/supabase/database.types'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle } from 'lucide-react'

const correctionSchema = z.object({
  type: z.enum(['incorrect_info', 'missing_info', 'outdated_info', 'other']),
  field: z.string().optional(),
  current_value: z.string().optional(),
  suggested_value: z.string().min(1, 'Please provide a suggested correction'),
  description: z.string().min(10, 'Please provide a detailed description'),
  contact_email: z.string().email().optional().or(z.literal('')),
})

type CorrectionFormData = z.infer<typeof correctionSchema>

interface CorrectionFormProps {
  mikvah: Mikvah
  isOpen: boolean
  onClose: () => void
}

export function CorrectionForm({ mikvah, isOpen, onClose }: CorrectionFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CorrectionFormData>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      type: 'incorrect_info',
      current_value: '',
      suggested_value: '',
      description: '',
      contact_email: '',
    }
  })

  const watchedType = watch('type')

  const correctionTypes = [
    { value: 'incorrect_info', label: t('correction.types.incorrectInfo') },
    { value: 'missing_info', label: t('correction.types.missingInfo') },
    { value: 'outdated_info', label: t('correction.types.outdatedInfo') },
    { value: 'other', label: t('correction.types.other') },
  ]

  const fields = [
    { value: 'name_en', label: t('correction.fields.nameEn') },
    { value: 'name_he', label: t('correction.fields.nameHe') },
    { value: 'address', label: t('correction.fields.address') },
    { value: 'phone', label: t('correction.fields.phone') },
    { value: 'hours', label: t('correction.fields.hours') },
    { value: 'description_en', label: t('correction.fields.descriptionEn') },
    { value: 'description_he', label: t('correction.fields.descriptionHe') },
    { value: 'other', label: t('correction.fields.other') },
  ]

  const onSubmit = async (data: CorrectionFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mikvah_id: mikvah.id,
          ...data,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        reset()
        setTimeout(() => {
          onClose()
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting correction:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitStatus !== 'success') {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {t('correction.reportCorrection')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mikvah Info */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">{t('correction.forMikvah')}</h4>
              <div className="space-y-1 text-sm">
                <p><strong>{t('mikvah.name')}:</strong> {mikvah.name_en || mikvah.name_he}</p>
                <p><strong>{t('mikvah.address')}:</strong> {mikvah.address}</p>
                {mikvah.phone && (
                  <p><strong>{t('mikvah.phone')}:</strong> {mikvah.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Correction Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Correction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('correction.type')}</Label>
              <Select
                value={watchedType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {correctionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field (if not "other") */}
            {watchedType !== 'other' && (
              <div className="space-y-2">
                <Label htmlFor="field">{t('correction.field')}</Label>
                <Select
                  onValueChange={(value) => setValue('field', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('correction.selectField')} />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Current Value */}
            <div className="space-y-2">
              <Label htmlFor="current_value">{t('correction.currentValue')}</Label>
              <Input
                id="current_value"
                {...register('current_value')}
                placeholder={t('correction.currentValuePlaceholder')}
              />
              {errors.current_value && (
                <p className="text-sm text-destructive">{errors.current_value.message}</p>
              )}
            </div>

            {/* Suggested Value */}
            <div className="space-y-2">
              <Label htmlFor="suggested_value">{t('correction.suggestedValue')} *</Label>
              <Input
                id="suggested_value"
                {...register('suggested_value')}
                placeholder={t('correction.suggestedValuePlaceholder')}
              />
              {errors.suggested_value && (
                <p className="text-sm text-destructive">{errors.suggested_value.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('correction.description')} *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('correction.descriptionPlaceholder')}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">{t('correction.contactEmail')}</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder={t('correction.contactEmailPlaceholder')}
              />
              <p className="text-sm text-muted-foreground">
                {t('correction.contactEmailHelp')}
              </p>
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>{t('correction.submittedSuccessfully')}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{t('correction.submissionError')}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || submitStatus === 'success'}
                className="flex-1"
              >
                {isSubmitting ? t('common.submitting') : t('correction.submit')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
