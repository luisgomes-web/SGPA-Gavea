import { Bell, ChevronDown, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">GÁVEA GROUP • PROJETO P-35</p>
        <h1>Dashboard Executivo</h1>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input aria-label="Pesquisar" placeholder="Pesquisar no SGPA..." />
        </label>
        <button className="icon-button notification-button" type="button" aria-label="Notificações">
          <Bell size={19} />
          <span className="notification-dot">3</span>
        </button>
        <button className="project-selector" type="button">
          <span>
            <small>Projeto ativo</small>
            <strong>P-35</strong>
          </span>
          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  )
}
