import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import type { ActionItem } from '../data/actions'
import { listActions } from '../services/actionsApi'
import {
  deleteEvidence,
  listEvidences,
  uploadEvidences,
  type EvidenceItem,
} from '../services/evidencesApi'

function fileType(item: EvidenceItem) {
  if (item.mimeType.startsWith('image/')) return 'Imagem'
  if (item.mimeType.includes('pdf')) return 'PDF'
  if (item.name.match(/\.(xlsx|xls|csv)$/i)) return 'Planilha'
  if (item.name.match(/\.(doc|docx)$/i)) return 'Documento'
  return 'Arquivo'
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function formatDate(value: string) {
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

function EvidenceIcon({ type }: { type: string }) {
  if (type === 'Imagem') return <FileImage size={20} />
  if (type === 'Planilha') return <FileSpreadsheet size={20} />
  if (type === 'PDF' || type === 'Documento') return <FileText size={20} />
  return <File size={20} />
}

export function Evidences() {
  const [evidences, setEvidences] = useState<EvidenceItem[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('Todas')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<EvidenceItem | null>(null)
  const [actionId, setActionId] = useState('')
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [evidenceRows, actionRows] = await Promise.all([listEvidences(), listActions()])
      setEvidences(evidenceRows)
      setActions(actionRows)
      if (!actionId && actionRows.length) setActionId(actionRows[0].id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as evidências.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return evidences.filter((item) => {
      const matchesText = !normalized || [item.name, item.actionId, item.actionTitle, item.uploadedBy]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      return matchesText && (actionFilter === 'Todas' || item.actionId === actionFilter)
    })
  }, [actionFilter, evidences, query])

  const totalSize = evidences.reduce((sum, item) => sum + item.sizeBytes, 0)

  async function addEvidence() {
    if (!files.length || !actionId || saving) return
    setSaving(true)
    setError('')
    try {
      const created = await uploadEvidences(actionId, note, files)
      setEvidences((current) => [...created, ...current])
      setFiles([])
      setNote('')
      setShowModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível anexar a evidência.')
    } finally {
      setSaving(false)
    }
  }

  async function removeEvidence(item: EvidenceItem) {
    if (!window.confirm(`Deseja excluir permanentemente a evidência "${item.name}"?`)) return
    setError('')
    try {
      await deleteEvidence(item.id)
      setEvidences((current) => current.filter((entry) => entry.id !== item.id))
      if (selected?.id === item.id) setSelected(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a evidência.')
    }
  }

  function viewEvidence(item: EvidenceItem) {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  function downloadEvidence(item: EvidenceItem) {
    const link = document.createElement('a')
    link.href = item.downloadUrl
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <section className="evidence-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTÃO DOCUMENTAL • PROJETO P-35</p>
          <h2>Evidências</h2>
          <p>Centralize fotos, relatórios e documentos vinculados às ações do plano.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowModal(true)} disabled={!actions.length}>
          <Plus size={17} /> Anexar evidência
        </button>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <div className="summary-strip evidence-summary">
        <div><span>Total de arquivos</span><strong>{evidences.length}</strong></div>
        <div><span>Ações com evidência</span><strong>{new Set(evidences.map((item) => item.actionId)).size}</strong></div>
        <div><span>Imagens</span><strong>{evidences.filter((item) => fileType(item) === 'Imagem').length}</strong></div>
        <div><span>Documentos</span><strong>{evidences.filter((item) => fileType(item) !== 'Imagem').length}</strong></div>
        <div><span>Armazenamento estimado</span><strong>{formatSize(totalSize)}</strong></div>
      </div>

      <article className="panel evidence-control-panel">
        <div className="filters-row">
          <label className="action-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar arquivo, ação ou usuário..." />
          </label>
          <label className="select-control">
            <Paperclip size={15} />
            <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
              <option>Todas</option>
              {actions.map((action) => <option key={action.id} value={action.id}>{action.id}</option>)}
            </select>
          </label>
          <span className="result-count">{filtered.length} evidências encontradas</span>
        </div>

        {loading ? <div className="empty-state">Carregando evidências do banco...</div> : (
          <div className="evidence-grid">
            {filtered.map((item) => {
              const type = fileType(item)
              return (
                <article className="evidence-card" key={item.id}>
                  <div className={`evidence-file-icon type-${type.toLowerCase()}`}><EvidenceIcon type={type} /></div>
                  <div className="evidence-card-content">
                    <span className="evidence-action">{item.actionId}</span>
                    <h3 title={item.name}>{item.name}</h3>
                    <p>{item.actionTitle}</p>
                    <div className="evidence-meta"><span>{type}</span><span>{formatSize(item.sizeBytes)}</span><span>{formatDate(item.uploadedAt)}</span></div>
                    <small>Enviado por {item.uploadedBy}</small>
                  </div>
                  <div className="evidence-actions">
                    <button type="button" title="Visualizar arquivo" onClick={() => viewEvidence(item)}><Eye size={16} /></button>
                    <button type="button" title="Baixar arquivo" onClick={() => downloadEvidence(item)}><Download size={16} /></button>
                    <button type="button" title="Excluir" onClick={() => void removeEvidence(item)}><Trash2 size={16} /></button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
        {!loading && !filtered.length && <div className="empty-state">Nenhuma evidência registrada no banco para os filtros selecionados.</div>}
      </article>

      {showModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => !saving && setShowModal(false)}>
          <div className="action-modal evidence-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><p className="eyebrow">NOVO REGISTRO • ARMAZENAMENTO REAL</p><h3>Anexar evidência</h3></div>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)} disabled={saving}><X size={20} /></button>
            </div>
            <div className="action-form">
              <label className="form-field form-wide"><span>Ação vinculada</span><select value={actionId} onChange={(event) => setActionId(event.target.value)}>{actions.map((action) => <option key={action.id} value={action.id}>{action.id} — {action.title}</option>)}</select></label>
              <label className="upload-dropzone form-wide">
                <Upload size={30} />
                <strong>Selecionar fotos ou documentos</strong>
                <span>Até 10 arquivos por envio • máximo de 25 MB por arquivo</span>
                <input multiple type="file" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              </label>
              {!!files.length && <div className="selected-files form-wide">{files.map((file) => <span key={`${file.name}-${file.size}`}><Paperclip size={13} /> {file.name} <small>{formatSize(file.size)}</small></span>)}</div>}
              <label className="form-field form-wide"><span>Observações</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Descreva o que esta evidência comprova..." /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" disabled={saving} onClick={() => setShowModal(false)}>Cancelar</button><button className="primary-button" type="button" disabled={!files.length || saving} onClick={() => void addEvidence()}><Upload size={16} /> {saving ? 'Enviando...' : `Anexar ${files.length || ''}`}</button></div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <div className="action-modal evidence-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="eyebrow">DETALHES DA EVIDÊNCIA</p><h3>{selected.name}</h3></div><button className="modal-close" type="button" onClick={() => setSelected(null)}><X size={20} /></button></div>
            <div className="evidence-detail-body">
              <div className="evidence-preview"><EvidenceIcon type={fileType(selected)} /><strong>{fileType(selected)}</strong><span>{formatSize(selected.sizeBytes)}</span></div>
              <dl>
                <div><dt>ID</dt><dd>EV-{String(selected.id).padStart(4, '0')}</dd></div><div><dt>Ação vinculada</dt><dd>{selected.actionId}</dd></div><div><dt>Data</dt><dd>{formatDate(selected.uploadedAt)}</dd></div><div><dt>Enviado por</dt><dd>{selected.uploadedBy}</dd></div><div className="detail-wide"><dt>Observações</dt><dd>{selected.note || 'Sem observações.'}</dd></div>
              </dl>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelected(null)}>Fechar</button><button className="primary-button" type="button" onClick={() => downloadEvidence(selected)}><Download size={16} /> Baixar arquivo</button></div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
