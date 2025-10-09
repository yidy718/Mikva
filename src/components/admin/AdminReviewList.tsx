import { Card, CardContent } from '@/components/ui/card'
import { AdminReviewCard } from './AdminReviewCard'

interface AdminReviewListProps {
  reviews: Array<{
    id: string
    title: string
    comment: string
    rating: number
    created_at: string
    mikvahs?: {
      name_en: string
      name_he: string | null
    }
  }>
  onApprove?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminReviewList({ reviews, onApprove, onDelete }: AdminReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No pending reviews
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <AdminReviewCard
          key={review.id}
          review={review}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
