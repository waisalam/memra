import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'purple' | 'green' | 'yellow' | 'red'
}

const variantClasses: Record<string, string> = {
  default: 'bg-zinc-800 text-zinc-300',
  blue: 'bg-blue-900/50 text-blue-300',
  purple: 'bg-purple-900/50 text-purple-300',
  green: 'bg-green-900/50 text-green-300',
  yellow: 'bg-yellow-900/50 text-yellow-300',
  red: 'bg-red-900/50 text-red-300',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
