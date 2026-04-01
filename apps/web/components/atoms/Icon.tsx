interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  filled?: boolean
  className?: string
}

const sizeClass = { sm: 'text-[18px]', md: 'text-[20px]', lg: 'text-[24px]' }

export default function Icon({ name, size = 'md', filled = false, className = '' }: Props) {
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${sizeClass[size]} ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}
