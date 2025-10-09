import { Card, CardContent } from '@/components/ui/card'
import { AdminMikvahCard } from './AdminMikvahCard'
import { useTranslation } from 'react-i18next'
import type { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

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
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
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
