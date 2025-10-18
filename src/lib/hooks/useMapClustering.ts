'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Supercluster from 'supercluster'
import type { Mikvah } from '@/lib/types'

interface UseMapClusteringProps {
  mikvahs: Mikvah[]
  viewState: {
    longitude: number
    latitude: number
    zoom: number
  }
  mapRef: React.RefObject<any>
}

export function useMapClustering({ mikvahs, viewState, mapRef }: UseMapClusteringProps) {
  const [clusters, setClusters] = useState<any[]>([])
  
  // Create supercluster index (memoized to prevent recreation on every render)
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

  const updateClusters = useCallback(() => {
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
  }, [viewState.zoom, mapRef])

  useEffect(() => {
    const timer = setTimeout(() => {
      updateClusters()
    }, 100)
    return () => clearTimeout(timer)
  }, [viewState.longitude, viewState.latitude, viewState.zoom, updateClusters])

  const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
    const expansionZoom = Math.min(
      supercluster.current.getClusterExpansionZoom(clusterId),
      20
    )

    return {
      longitude,
      latitude,
      zoom: expansionZoom,
    }
  }, [])

  return {
    clusters,
    updateClusters,
    handleClusterClick,
  }
}
