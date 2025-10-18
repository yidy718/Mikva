'use client'

import { MapIcon, List } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AddressInput } from '@/components/ui/address-input'
import { geocodingService, type GeocodingResult } from '@/lib/geocoding'

interface MapControlsProps {
  viewMode: 'map' | 'list'
  onViewModeChange: (mode: 'map' | 'list') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onLocationSelect: (result: GeocodingResult) => void
  showSearch?: boolean
  proximity?: [number, number]
  isSearching?: boolean
}

export function MapControls({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onLocationSelect,
  showSearch = false,
  proximity,
  isSearching = false,
}: MapControlsProps) {
  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      const results = await geocodingService.searchAddress(query, {
        proximity,
        types: ['address', 'poi'],
        limit: 1,
      })

      if (results.length > 0) {
        onLocationSelect(results[0])
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  return (
    <>
      {/* View Mode Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange('map')}
                  className={`px-3 py-2 text-sm rounded-md transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewMode === 'map'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted'
                  }`}
                  aria-label="Map View"
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Map View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`px-3 py-2 text-sm rounded-md transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted'
                  }`}
                  aria-label="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>List View</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 sm:left-28 sm:max-w-md z-10 mt-16 sm:mt-0">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
            <AddressInput
              value={searchQuery}
              onChange={(value) => {
                onSearchChange(value)
                if (value.trim()) {
                  handleSearch(value)
                }
              }}
              onLocationSelect={onLocationSelect}
              placeholder="Search for cities and places worldwide..."
              proximity={proximity}
              searchTypes={['place', 'locality', 'region', 'country']}
            />
          </div>
        </div>
      )}
    </>
  )
}