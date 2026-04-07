import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

const variants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  tertiary: 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: Props) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
