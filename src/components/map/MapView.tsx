'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import Supercluster from 'supercluster'
import { MapPin } from 'lucide-react'
import { Database } from '@/lib/supabase/database.types'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

interface MapViewProps {
  mikvahs: Mikvah[]
  onMikvahClick?: (mikvah: Mikvah) => void
  onMapClick?: (lng: number, lat: number) => void
  selectedLocation?: { lng: number; lat: number }
}

export function MapView({
  mikvahs,
  onMikvahClick,
  onMapClick,
  selectedLocation,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    longitude: 34.7818, // Israel center
    latitude: 32.0853,
    zoom: 8,
  })
  const [selectedMikvah, setSelectedMikvah] = useState<Mikvah | null>(null)
  const [clusters, setClusters] = useState<any[]>([])

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

  return (
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
  )
}
