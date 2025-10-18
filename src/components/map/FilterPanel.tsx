import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterOptions {
  types: string[]
  searchQuery: string
  sortBy: 'nearest' | 'name' | 'newest'
  maxDistance?: number
}

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  className?: string
}

export function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
  const { t } = useTranslation()
  // Default to collapsed on mobile, expanded on desktop
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Check if desktop on mount
    const checkIfDesktop = () => {
      setIsExpanded(window.innerWidth >= 768)
    }
    checkIfDesktop()

    window.addEventListener('resize', checkIfDesktop)
    return () => window.removeEventListener('resize', checkIfDesktop)
  }, [])

  const mikvahTypes = [
    { value: 'men_only', label: t('filters.menOnly') || 'Men Only' },
    { value: 'separate_hours', label: t('filters.separateHours') || 'Separate Hours' },
    { value: 'family', label: t('filters.family') || 'Family' },
  ]

  const sortOptions = [
    { value: 'nearest', label: t('filters.nearest') || 'Nearest' },
    { value: 'name', label: t('filters.name') || 'Name (A-Z)' },
    { value: 'newest', label: t('filters.newest') || 'Newest' },
  ]

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      searchQuery: '',
      sortBy: 'nearest',
      maxDistance: undefined,
    })
  }

  const activeFilterCount = filters.types.length + (filters.searchQuery ? 1 : 0) + (filters.maxDistance ? 1 : 0)

  return (
    <div className={cn('bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">
            {t('filters.title') || 'Filters'}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t('filters.search') || 'Search'}</Label>
            <Input
              placeholder="Search mikvahs..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t('filters.sortBy') || 'Sort By'}</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => onFiltersChange({ ...filters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mikvah Type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t('filters.type') || 'Type'}</Label>
            <div className="flex flex-wrap gap-2">
              {mikvahTypes.map(type => (
                <Badge
                  key={type.value}
                  variant={filters.types.includes(type.value) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs touch-target"
                  onClick={() => toggleType(type.value)}
                  data-filter-badge
                >
                  {type.label}
                  {filters.types.includes(type.value) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t('filters.maxDistance') || 'Max Distance (km)'}</Label>
            <Input
              type="number"
              placeholder="Any distance"
              value={filters.maxDistance || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxDistance: e.target.value ? Number(e.target.value) : undefined
              })}
              className="h-9"
            />
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {filters.types.map(type => {
              const typeLabel = mikvahTypes.find(t => t.value === type)?.label
              return (
                <Badge key={type} variant="secondary" className="cursor-pointer text-xs" onClick={() => toggleType(type)} data-filter-badge>
                  {typeLabel}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
            {filters.searchQuery && (
              <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => onFiltersChange({ ...filters, searchQuery: '' })} data-filter-badge>
                Search: {filters.searchQuery}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.maxDistance && (
              <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => onFiltersChange({ ...filters, maxDistance: undefined })} data-filter-badge>
                Within {filters.maxDistance}km
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
