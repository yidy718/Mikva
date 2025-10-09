'use client'

import { Marker } from 'react-map-gl'
import { Database } from '@/lib/supabase/database.types'
import { MikvahMarker, ClusterMarker } from './MikvahMarker'

type Mikvah = Database['public']['Tables']['mikvahs']['Row']

interface MapClustersProps {
  clusters: any[]
  onClusterClick: (clusterId: number, longitude: number, latitude: number) => void
  onMarkerClick: (mikvah: Mikvah) => void
  hoveredMarkerId: string | null
  onMarkerHover: (id: string | null) => void
}

export function MapClusters({
  clusters,
  onClusterClick,
  onMarkerClick,
  hoveredMarkerId,
  onMarkerHover,
}: MapClustersProps) {
  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates
        const { cluster: isCluster, point_count: pointCount } = cluster.properties

        if (isCluster) {
          const size = 30 + Math.min((pointCount / clusters.length) * 30, 40)

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

        const mikvah = cluster.properties.mikvah as Mikvah
        const isSelected = hoveredMarkerId === mikvah.id

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
              className="cursor-pointer"
              onMouseEnter={() => onMarkerHover(mikvah.id)}
              onMouseLeave={() => onMarkerHover(null)}
            >
              <MikvahMarker
                type={mikvah.mikvah_type}
                isSelected={isSelected}
                isHovered={isSelected}
              />
            </div>
          </Marker>
        )
      })}
    </>
  )
}
