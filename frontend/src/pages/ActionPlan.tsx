import { FormEvent, useMemo, useState } from 'react'
import { Download, Filter, Paperclip, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { actionItems as initialActions, type ActionItem, type ActionStatus, type Criticality } from '../data/actions'

const emptyForm: Omit<ActionItem, 'id' | 'evidenceCount'> = {
  title: '', area: '', owner: '', manager: 'Rodrigo Santos', openedAt: '', deadline: '',
  status: 'Não iniciada', criticality: 'Média', progress: 0,
}

export function ActionPlan() {
  const [actions, setActions] = useState<ActionItem[]>(initialActions)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [criticality, setCriticality] = useState('Todas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const filteredActions = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return actions.filter((action) => {
      const matchesQuery = !normalized || [action.id, action.title, action.area, action.owner].join(' ').toLowerCase().includes(normalized)
      const matchesStatus = status === 'Todos' || action.status === status
      const matchesCriticality = criticality === 'Todas' || action.criticality === criticality
      return matchesQuery && matchesStatus && matchesCriticality
    })
  }, [actions, query, status, criticality])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (action: ActionItem) => {
    setEditingId(action.id)
    const { id: _id, evidenceCount: _evidenceCount, ...editable } = action
    setForm(editable)
    setIsModalOpen(true)
  }

  const saveAction = (event: FormEvent) => {
    event.preventDefault()
    if (!form.title.trim() || !form.owner.trim() || !form.deadline) return

    if (editingId) {
      setActions((current) => current.map((item) => item.id === editingId ? { ...item, ...form } : item))
    } else {
      const nextNumber = Math.max(0, ...actions.map((item) => Number(item.id.split('-')[1]) || 0)) + 1
      setActions((current) => [...current, {
        ...form,
        id: `P35-${String(nextNumber).padStart(3, '0')}`,
        evidenceCount: 0,
      }])
    }
    setIsModalOpen(false)
  }

  const removeAction = (id: string) => {
    if (window.confirm(`Deseja excluir a ação ${id}?`)) {
      setActions((current) => current.filter((item) => item.id !== id))
    }
  }

  const averageProgress = actions.length ? Math.round(actions.reduce((sum, item) => sum + item.progress, 0) / actions.length) : 0

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
          <button className="primary-button" type="button" onClick={openNew}><Plus size={17} /> Nova ação</button>
        </div>
      </div>

      <div className="summary-strip">
        <div><span>Total</span><strong>{actions.length}</strong></div>
        <div><span>Em andamento</span><strong>{actions.filter((item) => item.status === 'Em andamento').length}</strong></div>
        <div><span>Atrasadas</span><strong>{actions.filter((item) => item.status === 'Atrasada').length}</strong></div>
        <div><span>Concluídas</span><strong>{actions.filter((item) => item.status === 'Concluída').length}</strong></div>
        <div><span>Progresso médio</span><strong>{averageProgress}%</strong></div>
      </div>

      <article className="panel action-control-panel">
        <div className="filters-row">
          <label className="action-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar ID, ação, área ou responsável..." /></label>
          <label className="select-control"><Filter size={15} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Não iniciada</option><option>Em andamento</option><option>Concluída</option><option>Atrasada</option></select></label>
          <label className="select-control"><select value={criticality} onChange={(event) => setCriticality(event.target.value)}><option>Todas</option><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          <span className="result-count">{filteredActions.length} ações encontradas</span>
        </div>

        <div className="table-wrap action-plan-table">
          <table>
            <thead><tr><th>ID</th><th>Ação / Área</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Criticidade</th><th>Progresso</th><th>Evidências</th><th>Ações</th></tr></thead>
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
                  <td><div className="row-actions"><button type="button" onClick={() => openEdit(action)} aria-label={`Editar ${action.id}`}><Pencil size={15} /></button><button type="button" onClick={() => removeAction(action.id)} aria-label={`Excluir ${action.id}`}><Trash2 size={15} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActions.length === 0 && <div className="empty-state">Nenhuma ação encontrada com os filtros selecionados.</div>}
        </div>
      </article>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsModalOpen(false)}>
          <div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="eyebrow">PLANO DE AÇÃO P-35</p><h3 id="action-modal-title">{editingId ? `Editar ${editingId}` : 'Cadastrar nova ação'}</h3></div><button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}><X size={19} /></button></div>
            <form onSubmit={saveAction} className="action-form">
              <label className="form-field form-wide"><span>Ação *</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="O que será realizado?" /></label>
              <label className="form-field"><span>Área</span><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ex.: Segurança Patrimonial" /></label>
              <label className="form-field"><span>Responsável *</span><input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></label>
              <label className="form-field"><span>Gerente</span><input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} /></label>
              <label className="form-field"><span>Data de abertura</span><input type="date" value={form.openedAt} onChange={(e) => setForm({ ...form, openedAt: e.target.value })} /></label>
              <label className="form-field"><span>Prazo *</span><input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></label>
              <label className="form-field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ActionStatus })}><option>Não iniciada</option><option>Em andamento</option><option>Concluída</option><option>Atrasada</option></select></label>
              <label className="form-field"><span>Criticidade</span><select value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value as Criticality })}><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
              <label className="form-field form-wide"><span>Progresso: {form.progress}%</span><input type="range" min="0" max="100" step="5" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></label>
              <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button type="submit" className="primary-button">{editingId ? 'Salvar alterações' : 'Cadastrar ação'}</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
