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
  private mapboxToken: string

  constructor() {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      throw new Error('Mapbox token is required')
    }
    // Clean the token by removing any newlines or whitespace
    this.mapboxToken = token.trim().replace(/\n/g, '').replace(/\r/g, '')
    console.log('GeocodingService: Using token:', this.mapboxToken.substring(0, 20) + '...')
  }

  async searchAddress(
    query: string,
    options: GeocodingOptions = {}
  ): Promise<GeocodingResult[]> {
    try {
      console.log('GeocodingService: Searching for', query, 'with options', options)
      
      const params = new URLSearchParams({
        access_token: this.mapboxToken,
        q: query,
        limit: (options.limit || 5).toString(),
        language: 'en',
      })

      if (options.country) {
        params.append('country', options.country)
      }
      if (options.proximity) {
        params.append('proximity', `${options.proximity[0]},${options.proximity[1]}`)
      }
      if (options.bbox) {
        params.append('bbox', options.bbox.join(','))
      }
      if (options.types) {
        params.append('types', options.types.join(','))
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
      console.log('GeocodingService: Making request to', url)
      
      const response = await fetch(url)

      if (!response.ok) {
        console.error('GeocodingService: API error', response.status, response.statusText)
        if (response.status === 401) {
          console.error('GeocodingService: Authentication failed. Check your Mapbox token.')
          throw new Error('Mapbox authentication failed. Please check your token.')
        }
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('GeocodingService: API response', data)
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center as [number, number],
        context: feature.context?.map((ctx: any) => ({
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
      const params = new URLSearchParams({
        access_token: this.mapboxToken,
        limit: '1',
        language: 'en',
      })

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${params}`
      )

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.features.length === 0) {
        return null
      }

      const feature = data.features[0]
      return {
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center as [number, number],
        context: feature.context?.map((ctx: any) => ({
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
