'use client'

import { Marker, Popup } from 'react-map-gl'
import { MikvahMarker, ClusterMarker } from './MikvahMarker'
import type { Mikvah } from '@/lib/types'

interface MapMarkersProps {
  clusters: any[]
  filteredMikvahs: Mikvah[]
  selectedMikvah: Mikvah | null
  hoveredMarkerId: string | null
  selectedLocation?: { lng: number; lat: number }
  onClusterClick: (clusterId: number, longitude: number, latitude: number) => void
  onMarkerClick: (mikvah: Mikvah) => void
  onMarkerHover: (mikvahId: string | null) => void
  onPopupClose: () => void
}

export function MapMarkers({
  clusters,
  filteredMikvahs,
  selectedMikvah,
  hoveredMarkerId,
  selectedLocation,
  onClusterClick,
  onMarkerClick,
  onMarkerHover,
  onPopupClose,
}: MapMarkersProps) {
  return (
    <>
      {/* Render clusters and individual markers */}
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count: pointCount } = cluster.properties

        if (isCluster) {
          const size = 30 + Math.min((pointCount / filteredMikvahs.length) * 30, 40)

          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                onClusterClick(cluster.id, longitude, latitude)
              }}
            >
              <ClusterMarker count={pointCount} size={size} />
            </Marker>
          )
        }

        const mikvah = cluster.properties.mikvah
        const isSelected = selectedMikvah?.id === mikvah.id
        const isHovered = hoveredMarkerId === mikvah.id

        return (
          <Marker
            key={`mikvah-${mikvah.id}`}
            longitude={longitude}
            latitude={latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              onMarkerClick(mikvah)
            }}
          >
            <div
              className="cursor-pointer transition-all duration-200 hover:scale-125 hover:-translate-y-1"
              onMouseEnter={() => onMarkerHover(mikvah.id)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              <MikvahMarker
                type={mikvah.mikvah_type}
                isSelected={isSelected}
                isHovered={isHovered}
              />
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
          <div className="animate-bounce-gentle">
            <MikvahMarker type="separate_hours" isSelected={true} />
          </div>
        </Marker>
      )}

      {/* Popup for selected mikvah */}
      {selectedMikvah && (
        <Popup
          longitude={selectedMikvah.longitude}
          latitude={selectedMikvah.latitude}
          onClose={onPopupClose}
          closeButton={true}
          closeOnClick={false}
          className="animate-scale-in"
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
    </>
  )
}
