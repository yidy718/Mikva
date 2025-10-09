import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const supabase = createClient()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })

  const { data: userRole } = useQuery({
    queryKey: ['auth', 'role', user?.id],
    queryFn: async (): Promise<{ role: string } | null> => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return { role: 'user' } // Default to user role
      }

      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    user,
    userRole: userRole?.role || 'user',
    isAdmin: userRole?.role === 'admin',
    isLoading,
    error,
  }
}

export const useLogin = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Successfully logged in!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log in')
    },
  })
}

export const useRegister = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Registration successful! Please check your email to confirm your account.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register')
    },
  })
}

export const useLogout = () => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.clear() // Clear all cached data on logout
      toast.success('Successfully logged out')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log out')
    },
  })
}
