'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { mikvahSubmissionSchema, type MikvahSubmissionData } from '@/lib/validations/mikvah'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressInput } from '@/components/ui/address-input'
import { type GeocodingResult } from '@/lib/geocoding'
import { Spinner } from '@/components/ui/spinner'

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false }
)

export default function SubmitPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [address, setAddress] = useState('')
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MikvahSubmissionData>({
    resolver: zodResolver(mikvahSubmissionSchema),
    defaultValues: {
      mikvah_type: 'separate_hours',
    },
  })

  const mikvahType = watch('mikvah_type')
  const watchedAddress = watch('address')

  // Sync address state with form
  useEffect(() => {
    if (watchedAddress && watchedAddress !== address) {
      setAddress(watchedAddress)
    }
  }, [watchedAddress, address])

  const handleMapClick = (lng: number, lat: number) => {
    setSelectedLocation({ lng, lat })
    setValue('longitude', lng)
    setValue('latitude', lat)
  }

  const handleLocationSelect = (result: GeocodingResult) => {
    const [lng, lat] = result.center
    console.log('Location selected:', result) // Debug log
    setSelectedLocation({ lng, lat })
    setValue('longitude', lng)
    setValue('latitude', lat)
    setValue('address', result.place_name)
    setAddress(result.place_name)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5 - photos.length)
      setPhotos([...photos, ...newPhotos])
    }
  }

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const photo of photos) {
      const fileName = `${userId}/${Date.now()}-${photo.name}`
      const { data, error } = await supabase.storage
        .from('mikvah-photos')
        .upload(fileName, photo)

      if (error) {
        console.error('Error uploading photo:', error)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('mikvah-photos')
          .getPublicUrl(data.path)
        uploadedUrls.push(publicUrl)
      }
    }

    return uploadedUrls
  }

  const onSubmit = async (data: MikvahSubmissionData) => {
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload photos
      const photoUrls = await uploadPhotos(user.id)

      // Submit mikvah
      const { error } = await supabase.from('mikvahs').insert({
        ...data,
        photos: photoUrls,
        submitted_by: user.id,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Mikvah submitted successfully!', {
        description: 'Your submission is pending admin approval.',
      })
      router.push('/map')
    } catch (error) {
      console.error('Error submitting mikvah:', error)
      toast.error('Failed to submit mikvah', {
        description: 'Please try again or contact support.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('submit.title')}</CardTitle>
          <CardDescription>
            {t('submit.step1')} {step}/4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">{t('submit.nameEn')}</Label>
                  <Input id="name_en" {...register('name_en')} />
                  {errors.name_en && (
                    <p className="text-sm text-destructive">{errors.name_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_he">{t('submit.nameHe')}</Label>
                  <Input id="name_he" {...register('name_he')} />
                </div>

                <div className="space-y-2">
                  <AddressInput
                    value={address}
                    onChange={(value) => {
                      setAddress(value)
                      setValue('address', value)
                    }}
                    onLocationSelect={handleLocationSelect}
                    label={t('submit.address')}
                    placeholder="Enter mikvah address worldwide..."
                    error={errors.address?.message}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('submit.phone')}</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>

                <div className="space-y-2">
                  <Label>{t('submit.type')}</Label>
                  <Select
                    value={mikvahType}
                    onValueChange={(value) => setValue('mikvah_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men_only">{t('filters.menOnly')}</SelectItem>
                      <SelectItem value="separate_hours">{t('filters.separateHours')}</SelectItem>
                      <SelectItem value="family">{t('filters.family')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{t('submit.selectLocation')}</p>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <MapView
                    mikvahs={[]}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation || undefined}
                    showSearch={true}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                {selectedLocation && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Location:</p>
                    <p className="text-sm text-muted-foreground">
                      {address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price_info">{t('submit.price')}</Label>
                  <Input id="price_info" {...register('price_info')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="directions_parking">{t('submit.parking')}</Label>
                  <Textarea id="directions_parking" {...register('directions_parking')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibility_info">{t('submit.accessibility')}</Label>
                  <Textarea id="accessibility_info" {...register('accessibility_info')} />
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('submit.uploadPhotos')}</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={photos.length >= 5}
                  />
                  <p className="text-sm text-muted-foreground">
                    {photos.length}/5 photos uploaded
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  {t('submit.back')}
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={() => setStep(step + 1)} className="ml-auto">
                  {t('submit.next')}
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="ml-auto">
                  {isLoading && <Spinner size="sm" className="mr-2" />}
                  {isLoading ? t('submit.submitting') : t('submit.submit')}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
