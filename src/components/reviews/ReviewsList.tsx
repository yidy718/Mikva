import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  helpful_count: number
  created_at: string
  user_id: string
}

interface ReviewsListProps {
  mikvahId: string
}

export function ReviewsList({ mikvahId }: ReviewsListProps) {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    loadReviews()
    loadUserVotes()
  }, [mikvahId])

  const loadReviews = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('mikvah_id', mikvahId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading reviews:', error)
    } else {
      setReviews(data || [])
    }
    setIsLoading(false)
  }

  const loadUserVotes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('review_votes')
      .select('review_id, is_helpful')
      .eq('user_id', user.id)

    if (!error && data) {
      const votes: Record<string, boolean> = {}
      data.forEach(vote => {
        votes[vote.review_id] = vote.is_helpful
      })
      setUserVotes(votes)
    }
  }

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    const existingVote = userVotes[reviewId]

    if (existingVote === isHelpful) {
      // Remove vote
      const { error } = await supabase
        .from('review_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id)

      if (!error) {
        const newVotes = { ...userVotes }
        delete newVotes[reviewId]
        setUserVotes(newVotes)
        await loadReviews()
      }
    } else {
      // Add or update vote
      const { error } = await supabase
        .from('review_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        })

      if (!error) {
        setUserVotes({ ...userVotes, [reviewId]: isHelpful })
        await loadReviews()
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('reviews.noReviews') || 'No reviews yet. Be the first to review!'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <Card key={review.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <StarRating rating={review.rating} size="sm" />
                <h4 className="font-semibold">{review.title}</h4>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{review.comment}</p>

            {/* Helpful buttons */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground mr-2">
                {t('reviews.helpful') || 'Helpful?'}
              </span>
              <Button
                variant={userVotes[review.id] === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote(review.id, true)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {review.helpful_count > 0 && review.helpful_count}
              </Button>
              <Button
                variant={userVotes[review.id] === false ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote(review.id, false)}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
