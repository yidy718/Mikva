import { MapboxGeocoding } from '@mapbox/mapbox-sdk/services/geocoding'

export interface GeocodingResult {
  id: string
  place_name: string
  center: [number, number] // [longitude, latitude]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
  properties?: {
    accuracy?: string
    address?: string
    category?: string
  }
}

export interface GeocodingOptions {
  country?: string
  proximity?: [number, number] // [longitude, latitude]
  bbox?: [number, number, number, number] // [minLng, minLat, maxLng, maxLat]
  types?: string[]
  limit?: number
}

class GeocodingService {
  private geocoding: MapboxGeocoding

  constructor() {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      throw new Error('Mapbox token is required')
    }
    
    this.geocoding = new MapboxGeocoding({
      accessToken: mapboxToken
    })
  }

  async searchAddress(
    query: string,
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult[]> {
    try {
      const response = await this.geocoding
        .forwardGeocode({
          query,
          countries: options.country ? [options.country] : undefined,
          proximity: options.proximity,
          bbox: options.bbox,
          types: options.types,
          limit: options.limit || 5,
          language: ['en'], // Default to English for worldwide support
        })
        .send()

      return response.body.features.map((feature) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center as [number, number],
        context: feature.context?.map((ctx) => ({
          id: ctx.id,
          text: ctx.text,
          short_code: ctx.short_code,
        })),
        properties: {
          accuracy: feature.properties?.accuracy,
          address: feature.properties?.address,
          category: feature.properties?.category,
        },
      }))
    } catch (error) {
      console.error('Geocoding error:', error)
      return []
    }
  }

  async reverseGeocode(
    longitude: number,
    latitude: number
  ): Promise<GeocodingResult | null> {
    try {
      const response = await this.geocoding
        .reverseGeocode({
          query: [longitude, latitude],
          limit: 1,
          language: ['en'], // Default to English for worldwide support
        })
        .send()

      if (response.body.features.length === 0) {
        return null
      }

      const feature = response.body.features[0]
      return {
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center as [number, number],
        context: feature.context?.map((ctx) => ({
          id: ctx.id,
          text: ctx.text,
          short_code: ctx.short_code,
        })),
        properties: {
          accuracy: feature.properties?.accuracy,
          address: feature.properties?.address,
          category: feature.properties?.category,
        },
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  }
}

export const geocodingService = new GeocodingService()

// Utility function for debouncing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
