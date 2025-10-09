import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, X, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

interface AdminMikvahCardProps {
  mikvah: Mikvah
  showActions: 'pending' | 'approved'
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onEdit?: (mikvah: Mikvah) => void
  onDelete?: (id: string) => void
}

export function AdminMikvahCard({
  mikvah,
  showActions,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: AdminMikvahCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{mikvah.name_en}</h3>
            {mikvah.name_he && (
              <p className="text-muted-foreground mt-1">{mikvah.name_he}</p>
            )}
          </div>
          <div className="flex gap-2">
            {showActions === 'pending' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onApprove?.(mikvah.id)}
                      aria-label={`Approve ${mikvah.name_en}`}
                    >
                      <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                      {t('admin.approve')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Approve this mikvah submission</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(mikvah.id)}
                      aria-label={`Reject ${mikvah.name_en}`}
                    >
                      <X className="h-4 w-4 mr-1" aria-hidden="true" />
                      {t('admin.reject')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reject this submission</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {showActions === 'approved' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(mikvah)}
                      aria-label={`Edit ${mikvah.name_en}`}
                    >
                      <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                      {t('common.edit')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit mikvah information</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete?.(mikvah.id)}
                      aria-label={`Delete ${mikvah.name_en}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                      {t('common.delete')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Permanently delete this mikvah</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">{t('mikvah.address')}</p>
            <p className="text-muted-foreground">{mikvah.address}</p>
          </div>
          {mikvah.phone && (
            <div>
              <p className="font-medium">{t('mikvah.phone')}</p>
              <p className="text-muted-foreground">{mikvah.phone}</p>
            </div>
          )}
          <div>
            <p className="font-medium">{t('mikvah.type')}</p>
            <p className="text-muted-foreground capitalize">
              {mikvah.mikvah_type.replace('_', ' ')}
            </p>
          </div>
          {mikvah.price_info && (
            <div>
              <p className="font-medium">{t('mikvah.price')}</p>
              <p className="text-muted-foreground">{mikvah.price_info}</p>
            </div>
          )}
        </div>
        {mikvah.photos && mikvah.photos.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">{t('mikvah.photos')}</p>
            <div className="grid grid-cols-4 gap-2">
              {mikvah.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Photo ${idx + 1} of ${mikvah.name_en}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
