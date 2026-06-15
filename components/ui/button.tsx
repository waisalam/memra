'use client'

import * as React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  gradient: 'text-white hover:opacity-90',
  outline: 'border border-zinc-700 text-zinc-200 hover:bg-zinc-800',
  ghost: 'text-zinc-300 hover:bg-zinc-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const variantStyles: Record<string, React.CSSProperties> = {
  gradient: { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
}

const sizeClasses: Record<string, string> = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'default', size = 'default', className = '', style, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
