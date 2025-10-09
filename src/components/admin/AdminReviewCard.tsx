import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, Trash2 } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'

interface AdminReviewCardProps {
  review: {
    id: string
    title: string
    comment: string
    rating: number
    created_at: string
    mikvahs?: {
      name_en: string
      name_he: string | null
    }
  }
  onApprove?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminReviewCard({ review, onApprove, onDelete }: AdminReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" showCount={false} />
              <h3 className="text-base font-semibold">{review.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              For: {review.mikvahs?.name_en || 'Unknown Mikvah'}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onApprove?.(review.id)}
                  aria-label={`Approve review: ${review.title}`}
                >
                  <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                  Approve
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Approve this review</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete?.(review.id)}
                  aria-label={`Delete review: ${review.title}`}
                >
                  <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this review</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{review.comment}</p>
      </CardContent>
    </Card>
  )
}
