import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

interface AdminEditDialogProps {
  mikvah: Mikvah | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (mikvahId: string, updates: Partial<Mikvah>) => Promise<void>
}

export function AdminEditDialog({ mikvah, open, onOpenChange, onSave }: AdminEditDialogProps) {
  const [editForm, setEditForm] = useState<Partial<Mikvah>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mikvah) {
      setEditForm(mikvah)
    }
  }, [mikvah])

  const handleSave = async () => {
    if (!mikvah) return

    setIsLoading(true)
    try {
      await onSave(mikvah.id, editForm)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEditForm({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mikvah</DialogTitle>
          <DialogDescription>
            Make changes to the mikvah information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_en">Name (English) *</Label>
              <Input
                id="name_en"
                value={editForm.name_en || ''}
                onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name_he">Name (Hebrew)</Label>
              <Input
                id="name_he"
                value={editForm.name_he || ''}
                onChange={(e) => setEditForm({ ...editForm, name_he: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={editForm.address || ''}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={editForm.latitude || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={editForm.longitude || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={editForm.mikvah_type}
                onValueChange={(value: any) => setEditForm({ ...editForm, mikvah_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
            <Label htmlFor="hours">Hours of Operation</Label>
            <Textarea
              id="hours"
              placeholder="e.g., Mon-Fri: 9am-9pm, Sat: Closed"
              value={
                typeof editForm.hours_of_operation === 'string'
                  ? editForm.hours_of_operation
                  : editForm.hours_of_operation
                  ? JSON.stringify(editForm.hours_of_operation)
                  : ''
              }
              onChange={(e) => setEditForm({ ...editForm, hours_of_operation: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">Price Info</Label>
            <Input
              id="price"
              value={editForm.price_info || ''}
              onChange={(e) => setEditForm({ ...editForm, price_info: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="directions">Directions & Parking</Label>
            <Textarea
              id="directions"
              value={editForm.directions_parking || ''}
              onChange={(e) => setEditForm({ ...editForm, directions_parking: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="accessibility">Accessibility Info</Label>
            <Textarea
              id="accessibility"
              value={editForm.accessibility_info || ''}
              onChange={(e) => setEditForm({ ...editForm, accessibility_info: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={editForm.status}
              onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
