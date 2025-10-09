import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

export const useMikvahs = () => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['mikvahs'],
    queryFn: async (): Promise<Mikvah[]> => {
      const { data, error } = await supabase
        .from('mikvahs')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch mikvahs: ${error.message}`)
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - mikvahs don't change often
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useMikvah = (id: string) => {
  const supabase = createClient()

  return useQuery({
    queryKey: ['mikvah', id],
    queryFn: async (): Promise<Mikvah | null> => {
      const { data, error } = await supabase
        .from('mikvahs')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw new Error(`Failed to fetch mikvah: ${error.message}`)
      }

      return data
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  })
}
