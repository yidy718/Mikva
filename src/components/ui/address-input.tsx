'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { Label } from './label'
import { geocodingService, type GeocodingResult, debounce } from '@/lib/geocoding'
import { cn } from '@/lib/utils'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (result: GeocodingResult) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  country?: string
  proximity?: [number, number]
  searchTypes?: string[] // Allow customizing search types
}

export function AddressInput({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Enter address...",
  label,
  error,
  disabled = false,
  className,
  country, // No default country for worldwide access
  proximity,
  searchTypes = ['address', 'poi'], // Default to address and poi, but allow override
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        console.log('Searching for:', query) // Debug log
        const results = await geocodingService.searchAddress(query, {
          country,
          proximity,
          types: searchTypes,
          limit: 5,
        })
        console.log('Search results:', results) // Debug log
        setSuggestions(results)
      } catch (error) {
        console.error('Address search error:', error)
        // Show a fallback message if geocoding fails
        setSuggestions([{
          id: 'error',
          place_name: 'Geocoding service unavailable. Please check your Mapbox token.',
          center: [0, 0],
          context: [],
          properties: {}
        }])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [country, proximity]
  )

  useEffect(() => {
    if (value) {
      debouncedSearch(value)
    } else {
      setSuggestions([])
    }
  }, [value, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    onChange(suggestion.place_name)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    if (onLocationSelect) {
      onLocationSelect(suggestion)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor="address-input" className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id="address-input"
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  index === selectedIndex && "bg-muted"
                )}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {suggestion.place_name}
                  </p>
                  {suggestion.context && suggestion.context.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {suggestion.context
                        .slice(0, 2)
                        .map(ctx => ctx.text)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

