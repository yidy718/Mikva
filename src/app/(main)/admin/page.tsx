'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X, Edit, Trash2, UserCog, Users } from 'lucide-react'
import { LoadingScreen } from '@/components/ui/spinner'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']
type UserRole = Database['public']['Tables']['user_roles']['Row']

interface User {
  id: string
  email: string
  created_at: string
}

export default function AdminPage() {
  const { t } = useTranslation()
  const [pendingMikvahs, setPendingMikvahs] = useState<Mikvah[]>([])
  const [approvedMikvahs, setApprovedMikvahs] = useState<Mikvah[]>([])
  const [users, setUsers] = useState<(User & { role: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMikvah, setEditingMikvah] = useState<Mikvah | null>(null)
  const [editForm, setEditForm] = useState<Partial<Mikvah>>({})
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await Promise.all([loadPendingMikvahs(), loadApprovedMikvahs(), loadUsers()])
    setIsLoading(false)
  }

  const loadPendingMikvahs = async () => {
    const { data, error } = await supabase
      .from('mikvahs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error) setPendingMikvahs(data || [])
  }

  const loadApprovedMikvahs = async () => {
    const { data, error } = await supabase
      .from('mikvahs')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!error) setApprovedMikvahs(data || [])
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('mikvahs')
      .update({ status: 'approved' })
      .eq('id', id)

    if (!error) {
      setPendingMikvahs(pendingMikvahs.filter((m) => m.id !== id))
      await loadApprovedMikvahs()
      toast.success('Mikvah approved successfully')
    } else {
      toast.error('Failed to approve mikvah')
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('mikvahs')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (!error) {
      setPendingMikvahs(pendingMikvahs.filter((m) => m.id !== id))
      toast.success('Mikvah rejected')
    } else {
      toast.error('Failed to reject mikvah')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mikvah?')) return

    const { error } = await supabase
      .from('mikvahs')
      .delete()
      .eq('id', id)

    if (!error) {
      setApprovedMikvahs(approvedMikvahs.filter((m) => m.id !== id))
      toast.success('Mikvah deleted successfully')
    } else {
      toast.error('Failed to delete mikvah')
    }
  }

  const handleEdit = (mikvah: Mikvah) => {
    setEditingMikvah(mikvah)
    setEditForm(mikvah)
  }

  const handleSaveEdit = async () => {
    if (!editingMikvah) return

    const { error } = await supabase
      .from('mikvahs')
      .update(editForm)
      .eq('id', editingMikvah.id)

    if (!error) {
      setEditingMikvah(null)
      await loadApprovedMikvahs()
      toast.success('Mikvah updated successfully')
    } else {
      toast.error('Failed to update mikvah')
    }
  }

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId)

    if (!error) {
      await loadUsers()
      toast.success(`User role updated to ${newRole}`)
    } else {
      toast.error('Failed to update user role')
    }
  }

  const MikvahCard = ({ mikvah, showActions }: { mikvah: Mikvah; showActions: 'pending' | 'approved' }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{mikvah.name_en}</CardTitle>
            {mikvah.name_he && (
              <CardDescription className="text-base mt-1">{mikvah.name_he}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            {showActions === 'pending' && (
              <>
                <Button size="sm" variant="default" onClick={() => handleApprove(mikvah.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  {t('admin.approve')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(mikvah.id)}>
                  <X className="h-4 w-4 mr-1" />
                  {t('admin.reject')}
                </Button>
              </>
            )}
            {showActions === 'approved' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleEdit(mikvah)}>
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(mikvah.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('common.delete')}
                </Button>
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
            <p className="text-muted-foreground capitalize">{mikvah.mikvah_type.replace('_', ' ')}</p>
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
                <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-full h-20 object-cover rounded" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

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
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            {t('admin.manageUsers')} ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingMikvahs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {t('admin.noSubmissions')}
              </CardContent>
            </Card>
          ) : (
            pendingMikvahs.map((mikvah) => (
              <MikvahCard key={mikvah.id} mikvah={mikvah} showActions="pending" />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedMikvahs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No approved mikvahs yet
              </CardContent>
            </Card>
          ) : (
            approvedMikvahs.map((mikvah) => (
              <MikvahCard key={mikvah.id} mikvah={mikvah} showActions="approved" />
            ))
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.manageUsers')}</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {user.role}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserRole(user.id, user.role)}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        {user.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingMikvah} onOpenChange={() => setEditingMikvah(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mikvah</DialogTitle>
            <DialogDescription>Make changes to the mikvah information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (English)</Label>
                <Input
                  value={editForm.name_en || ''}
                  onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                />
              </div>
              <div>
                <Label>Name (Hebrew)</Label>
                <Input
                  value={editForm.name_he || ''}
                  onChange={(e) => setEditForm({ ...editForm, name_he: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={editForm.mikvah_type}
                  onValueChange={(value: any) => setEditForm({ ...editForm, mikvah_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men_only">Men Only</SelectItem>
                    <SelectItem value="separate_hours">Separate Hours</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Price Info</Label>
              <Input
                value={editForm.price_info || ''}
                onChange={(e) => setEditForm({ ...editForm, price_info: e.target.value })}
              />
            </div>
            <div>
              <Label>Directions & Parking</Label>
              <Textarea
                value={editForm.directions_parking || ''}
                onChange={(e) => setEditForm({ ...editForm, directions_parking: e.target.value })}
              />
            </div>
            <div>
              <Label>Accessibility Info</Label>
              <Textarea
                value={editForm.accessibility_info || ''}
                onChange={(e) => setEditForm({ ...editForm, accessibility_info: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMikvah(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
