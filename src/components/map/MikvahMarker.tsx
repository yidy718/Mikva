interface MikvahMarkerProps {
  type?: string
  isSelected?: boolean
  isHovered?: boolean
  className?: string
}

export function MikvahMarker({ type = 'separate_hours', isSelected, isHovered, className }: MikvahMarkerProps) {
  // Color based on mikvah type
  const getColor = () => {
    switch (type) {
      case 'men_only':
        return isSelected ? '#3b82f6' : '#60a5fa' // blue
      case 'separate_hours':
        return isSelected ? '#8b5cf6' : '#a78bfa' // purple
      case 'family':
        return isSelected ? '#10b981' : '#34d399' // green
      default:
        return isSelected ? '#6366f1' : '#818cf8' // indigo
    }
  }

  const color = getColor()
  const scale = isHovered ? 1.1 : isSelected ? 1.15 : 1

  return (
    <svg
      width="40"
      height="48"
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
        transform: `scale(${scale})`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Pin shape */}
      <path
        d="M20 0C11.163 0 4 7.163 4 16c0 12 16 32 16 32s16-20 16-32c0-8.837-7.163-16-16-16z"
        fill={color}
      />

      {/* Inner circle (water droplet area) */}
      <circle cx="20" cy="16" r="8" fill="white" opacity="0.9" />

      {/* Water droplet icon */}
      <path
        d="M20 10c-2.21 0-4 2.015-4 4.5 0 2.485 1.79 4.5 4 4.5s4-2.015 4-4.5c0-2.485-1.79-4.5-4-4.5zm0 7.5c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"
        fill={color}
      />
      <path
        d="M20 11.5c-.828 0-1.5.897-1.5 2s.672 2 1.5 2 1.5-.897 1.5-2-.672-2-1.5-2z"
        fill={color}
        opacity="0.7"
      />

      {/* Pulse animation ring for selected markers */}
      {isSelected && (
        <circle
          cx="20"
          cy="16"
          r="12"
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.6"
        >
          <animate
            attributeName="r"
            from="10"
            to="16"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  )
}

export function ClusterMarker({ count, size }: { count: number; size: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold cursor-pointer transition-all hover:scale-110"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '3px solid white',
      }}
    >
      {count}
    </div>
  )
}
