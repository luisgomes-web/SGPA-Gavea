import { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ActionPlan } from './pages/ActionPlan'
import { Dashboard } from './pages/Dashboard'
import { Evidences } from './pages/Evidences'
import { Indicators } from './pages/Indicators'
import './App.css'
import './pages/Evidences.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  function renderPage() {
    if (activePage === 'Plano de Ação') return <ActionPlan />
    if (activePage === 'Evidências') return <Evidences />
    if (activePage === 'Indicadores') return <Indicators />
    return <Dashboard />
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <Header title={activePage === 'Dashboard' ? 'Dashboard Executivo' : activePage} />
        {renderPage()}
      </main>
    </div>
  )
}

export default App
