import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsFavorite, useToggleFavorite } from '@/lib/hooks/useFavorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  mikvahId: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showTooltip?: boolean
  className?: string
}

export function FavoriteButton({
  mikvahId,
  size = 'default',
  variant = 'ghost',
  showTooltip = true,
  className,
}: FavoriteButtonProps) {
  const { data: isFavorite, isLoading: checkingFavorite } = useIsFavorite(mikvahId)
  const toggleFavorite = useToggleFavorite()
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(null)

  // Use optimistic state if available, otherwise use server state
  const currentFavorite = optimisticFavorite !== null ? optimisticFavorite : isFavorite

  const handleToggle = () => {
    if (!mikvahId) return

    // Optimistic update
    setOptimisticFavorite(!currentFavorite)

    toggleFavorite.mutate(
      { mikvahId, isFavorite: currentFavorite || false },
      {
        onError: () => {
          // Revert optimistic update on error
          setOptimisticFavorite(null)
        },
        onSuccess: () => {
          // Clear optimistic state on success
          setOptimisticFavorite(null)
        },
      }
    )
  }

  const button = (
    <Button
      size={size}
      variant={variant}
      onClick={handleToggle}
      disabled={checkingFavorite || toggleFavorite.isPending}
      className={cn(
        'transition-colors',
        currentFavorite
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-red-500',
        className
      )}
      aria-label={currentFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'transition-all duration-200',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5',
          currentFavorite && 'fill-current'
        )}
      />
    </Button>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent>
        <p>{currentFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
      </TooltipContent>
    </Tooltip>
  )
}
