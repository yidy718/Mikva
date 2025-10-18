import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Mikvah, UserRole } from '@/lib/types'

export const useAdminMikvahs = () => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['admin', 'mikvahs'],
    queryFn: async (): Promise<Mikvah[]> => {
      const { data, error } = await supabase
        .from('mikvahs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch mikvahs: ${error.message}`)
      }

      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds - admin data should be fresh
    gcTime: 5 * 60 * 1000,
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<any[]> => {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  })
}

export const useAdminReviews = () => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, mikvahs(name_en, name_he)')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch reviews: ${error.message}`)
      }

      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  })
}

export const useApproveMikvah = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mikvahId: string) => {
      const { error } = await supabase
        .from('mikvahs')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', mikvahId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mikvahs'] })
      queryClient.invalidateQueries({ queryKey: ['mikvahs'] })
      toast.success('Mikvah approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve mikvah')
    },
  })
}

export const useRejectMikvah = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mikvahId: string) => {
      const { error } = await supabase
        .from('mikvahs')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', mikvahId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mikvahs'] })
      queryClient.invalidateQueries({ queryKey: ['mikvahs'] })
      toast.success('Mikvah rejected')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject mikvah')
    },
  })
}

export const useDeleteMikvah = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mikvahId: string) => {
      const { error } = await supabase
        .from('mikvahs')
        .delete()
        .eq('id', mikvahId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mikvahs'] })
      queryClient.invalidateQueries({ queryKey: ['mikvahs'] })
      toast.success('Mikvah deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete mikvah')
    },
  })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      return response.json()
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(`User role updated to ${role}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role')
    },
  })
}

export const useApproveReview = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Review approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve review')
    },
  })
}

export const useDeleteReview = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('Review deleted successfully')
    },
    onError: (error: any) => {
      if (error.message !== 'User cancelled') {
        toast.error(error.message || 'Failed to delete review')
      }
    },
  })
}
