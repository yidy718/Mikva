import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/ui/star-rating'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  mikvahId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReviewForm({ mikvahId, isOpen, onClose, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
    },
  })

  const rating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to submit a review')
        return
      }

      const { error } = await supabase.from('reviews').insert({
        mikvah_id: mikvahId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this mikvah')
        } else {
          throw error
        }
        return
      }

      toast.success('Review submitted!', {
        description: 'Your review is pending approval.',
      })
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('reviews.writeReview') || 'Write a Review'}</DialogTitle>
          <DialogDescription>
            {t('reviews.reviewDescription') || 'Share your experience to help others'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>{t('reviews.rating') || 'Rating'} *</Label>
            <StarRating
              rating={rating}
              interactive
              onChange={(value) => setValue('rating', value)}
              size="lg"
            />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('reviews.title') || 'Title'} *</Label>
            <Input
              id="title"
              placeholder="Sum up your experience..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">{t('reviews.comment') || 'Your Review'} *</Label>
            <Textarea
              id="comment"
              placeholder="Share details about your visit..."
              rows={5}
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.submitting') || 'Submitting...' : t('reviews.submitReview') || 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
