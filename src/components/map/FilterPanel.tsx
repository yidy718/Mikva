import { useState } from 'react'
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
  const [isExpanded, setIsExpanded] = useState(false)

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
    <div className={cn('bg-background border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">
            {t('filters.title') || 'Filters'}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              {t('filters.clear') || 'Clear'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
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
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>{t('filters.search') || 'Search'}</Label>
            <Input
              placeholder={t('filters.searchPlaceholder') || 'Search mikvahs...'}
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            />
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label>{t('filters.sortBy') || 'Sort By'}</Label>
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
            <Label>{t('filters.type') || 'Type'}</Label>
            <div className="flex flex-wrap gap-2">
              {mikvahTypes.map(type => (
                <Badge
                  key={type.value}
                  variant={filters.types.includes(type.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleType(type.value)}
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
            <Label>{t('filters.maxDistance') || 'Max Distance (km)'}</Label>
            <Input
              type="number"
              placeholder="Any distance"
              value={filters.maxDistance || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxDistance: e.target.value ? Number(e.target.value) : undefined
              })}
            />
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="p-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {filters.types.map(type => {
              const typeLabel = mikvahTypes.find(t => t.value === type)?.label
              return (
                <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => toggleType(type)}>
                  {typeLabel}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
            {filters.searchQuery && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}>
                Search: {filters.searchQuery}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {filters.maxDistance && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => onFiltersChange({ ...filters, maxDistance: undefined })}>
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
