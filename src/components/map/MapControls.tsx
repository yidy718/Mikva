'use client'

import { Search, X, List, Map as MapIcon } from 'lucide-react'
import { AddressInput } from '@/components/ui/address-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { GeocodingResult } from '@/lib/geocoding'

interface MapControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onLocationSelect: (result: GeocodingResult) => void
  viewMode: 'map' | 'list'
  onViewModeChange: (mode: 'map' | 'list') => void
  showSearch?: boolean
  proximity?: [number, number]
}

export function MapControls({
  searchQuery,
  onSearchChange,
  onLocationSelect,
  viewMode,
  onViewModeChange,
  showSearch = false,
  proximity,
}: MapControlsProps) {
  return (
    <>
      {showSearch && (
        <div className="absolute top-4 left-4 right-20 sm:right-4 sm:max-w-md z-10">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
            <AddressInput
              value={searchQuery}
              onChange={(value) => {
                onSearchChange(value)
                if (value.trim()) {
                  // Handle search if needed
                }
              }}
              onLocationSelect={onLocationSelect}
              placeholder="Search for a location worldwide..."
              proximity={proximity}
            />
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewModeChange('map')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    viewMode === 'map'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
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
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
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
    </>
  )
}
