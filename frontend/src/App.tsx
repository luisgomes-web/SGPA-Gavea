import { useState } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ActionPlan } from './pages/ActionPlan'
import { Dashboard } from './pages/Dashboard'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <Header title={activePage === 'Dashboard' ? 'Dashboard Executivo' : activePage} />
        {activePage === 'Plano de Ação' ? <ActionPlan /> : <Dashboard />}
      </main>
    </div>
  )
}

export default App
