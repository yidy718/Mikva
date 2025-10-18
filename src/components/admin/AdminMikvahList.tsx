import { Card, CardContent } from '@/components/ui/card'
import { AdminMikvahCard } from './AdminMikvahCard'
import { useTranslation } from 'react-i18next'
import { MapPin, CheckCircle } from 'lucide-react'
import type { Mikvah } from '@/lib/types'

interface AdminMikvahListProps {
  mikvahs: Mikvah[]
  showActions: 'pending' | 'approved'
  emptyMessage: string
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onEdit?: (mikvah: Mikvah) => void
  onDelete?: (id: string) => void
}

export function AdminMikvahList({
  mikvahs,
  showActions,
  emptyMessage,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: AdminMikvahListProps) {
  const { t } = useTranslation()

  if (mikvahs.length === 0) {
    const Icon = showActions === 'pending' ? MapPin : CheckCircle
    const description = showActions === 'pending'
      ? 'New submissions will appear here for review'
      : 'Approved mikvahs will be displayed to users'

    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {mikvahs.map((mikvah) => (
        <AdminMikvahCard
          key={mikvah.id}
          mikvah={mikvah}
          showActions={showActions}
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
