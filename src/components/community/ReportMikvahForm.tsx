'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Mikvah } from '@/lib/supabase/database.types'

const reportSchema = z.object({
  report_type: z.enum(['closed_permanently', 'closed_temporarily', 'incorrect_hours', 'incorrect_location', 'other']),
  description: z.string().min(10, 'Please provide at least 10 characters'),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportMikvahFormProps {
  mikvah: Mikvah
  isOpen: boolean
  onClose: () => void
}

export function ReportMikvahForm({ mikvah, isOpen, onClose }: ReportMikvahFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      report_type: 'other',
      description: '',
    },
  })

  const reportType = watch('report_type')

  const reportTypes = [
    { value: 'closed_permanently', label: 'Closed Permanently' },
    { value: 'closed_temporarily', label: 'Temporarily Closed' },
    { value: 'incorrect_hours', label: 'Incorrect Hours' },
    { value: 'incorrect_location', label: 'Incorrect Location' },
    { value: 'other', label: 'Other Issue' },
  ]

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login to report issues')
        return
      }

      const { error } = await supabase.from('mikvah_reports').insert({
        mikvah_id: mikvah.id,
        user_id: user.id,
        report_type: data.report_type,
        description: data.description,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Report submitted successfully', {
        description: 'Thank you for helping us keep information accurate!',
      })
      reset()
      onClose()
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Issue
          </DialogTitle>
          <DialogDescription>
            Report problems with this mikvah listing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mikvah Info */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium">{mikvah.name_en || mikvah.name_he}</p>
            <p className="text-sm text-muted-foreground">{mikvah.address}</p>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report_type">Issue Type *</Label>
            <Select
              value={reportType}
              onValueChange={(value) => setValue('report_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              rows={5}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
