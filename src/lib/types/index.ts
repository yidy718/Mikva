import { Database } from '@/lib/supabase/database.types'

// Database table types
export type Mikvah = Database['public']['Tables']['mikvahs']['Row']
export type MikvahInsert = Database['public']['Tables']['mikvahs']['Insert']
export type MikvahUpdate = Database['public']['Tables']['mikvahs']['Update']

export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
export type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert']

export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update']

// Status types
export type MikvahStatus = 'pending' | 'approved' | 'rejected'
export type MikvahType = 'men_only' | 'separate_hours' | 'family'
export type AdminAction = 'pending' | 'approved'
