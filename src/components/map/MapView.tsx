'use client'

import { useRef, useState } from 'react'
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import { geocodingService, type GeocodingResult } from '@/lib/geocoding'
import { MikvahListView } from './MikvahListView'
import { MikvahDetailsModal } from './MikvahDetailsModal'
import { MapControls } from './MapControls'
import { MapMarkers } from './MapMarkers'
import { FilterPanel, type FilterOptions } from './FilterPanel'
import { useMapClustering } from '@/lib/hooks/useMapClustering'
import { useMapFiltering } from '@/lib/hooks/useMapFiltering'
import type { Mikvah } from '@/lib/types'

interface MapViewProps {
  mikvahs: Mikvah[]
  onMikvahClick?: (mikvah: Mikvah) => void
  onMapClick?: (lng: number, lat: number) => void
  selectedLocation?: { lng: number; lat: number }
  showSearch?: boolean
  onLocationSelect?: (result: GeocodingResult) => void
  isLoading?: boolean
}

export function MapView({
  mikvahs,
  onMikvahClick,
  onMapClick,
  selectedLocation,
  showSearch = false,
  onLocationSelect,
  isLoading = false,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    longitude: 0, // World center
    latitude: 20,
    zoom: 2,
  })
  const [selectedMikvah, setSelectedMikvah] = useState<Mikvah | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    searchQuery: '',
    sortBy: 'nearest',
  })

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  // Use custom hooks for filtering and clustering
  const { filteredMikvahs } = useMapFiltering({ mikvahs, filters })
  const { clusters, handleClusterClick } = useMapClustering({ 
    mikvahs: filteredMikvahs, 
    viewState, 
    mapRef 
  })

  const handleLocationSelect = (result: GeocodingResult) => {
    const [lng, lat] = result.center

    // Determine appropriate zoom level based on location type
    let zoomLevel = 15 // Default zoom for specific locations

    // If it's a city/place/regional location, zoom out more to show broader area
    const placeTypes = result.properties?.category?.split(',') || []
    const contextTypes = result.context?.map(ctx => ctx.id) || []

    // Check if this is a city, region, or country level search
    const isCityOrRegion = contextTypes.some(type =>
      type.includes('place') ||
      type.includes('region') ||
      type.includes('country')
    ) || placeTypes.some(type =>
      type.includes('place') ||
      type.includes('locality') ||
      type.includes('region')
    )

    if (isCityOrRegion) {
      zoomLevel = 11 // Zoom out more for cities/regions to show broader area
    } else if (result.place_name.includes(',') && result.place_name.split(',').length > 2) {
      // Likely a specific address with multiple parts
      zoomLevel = 16 // Zoom in for specific addresses
    }

    setViewState({
      longitude: lng,
      latitude: lat,
      zoom: zoomLevel,
    })

    if (onLocationSelect) {
      onLocationSelect(result)
    }
  }

  const handleMikvahClick = (mikvah: Mikvah) => {
    setSelectedMikvah(mikvah)
    setShowDetailsModal(true)
    if (onMikvahClick) {
      onMikvahClick(mikvah)
    }
  }

  const handleMikvahSelect = (mikvah: Mikvah) => {
    setSelectedMikvah(mikvah)
    setViewState({
      longitude: mikvah.longitude,
      latitude: mikvah.latitude,
      zoom: 15,
    })
    setViewMode('map')
  }

  const handleNavigate = (mikvah: Mikvah) => {
    // This would typically open a navigation app or provide directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mikvah.latitude},${mikvah.longitude}`
    window.open(url, '_blank')
  }

  const handleClusterClickWithViewState = (clusterId: number, longitude: number, latitude: number) => {
    const newViewState = handleClusterClick(clusterId, longitude, latitude)
    setViewState(prev => ({ ...prev, ...newViewState }))
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <MapControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLocationSelect={handleLocationSelect}
        showSearch={showSearch}
        proximity={[viewState.longitude, viewState.latitude]}
        isSearching={isSearching}
      />

      {/* List View */}
      {viewMode === 'list' && (
        <div className="absolute top-16 left-2 right-2 bottom-2 sm:left-4 sm:right-4 sm:bottom-4 bg-background rounded-lg shadow-lg border z-20 md:right-auto md:w-96 animate-slide-up">
          <div className="h-full flex flex-col">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">Mikvahs ({filteredMikvahs.length})</h2>
            </div>
            <div className="p-3 sm:p-4 border-b">
              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="flex-1 overflow-hidden px-3 sm:px-4">
              <MikvahListView
                mikvahs={filteredMikvahs}
                onMikvahSelect={handleMikvahSelect}
                selectedMikvahId={selectedMikvah?.id}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="relative w-full h-full">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            onClick={(e) => {
              if (onMapClick) {
                onMapClick(e.lngLat.lng, e.lngLat.lat)
              }
            }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />
            <GeolocateControl position="top-right" />

            <MapMarkers
              clusters={clusters}
              filteredMikvahs={filteredMikvahs}
              selectedMikvah={selectedMikvah}
              hoveredMarkerId={hoveredMarkerId}
              selectedLocation={selectedLocation}
              onClusterClick={handleClusterClickWithViewState}
              onMarkerClick={handleMikvahClick}
              onMarkerHover={setHoveredMarkerId}
              onPopupClose={() => setSelectedMikvah(null)}
            />
          </Map>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center animate-fade-in">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <MikvahDetailsModal
        mikvah={selectedMikvah}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedMikvah(null)
        }}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
