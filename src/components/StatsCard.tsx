type Props = {
  title: string
  value: number
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, subtitle, icon: Icon }: Props) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
    </div>
  )
}
