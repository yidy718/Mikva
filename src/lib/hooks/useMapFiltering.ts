'use client'

import { useMemo } from 'react'
import type { Mikvah } from '@/lib/types'

export interface FilterOptions {
  types: string[]
  searchQuery: string
  sortBy: 'nearest' | 'name' | 'newest'
}

interface UseMapFilteringProps {
  mikvahs: Mikvah[]
  filters: FilterOptions
}

export function useMapFiltering({ mikvahs, filters }: UseMapFilteringProps) {
  const filteredMikvahs = useMemo(() => {
    let result = [...mikvahs]

    // Filter by type
    if (filters.types.length > 0) {
      result = result.filter(m => filters.types.includes(m.mikvah_type))
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(m =>
        m.name_en?.toLowerCase().includes(query) ||
        m.name_he?.toLowerCase().includes(query) ||
        m.address?.toLowerCase().includes(query)
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || ''))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        break
      case 'nearest':
      default:
        // Would need user's location for this - for now just use as-is
        break
    }

    return result
  }, [mikvahs, filters])

  return {
    filteredMikvahs,
  }
}
