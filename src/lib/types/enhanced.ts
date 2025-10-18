// Enhanced TypeScript types for better type safety and developer experience

// Base types
export type ID = string
export type Timestamp = string
export type URL = string
export type Email = string
export type Phone = string

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// API Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
  timestamp: Timestamp
}

// Form types
export interface FormField<T = any> {
  value: T
  error?: string
  touched: boolean
  required: boolean
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> }
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface FormComponentProps<T = any> extends BaseComponentProps {
  value: T
  onChange: (value: T) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  input: string
  ring: string
}

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'none'
export type AnimationDirection = 'up' | 'down' | 'left' | 'right'
export type AnimationDuration = 'fast' | 'normal' | 'slow'

export interface AnimationConfig {
  type: AnimationType
  direction?: AnimationDirection
  duration: AnimationDuration
  delay?: number
  easing?: string
}

// Accessibility types
export interface A11yProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  role?: string
  tabIndex?: number
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>
export type ChangeHandler<T = any> = (value: T) => void
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>

// Hook return types
export interface UseStateReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  reset: () => void
}

export interface UseAsyncReturn<T, E = Error> {
  data: T | null
  error: E | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  execute: () => Promise<T>
  reset: () => void
}

// Map and location types
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  bearing?: number
  pitch?: number
}

// User and authentication types
export interface User {
  id: ID
  email: Email
  name: string
  avatar?: URL
  role: UserRole
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type UserRole = 'user' | 'admin' | 'moderator'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Mikvah specific types (enhanced)
export interface Mikvah {
  id: ID
  name_en: string
  name_he?: string
  address: string
  latitude: number
  longitude: number
  phone?: Phone
  mikvah_type: MikvahType
  hours?: MikvahHours
  price?: string
  description_en?: string
  description_he?: string
  photos: URL[]
  amenities: MikvahAmenity[]
  accessibility: AccessibilityInfo
  status: MikvahStatus
  created_at: Timestamp
  updated_at: Timestamp
  created_by: ID
  verified: boolean
  rating?: number
  review_count?: number
}

export type MikvahType = 'separate_hours' | 'mixed_hours' | 'women_only' | 'men_only'

export interface MikvahHours {
  [key: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface MikvahAmenity {
  id: string
  name: string
  icon?: string
  available: boolean
}

export interface AccessibilityInfo {
  wheelchair_accessible: boolean
  elevator_available: boolean
  parking_available: boolean
  notes?: string
}

export type MikvahStatus = 'pending' | 'approved' | 'rejected' | 'archived'

// Review types
export interface Review {
  id: ID
  mikvah_id: ID
  user_id: ID
  rating: number
  comment?: string
  photos?: URL[]
  created_at: Timestamp
  updated_at: Timestamp
  helpful_count: number
  user_helpful?: boolean
}

// Filter and search types
export interface MikvahFilters {
  types: MikvahType[]
  amenities: string[]
  accessibility: boolean
  price_range?: [number, number]
  rating_min?: number
  distance_max?: number
  open_now?: boolean
}

export interface SearchOptions {
  query?: string
  location?: Coordinates
  radius?: number
  filters?: MikvahFilters
  sort_by?: 'distance' | 'rating' | 'newest' | 'name'
  limit?: number
  offset?: number
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  bundleSize: number
  loadTime: number
}

export interface PerformanceConfig {
  enableMonitoring: boolean
  sampleRate: number
  maxMetrics: number
}

// Error types
export interface AppError extends Error {
  code: string
  context?: string
  timestamp: Timestamp
  userId?: ID
  sessionId?: ID
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorReport {
  error: AppError
  severity: ErrorSeverity
  userAgent: string
  url: string
  stack?: string
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  map: {
    defaultCenter: Coordinates
    defaultZoom: number
    maxZoom: number
    minZoom: number
  }
  features: {
    darkMode: boolean
    offlineMode: boolean
    pushNotifications: boolean
    analytics: boolean
  }
  performance: PerformanceConfig
}

// Generic utility types
export type NonEmptyArray<T> = [T, ...T[]]
export type AtLeastOne<T> = [T, ...T[]]
export type Maybe<T> = T | null | undefined
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

// React specific types
export interface ComponentWithChildren {
  children: React.ReactNode
}

export interface ComponentWithClassName {
  className?: string
}

export interface ForwardRefComponent<T, P = {}> extends React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {}

// Hook types
export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
}

export interface UseMediaQueryReturn {
  matches: boolean
  media: string
}

export interface UseIntersectionObserverReturn {
  isIntersecting: boolean
  hasIntersected: boolean
  entry: IntersectionObserverEntry | null
}
