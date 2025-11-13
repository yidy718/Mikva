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
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 animate-slide-down">
        <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-1">
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange('map')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center group ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                      : 'hover:bg-primary/10 hover:text-primary'
                  }`}
                  aria-label="Map View"
                >
                  <MapIcon className={`h-4 w-4 transition-transform duration-300 ${viewMode === 'map' ? 'scale-110' : 'group-hover:scale-110'}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="animate-scale-in">
                <p>Map View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center group ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]'
                      : 'hover:bg-primary/10 hover:text-primary'
                  }`}
                  aria-label="List View"
                >
                  <List className={`h-4 w-4 transition-transform duration-300 ${viewMode === 'list' ? 'scale-110' : 'group-hover:scale-110'}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="animate-scale-in">
                <p>List View</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-[68px] left-3 right-16 sm:top-4 sm:left-28 sm:right-auto sm:max-w-md z-10 animate-slide-down">
          <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 px-2 py-1.5 sm:px-2.5 sm:py-2">
            <AddressInput
              value={searchQuery}
              onChange={(value) => {
                onSearchChange(value)
                if (value.trim()) {
                  handleSearch(value)
                }
              }}
              onLocationSelect={onLocationSelect}
              placeholder="Search worldwide..."
              proximity={proximity}
              searchTypes={['place', 'locality', 'region', 'country']}
            />
          </div>
        </div>
      )}
    </>
  )
}