'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Users } from 'lucide-react'
import { LoadingScreen } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { AdminMikvahList } from '@/components/admin/AdminMikvahList'
import { AdminReviewList } from '@/components/admin/AdminReviewList'
import { AdminUserManagement } from '@/components/admin/AdminUserManagement'
import { AdminEditDialog } from '@/components/admin/AdminEditDialog'
import { useAdminMikvahs, useAdminUsers, useApproveMikvah, useRejectMikvah, useDeleteMikvah, useUpdateUserRole } from '@/lib/hooks/useAdmin'
import { useAdminReviews, useApproveReview, useDeleteReview } from '@/lib/hooks/useAdmin'
import type { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

export default function AdminPage() {
  const { t } = useTranslation()
  const [editingMikvah, setEditingMikvah] = useState<Mikvah | null>(null)
  const supabase = createClient()

  // React Query hooks for data fetching
  const { data: mikvahs = [], isLoading: mikvahsLoading } = useAdminMikvahs()
  const { data: users = [], isLoading: usersLoading } = useAdminUsers()
  const { data: reviews = [], isLoading: reviewsLoading } = useAdminReviews()

  // Mutation hooks for actions
  const approveMikvah = useApproveMikvah()
  const rejectMikvah = useRejectMikvah()
  const deleteMikvah = useDeleteMikvah()
  const updateUserRole = useUpdateUserRole()
  const approveReview = useApproveReview()
  const deleteReview = useDeleteReview()

  // Separate pending and approved mikvahs
  const pendingMikvahs = mikvahs.filter(m => m.status === 'pending')
  const approvedMikvahs = mikvahs.filter(m => m.status === 'approved')

  const handleEditMikvah = (mikvah: Mikvah) => {
    setEditingMikvah(mikvah)
  }

  const handleSaveEdit = async (mikvahId: string, updates: Partial<Mikvah>) => {
    // Update the mikvah in the database
    const { error } = await supabase
      .from('mikvahs')
      .update(updates)
      .eq('id', mikvahId)

    if (!error) {
      setEditingMikvah(null)
      // Refetch data will happen automatically via React Query
      toast.success('Mikvah updated successfully')
    } else {
      toast.error('Failed to update mikvah')
    }
  }

  const isLoading = mikvahsLoading || usersLoading || reviewsLoading

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />
  }

  return (
    <div className="container max-w-7xl py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            {t('admin.pending')} ({pendingMikvahs.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t('admin.approved')} ({approvedMikvahs.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {t('admin.manageUsers')} ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <AdminMikvahList
            mikvahs={pendingMikvahs}
            showActions="pending"
            emptyMessage={t('admin.noSubmissions')}
            onApprove={(id) => approveMikvah.mutate(id)}
            onReject={(id) => rejectMikvah.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="approved">
          <AdminMikvahList
            mikvahs={approvedMikvahs}
            showActions="approved"
            emptyMessage="No approved mikvahs yet"
            onEdit={handleEditMikvah}
            onDelete={(id) => deleteMikvah.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <AdminReviewList
            reviews={reviews}
            onApprove={(id) => approveReview.mutate(id)}
            onDelete={(id) => deleteReview.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement
            users={users}
            onToggleRole={(userId, currentRole) =>
              updateUserRole.mutate({ userId, role: currentRole === 'admin' ? 'user' : 'admin' })
            }
          />
        </TabsContent>
      </Tabs>

      <AdminEditDialog
        mikvah={editingMikvah}
        open={!!editingMikvah}
        onOpenChange={(open) => !open && setEditingMikvah(null)}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
