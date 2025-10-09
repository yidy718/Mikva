'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import Supercluster from 'supercluster'
import { MapPin, Search, X } from 'lucide-react'
import { Database } from '@/lib/supabase/database.types'
import { geocodingService, type GeocodingResult } from '@/lib/geocoding'
import { AddressInput } from '@/components/ui/address-input'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

interface MapViewProps {
  mikvahs: Mikvah[]
  onMikvahClick?: (mikvah: Mikvah) => void
  onMapClick?: (lng: number, lat: number) => void
  selectedLocation?: { lng: number; lat: number }
  showSearch?: boolean
  onLocationSelect?: (result: GeocodingResult) => void
}

export function MapView({
  mikvahs,
  onMikvahClick,
  onMapClick,
  selectedLocation,
  showSearch = false,
  onLocationSelect,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    longitude: 0, // World center
    latitude: 20,
    zoom: 2,
  })
  const [selectedMikvah, setSelectedMikvah] = useState<Mikvah | null>(null)
  const [clusters, setClusters] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  // Create supercluster index
  const supercluster = useRef(
    new Supercluster({
      radius: 75,
      maxZoom: 16,
    })
  )

  useEffect(() => {
    // Convert mikvahs to GeoJSON points
    const points = mikvahs.map((mikvah) => ({
      type: 'Feature' as const,
      properties: { cluster: false, mikvah },
      geometry: {
        type: 'Point' as const,
        coordinates: [mikvah.longitude, mikvah.latitude],
      },
    }))

    supercluster.current.load(points)
  }, [mikvahs])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateClusters()
    }, 100)
    return () => clearTimeout(timer)
  }, [viewState.longitude, viewState.latitude, viewState.zoom])

  const updateClusters = () => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    const bounds = map.getBounds()
    if (!bounds) return

    const zoom = Math.floor(viewState.zoom)

    const clusters = supercluster.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    )

    setClusters(clusters)
  }

  const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = Math.min(
      supercluster.current.getClusterExpansionZoom(clusterId),
      20
    )

    setViewState({
      ...viewState,
      longitude,
      latitude,
      zoom: expansionZoom,
    })
  }

  const handleMarkerClick = (mikvah: Mikvah) => {
    setSelectedMikvah(mikvah)
    if (onMikvahClick) {
      onMikvahClick(mikvah)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const results = await geocodingService.searchAddress(query, {
        proximity: [viewState.longitude, viewState.latitude],
        types: ['address', 'poi'],
        limit: 1,
      })

      if (results.length > 0) {
        const result = results[0]
        const [lng, lat] = result.center
        
        setViewState({
          longitude: lng,
          latitude: lat,
          zoom: 15,
        })

        if (onLocationSelect) {
          onLocationSelect(result)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLocationSelect = (result: GeocodingResult) => {
    const [lng, lat] = result.center
    
    setViewState({
      longitude: lng,
      latitude: lat,
      zoom: 15,
    })

    if (onLocationSelect) {
      onLocationSelect(result)
    }
  }

  return (
    <div className="relative w-full h-full">
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4">
            <AddressInput
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value)
                if (value.trim()) {
                  handleSearch(value)
                }
              }}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location worldwide..."
              proximity={[viewState.longitude, viewState.latitude]}
            />
          </div>
        </div>
      )}

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

      {/* Render clusters and individual markers */}
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count: pointCount } = cluster.properties

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                handleClusterClick(cluster.id, longitude, latitude)
              }}
            >
              <div className="relative cursor-pointer">
                <div
                  className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                  style={{
                    width: `${30 + (pointCount / mikvahs.length) * 20}px`,
                    height: `${30 + (pointCount / mikvahs.length) * 20}px`,
                  }}
                >
                  {pointCount}
                </div>
              </div>
            </Marker>
          )
        }

        const mikvah = cluster.properties.mikvah

        return (
          <Marker
            key={`mikvah-${mikvah.id}`}
            longitude={longitude}
            latitude={latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              handleMarkerClick(mikvah)
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <MapPin className="h-8 w-8 text-primary fill-primary/20" />
            </div>
          </Marker>
        )
      })}

      {/* Selected location marker (for submission form) */}
      {selectedLocation && (
        <Marker
          longitude={selectedLocation.lng}
          latitude={selectedLocation.lat}
        >
          <div className="animate-bounce">
            <MapPin className="h-10 w-10 text-destructive fill-destructive/20" />
          </div>
        </Marker>
      )}

      {/* Popup for selected mikvah */}
      {selectedMikvah && (
        <Popup
          longitude={selectedMikvah.longitude}
          latitude={selectedMikvah.latitude}
          onClose={() => setSelectedMikvah(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-2">
            <h3 className="font-semibold">{selectedMikvah.name_en}</h3>
            {selectedMikvah.name_he && (
              <p className="text-sm text-muted-foreground">{selectedMikvah.name_he}</p>
            )}
            <p className="text-sm mt-2">{selectedMikvah.address}</p>
            {selectedMikvah.phone && (
              <p className="text-sm">{selectedMikvah.phone}</p>
            )}
          </div>
        </Popup>
      )}
      </Map>
    </div>
  )
}
