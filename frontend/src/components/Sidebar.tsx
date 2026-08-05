import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react'

const items = [
  { label: 'Dashboard', icon: Gauge },
  { label: 'Plano de Ação', icon: ClipboardList },
  { label: 'Evidências', icon: FileText },
  { label: 'Indicadores', icon: BarChart3 },
  { label: 'Cronograma', icon: CalendarDays },
  { label: 'Riscos', icon: ShieldAlert },
  { label: 'Relatórios', icon: FileText },
  { label: 'Usuários', icon: Users },
  { label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">GG</div>
        <div>
          <strong>SGPA</strong>
          <span>GÁVEA GROUP</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {items.map(({ label, icon: Icon }, index) => (
          <button className={index === 0 ? 'nav-item active' : 'nav-item'} key={label} type="button">
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">LG</div>
        <div>
          <strong>Luis Phillipe</strong>
          <span>Administrador local</span>
        </div>
      </div>
    </aside>
  )
}
