'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FileText, MapPin as MapPinIcon, Info, Image as ImageIcon, X } from 'lucide-react'
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
import { ProgressSteps } from '@/components/ui/progress-steps'

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

  const handlePhotoRemove = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        // Step 1 requires name_en and address
        const nameEn = watch('name_en')
        const addressValue = watch('address')
        return !!nameEn && nameEn.trim().length > 0 && !!addressValue && addressValue.trim().length > 0
      case 2:
        // Step 2 requires location selection
        return !!selectedLocation
      case 3:
        // Step 3 has no required fields
        return true
      case 4:
        // Step 4 has no required fields
        return true
      default:
        return false
    }
  }

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const photo of photos) {
      const fileName = `${userId}/${Date.now()}-${photo.name}`
      const { data, error } = await supabase.storage
        .from('mikvah-photos')
        .upload(fileName, photo)

      if (!error) {
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

  const steps = [
    {
      label: t('submit.basicInfo') || 'Basic Info',
      icon: <FileText className="h-5 w-5" />,
      description: t('submit.basicInfoDesc') || 'Name and contact',
    },
    {
      label: t('submit.location') || 'Location',
      icon: <MapPinIcon className="h-5 w-5" />,
      description: t('submit.locationDesc') || 'Pin on map',
    },
    {
      label: t('submit.details') || 'Details',
      icon: <Info className="h-5 w-5" />,
      description: t('submit.detailsDesc') || 'Additional info',
    },
    {
      label: t('submit.photos') || 'Photos',
      icon: <ImageIcon className="h-5 w-5" />,
      description: t('submit.photosDesc') || 'Add images',
    },
  ]

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('submit.title')}</CardTitle>
          <CardDescription>
            {t('submit.description') || 'Submit a new mikvah location'}
          </CardDescription>
          <div className="mt-6">
            <ProgressSteps steps={steps} currentStep={step} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{t('submit.selectLocation')}</p>
                  {!selectedLocation && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Click on the map to select location
                    </span>
                  )}
                </div>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <MapView
                    mikvahs={[]}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation || undefined}
                    showSearch={true}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                {selectedLocation ? (
                  <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">✓ Location Selected</p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      Please click on the map or search for an address to select a location
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                      <div key={idx} className="relative aspect-square group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handlePhotoRemove(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto"
                  disabled={!isStepValid(step)}
                >
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
