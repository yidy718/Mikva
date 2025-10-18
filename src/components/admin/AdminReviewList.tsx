import { Card, CardContent } from '@/components/ui/card'
import { AdminReviewCard } from './AdminReviewCard'
import { MessageSquare } from 'lucide-react'

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
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews to moderate</h3>
          <p className="text-muted-foreground">
            New reviews will appear here for approval
          </p>
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
