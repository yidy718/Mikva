import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showCount?: boolean
  count?: number
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showCount = false,
  count,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const handleClick = (selectedRating: number) => {
    if (interactive && onChange) {
      onChange(selectedRating)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= Math.round(rating)
          const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
            >
              {/* Background star */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-muted-foreground'
                )}
              />

              {/* Filled star */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'absolute inset-0 text-yellow-400 fill-yellow-400 transition-opacity',
                  isFilled ? 'opacity-100' : 'opacity-0'
                )}
                style={
                  isPartial
                    ? {
                        clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
                      }
                    : undefined
                }
              />
            </button>
          )
        })}
      </div>

      {showCount && count !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count})
        </span>
      )}

      {!showCount && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
