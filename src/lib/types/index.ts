import { Database } from '@/lib/supabase/database.types'

// Database table types
export type Mikvah = Database['public']['Tables']['mikvahs']['Row']
export type MikvahInsert = Database['public']['Tables']['mikvahs']['Insert']
export type MikvahUpdate = Database['public']['Tables']['mikvahs']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

export type Favorite = Database['public']['Tables']['favorites']['Row']
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']

export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update']

// Common UI types
export interface MikvahWithReviews extends Mikvah {
  reviews?: Review[]
  averageRating?: number
  reviewCount?: number
}

// Status types
export type MikvahStatus = 'pending' | 'approved' | 'rejected'
export type MikvahType = 'men_only' | 'separate_hours' | 'family'
export type AdminAction = 'pending' | 'approved'
