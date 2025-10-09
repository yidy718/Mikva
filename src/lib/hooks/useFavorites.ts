import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/database.types'

type Favorite = Database['public']['Tables']['user_favorites']['Row']

export const useFavorites = () => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<Favorite[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch favorites: ${error.message}`)
      }

      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds - favorites change frequently
    gcTime: 5 * 60 * 1000,
  })
}

export const useIsFavorite = (mikvahId: string) => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites', 'check', mikvahId],
    queryFn: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('mikvah_id', mikvahId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to check favorite status: ${error.message}`)
      }

      return !!data
    },
    enabled: !!mikvahId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useAddFavorite = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mikvahId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          mikvah_id: mikvahId,
        })

      if (error) throw error
    },
    onSuccess: (_, mikvahId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', mikvahId] })
      toast.success('Added to favorites!')
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        // Unique constraint violation - already favorited
        toast.error('Already in favorites')
      } else {
        toast.error(error.message || 'Failed to add to favorites')
      }
    },
  })
}

export const useRemoveFavorite = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mikvahId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('mikvah_id', mikvahId)

      if (error) throw error
    },
    onSuccess: (_, mikvahId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', mikvahId] })
      toast.success('Removed from favorites')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove from favorites')
    },
  })
}

export const useToggleFavorite = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ mikvahId, isFavorite }: { mikvahId: string; isFavorite: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('mikvah_id', mikvahId)

        if (error) throw error
        return { action: 'removed', mikvahId }
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            mikvah_id: mikvahId,
          })

        if (error) throw error
        return { action: 'added', mikvahId }
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['favorites', 'check', result.mikvahId] })

      if (result.action === 'added') {
        toast.success('Added to favorites!')
      } else {
        toast.success('Removed from favorites')
      }
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        // Unique constraint violation - already favorited
        toast.error('Already in favorites')
      } else {
        toast.error(error.message || 'Failed to update favorites')
      }
    },
  })
}
