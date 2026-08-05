import { useMemo, useState } from 'react'
import { Download, Filter, Paperclip, Plus, Search } from 'lucide-react'
import { actionItems } from '../data/actions'

export function ActionPlan() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [criticality, setCriticality] = useState('Todas')

  const filteredActions = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return actionItems.filter((action) => {
      const matchesQuery = !normalized || [action.id, action.title, action.area, action.owner]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      const matchesStatus = status === 'Todos' || action.status === status
      const matchesCriticality = criticality === 'Todas' || action.criticality === criticality
      return matchesQuery && matchesStatus && matchesCriticality
    })
  }, [query, status, criticality])

  return (
    <section className="action-plan-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTÃO OPERACIONAL • PROJETO P-35</p>
          <h2>Plano de Ação</h2>
          <p>Controle 5W2H de ações, responsáveis, prazos, criticidades, progresso e evidências.</p>
        </div>
        <div className="page-actions">
          <button className="secondary-button" type="button"><Download size={17} /> Exportar</button>
          <button className="primary-button" type="button"><Plus size={17} /> Nova ação</button>
        </div>
      </div>

      <div className="summary-strip">
        <div><span>Total</span><strong>{actionItems.length}</strong></div>
        <div><span>Em andamento</span><strong>{actionItems.filter((item) => item.status === 'Em andamento').length}</strong></div>
        <div><span>Atrasadas</span><strong>{actionItems.filter((item) => item.status === 'Atrasada').length}</strong></div>
        <div><span>Concluídas</span><strong>{actionItems.filter((item) => item.status === 'Concluída').length}</strong></div>
        <div><span>Progresso médio</span><strong>{Math.round(actionItems.reduce((sum, item) => sum + item.progress, 0) / actionItems.length)}%</strong></div>
      </div>

      <article className="panel action-control-panel">
        <div className="filters-row">
          <label className="action-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar ID, ação, área ou responsável..." />
          </label>
          <label className="select-control"><Filter size={15} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Não iniciada</option><option>Em andamento</option><option>Concluída</option><option>Atrasada</option></select></label>
          <label className="select-control"><select value={criticality} onChange={(event) => setCriticality(event.target.value)}><option>Todas</option><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          <span className="result-count">{filteredActions.length} ações encontradas</span>
        </div>

        <div className="table-wrap action-plan-table">
          <table>
            <thead>
              <tr><th>ID</th><th>Ação / Área</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Criticidade</th><th>Progresso</th><th>Evidências</th></tr>
            </thead>
            <tbody>
              {filteredActions.map((action) => (
                <tr key={action.id}>
                  <td className="action-id">{action.id}</td>
                  <td><strong className="action-title">{action.title}</strong><span className="action-subtitle">{action.area}</span></td>
                  <td><strong className="action-owner">{action.owner}</strong><span className="action-subtitle">Gerência: {action.manager}</span></td>
                  <td>{action.deadline}</td>
                  <td><span className={`badge status-${action.status.toLowerCase().replaceAll(' ', '-').replaceAll('í', 'i')}`}>{action.status}</span></td>
                  <td><span className={`badge badge-${action.criticality.toLowerCase()}`}>{action.criticality}</span></td>
                  <td><div className="table-progress"><div><span style={{ width: `${action.progress}%` }} /></div><strong>{action.progress}%</strong></div></td>
                  <td><span className="evidence-count"><Paperclip size={14} /> {action.evidenceCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActions.length === 0 && <div className="empty-state">Nenhuma ação encontrada com os filtros selecionados.</div>}
        </div>
      </article>
    </section>
  )
}
