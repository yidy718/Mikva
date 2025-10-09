export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MikvahType = 'men_only' | 'separate_hours' | 'family'
export type MikvahStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'user' | 'admin'

export interface Database {
  public: {
    Tables: {
      mikvahs: {
        Row: {
          id: string
          name_en: string
          name_he: string | null
          address: string
          latitude: number
          longitude: number
          phone: string | null
          hours_of_operation: Json
          price_info: string | null
          mikvah_type: MikvahType
          photos: string[]
          directions_parking: string | null
          accessibility_info: string | null
          status: MikvahStatus
          submitted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_he?: string | null
          address: string
          latitude: number
          longitude: number
          phone?: string | null
          hours_of_operation?: Json
          price_info?: string | null
          mikvah_type: MikvahType
          photos?: string[]
          directions_parking?: string | null
          accessibility_info?: string | null
          status?: MikvahStatus
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_he?: string | null
          address?: string
          latitude?: number
          longitude?: number
          phone?: string | null
          hours_of_operation?: Json
          price_info?: string | null
          mikvah_type?: MikvahType
          photos?: string[]
          directions_parking?: string | null
          accessibility_info?: string | null
          status?: MikvahStatus
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      search_mikvahs_nearby: {
        Args: {
          user_lat: number
          user_lng: number
          radius_meters?: number
        }
        Returns: {
          id: string
          name_en: string
          name_he: string | null
          address: string
          latitude: number
          longitude: number
          phone: string | null
          hours_of_operation: Json
          price_info: string | null
          mikvah_type: MikvahType
          photos: string[]
          directions_parking: string | null
          accessibility_info: string | null
          distance_meters: number
        }[]
      }
    }
  }
}
