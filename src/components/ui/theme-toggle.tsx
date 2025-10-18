'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/lib/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
}

export function ThemeToggle({ className, showLabel = false, size = 'default' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  const getLabel = () => {
    if (theme === 'system') {
      return 'System'
    }
    return resolvedTheme === 'dark' ? 'Dark' : 'Light'
  }

  const getTooltipText = () => {
    if (theme === 'light') {
      return 'Switch to dark mode'
    } else if (theme === 'dark') {
      return 'Switch to system theme'
    } else {
      return 'Switch to light mode'
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          onClick={cycleTheme}
          className={cn(
            'transition-all duration-200 hover:scale-105',
            className
          )}
          aria-label={getTooltipText()}
        >
          {getIcon()}
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {getLabel()}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// Alternative dropdown version for more explicit theme selection
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ]

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {themes.map(({ value, label, icon: Icon }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <Button
              variant={theme === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme(value)}
              className={cn(
                'h-8 w-8 p-0 transition-all duration-200',
                theme === value && 'shadow-sm'
              )}
              aria-label={`Switch to ${label} theme`}
            >
              <Icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label} theme</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
