'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'

interface VerifyButtonProps {
  mikvahId: string
  verificationCount: number
  onVerified?: () => void
}

export function VerifyButton({ mikvahId, verificationCount, onVerified }: VerifyButtonProps) {
  const { t } = useTranslation()
  const [hasVerified, setHasVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localCount, setLocalCount] = useState(verificationCount)
  const supabase = createClient()

  useEffect(() => {
    checkVerificationStatus()
  }, [mikvahId])

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('mikvah_verifications')
      .select('id')
      .eq('mikvah_id', mikvahId)
      .eq('user_id', user.id)
      .single()

    setHasVerified(!!data)
  }

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login to verify')
        return
      }

      if (hasVerified) {
        // Remove verification
        const { error } = await supabase
          .from('mikvah_verifications')
          .delete()
          .eq('mikvah_id', mikvahId)
          .eq('user_id', user.id)

        if (error) throw error

        setHasVerified(false)
        setLocalCount(prev => Math.max(0, prev - 1))
        toast.success('Verification removed')
      } else {
        // Add verification
        const { error } = await supabase
          .from('mikvah_verifications')
          .insert({
            mikvah_id: mikvahId,
            user_id: user.id,
          })

        if (error) throw error

        setHasVerified(true)
        setLocalCount(prev => prev + 1)
        toast.success('Information verified!', {
          description: 'Thank you for helping keep our data accurate',
        })
      }

      if (onVerified) onVerified()
    } catch (error) {
      console.error('Error verifying:', error)
      toast.error('Failed to verify')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={hasVerified ? 'default' : 'outline'}
          size="sm"
          onClick={handleVerify}
          disabled={isLoading}
          className="gap-2"
        >
          {hasVerified ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          <span>
            {hasVerified ? 'Verified' : 'Verify Info'}
            {localCount > 0 && ` (${localCount})`}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {hasVerified
            ? 'You verified this information is accurate'
            : 'Confirm this information is accurate and up-to-date'}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
