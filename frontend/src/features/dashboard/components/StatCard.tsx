import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple'
  description?: string
  alert?: boolean
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    value: 'text-green-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    value: 'text-yellow-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    value: 'text-purple-700',
  },
}

export function StatCard({ title, value, icon: Icon, color, description, alert }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
          <Icon size={18} />
        </div>
        {alert && value > 0 && (
          <span className="w-2 h-2 rounded-full bg-red-500 mt-1" />
        )}
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-bold ${alert && value > 0 ? 'text-red-600' : colors.value}`}>
          {value}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  )
}