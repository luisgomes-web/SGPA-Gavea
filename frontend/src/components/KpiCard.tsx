import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: number | string
  helper: string
  tone: 'blue' | 'green' | 'amber' | 'red' | 'violet'
  icon: LucideIcon
}

export function KpiCard({ label, value, helper, tone, icon: Icon }: KpiCardProps) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <div className="kpi-icon">
        <Icon size={21} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  )
}
