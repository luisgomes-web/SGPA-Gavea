import { useMemo, useState } from 'react'
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
import { actionItems } from '../data/actions'

type EvidenceItem = {
  id: string
  actionId: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  note: string
  url?: string
}

const initialEvidences: EvidenceItem[] = [
  { id: 'EV-001', actionId: 'P35-001', name: 'Foto_instalacao_catraca_01.jpg', type: 'Imagem', size: '2,4 MB', uploadedAt: '05/08/2026', uploadedBy: 'Luis Phillipe', note: 'Registro do início da instalação das catracas.' },
  { id: 'EV-002', actionId: 'P35-001', name: 'Relatorio_tecnico_controle_acesso.pdf', type: 'PDF', size: '1,1 MB', uploadedAt: '05/08/2026', uploadedBy: 'Wamberto', note: 'Relatório técnico para validação da gerência.' },
  { id: 'EV-003', actionId: 'P35-004', name: 'Mapa_pontos_CFTV.xlsx', type: 'Planilha', size: '420 KB', uploadedAt: '04/08/2026', uploadedBy: 'Nathalia', note: 'Relação dos pontos previstos para instalação das câmeras.' },
  { id: 'EV-004', actionId: 'P35-005', name: 'Termo_conclusao_portalo.docx', type: 'Documento', size: '680 KB', uploadedAt: '03/08/2026', uploadedBy: 'Bernardo Kuo', note: 'Termo de conclusão do controle de acesso ao portaló.' },
]

function fileType(file: File) {
  if (file.type.startsWith('image/')) return 'Imagem'
  if (file.type.includes('pdf')) return 'PDF'
  if (file.name.match(/\.(xlsx|xls|csv)$/i)) return 'Planilha'
  if (file.name.match(/\.(doc|docx)$/i)) return 'Documento'
  return 'Arquivo'
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function EvidenceIcon({ type }: { type: string }) {
  if (type === 'Imagem') return <FileImage size={20} />
  if (type === 'Planilha') return <FileSpreadsheet size={20} />
  if (type === 'PDF' || type === 'Documento') return <FileText size={20} />
  return <File size={20} />
}

export function Evidences() {
  const [evidences, setEvidences] = useState(initialEvidences)
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('Todas')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<EvidenceItem | null>(null)
  const [actionId, setActionId] = useState(actionItems[0].id)
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return evidences.filter((item) => {
      const action = actionItems.find((entry) => entry.id === item.actionId)
      const matchesText = !normalized || [item.name, item.actionId, action?.title, item.uploadedBy]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      return matchesText && (actionFilter === 'Todas' || item.actionId === actionFilter)
    })
  }, [actionFilter, evidences, query])

  const totalSize = evidences.reduce((sum, item) => {
    const value = Number(item.size.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
    return sum + (item.size.includes('MB') ? value : value / 1024)
  }, 0)

  function addEvidence() {
    if (!files.length) return
    const date = new Date().toLocaleDateString('pt-BR')
    const newItems = files.map((file, index): EvidenceItem => ({
      id: `EV-${String(evidences.length + index + 1).padStart(3, '0')}`,
      actionId,
      name: file.name,
      type: fileType(file),
      size: formatSize(file.size),
      uploadedAt: date,
      uploadedBy: 'Luis Phillipe',
      note: note || 'Sem observações.',
      url: URL.createObjectURL(file),
    }))
    setEvidences((current) => [...newItems, ...current])
    setFiles([])
    setNote('')
    setShowModal(false)
  }

  function removeEvidence(id: string) {
    if (window.confirm('Deseja excluir esta evidência da sessão atual?')) {
      setEvidences((current) => current.filter((item) => item.id !== id))
      if (selected?.id === id) setSelected(null)
    }
  }

  function downloadEvidence(item: EvidenceItem) {
    if (!item.url) {
      window.alert('Arquivo demonstrativo. O download real será habilitado com o banco de dados e armazenamento.')
      return
    }
    const link = document.createElement('a')
    link.href = item.url
    link.download = item.name
    link.click()
  }

  return (
    <section className="evidence-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTÃO DOCUMENTAL • PROJETO P-35</p>
          <h2>Evidências</h2>
          <p>Centralize fotos, relatórios e documentos vinculados às ações do plano.</p>
        </div>
        <button className="primary-button" type="button" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Anexar evidência
        </button>
      </div>

      <div className="summary-strip evidence-summary">
        <div><span>Total de arquivos</span><strong>{evidences.length}</strong></div>
        <div><span>Ações com evidência</span><strong>{new Set(evidences.map((item) => item.actionId)).size}</strong></div>
        <div><span>Imagens</span><strong>{evidences.filter((item) => item.type === 'Imagem').length}</strong></div>
        <div><span>Documentos</span><strong>{evidences.filter((item) => item.type !== 'Imagem').length}</strong></div>
        <div><span>Armazenamento estimado</span><strong>{totalSize.toFixed(1).replace('.', ',')} MB</strong></div>
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
              {actionItems.map((action) => <option key={action.id} value={action.id}>{action.id}</option>)}
            </select>
          </label>
          <span className="result-count">{filtered.length} evidências encontradas</span>
        </div>

        <div className="evidence-grid">
          {filtered.map((item) => {
            const action = actionItems.find((entry) => entry.id === item.actionId)
            return (
              <article className="evidence-card" key={item.id}>
                <div className={`evidence-file-icon type-${item.type.toLowerCase()}`}><EvidenceIcon type={item.type} /></div>
                <div className="evidence-card-content">
                  <span className="evidence-action">{item.actionId}</span>
                  <h3 title={item.name}>{item.name}</h3>
                  <p>{action?.title}</p>
                  <div className="evidence-meta"><span>{item.type}</span><span>{item.size}</span><span>{item.uploadedAt}</span></div>
                  <small>Enviado por {item.uploadedBy}</small>
                </div>
                <div className="evidence-actions">
                  <button type="button" title="Ver detalhes" onClick={() => setSelected(item)}><Eye size={16} /></button>
                  <button type="button" title="Baixar" onClick={() => downloadEvidence(item)}><Download size={16} /></button>
                  <button type="button" title="Excluir" onClick={() => removeEvidence(item.id)}><Trash2 size={16} /></button>
                </div>
              </article>
            )
          })}
        </div>
        {!filtered.length && <div className="empty-state">Nenhuma evidência encontrada com os filtros selecionados.</div>}
      </article>

      {showModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowModal(false)}>
          <div className="action-modal evidence-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><p className="eyebrow">NOVO REGISTRO</p><h3>Anexar evidência</h3></div>
              <button className="modal-close" type="button" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="action-form">
              <label className="form-field form-wide"><span>Ação vinculada</span><select value={actionId} onChange={(event) => setActionId(event.target.value)}>{actionItems.map((action) => <option key={action.id} value={action.id}>{action.id} — {action.title}</option>)}</select></label>
              <label className="upload-dropzone form-wide">
                <Upload size={30} />
                <strong>Selecionar fotos ou documentos</strong>
                <span>PDF, Word, Excel, imagens e outros arquivos</span>
                <input multiple type="file" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              </label>
              {!!files.length && <div className="selected-files form-wide">{files.map((file) => <span key={`${file.name}-${file.size}`}><Paperclip size={13} /> {file.name} <small>{formatSize(file.size)}</small></span>)}</div>}
              <label className="form-field form-wide"><span>Observações</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Descreva o que esta evidência comprova..." /></label>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowModal(false)}>Cancelar</button><button className="primary-button" type="button" disabled={!files.length} onClick={addEvidence}><Upload size={16} /> Anexar {files.length || ''}</button></div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <div className="action-modal evidence-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><p className="eyebrow">DETALHES DA EVIDÊNCIA</p><h3>{selected.name}</h3></div><button className="modal-close" type="button" onClick={() => setSelected(null)}><X size={20} /></button></div>
            <div className="evidence-detail-body">
              <div className="evidence-preview"><EvidenceIcon type={selected.type} /><strong>{selected.type}</strong><span>{selected.size}</span></div>
              <dl>
                <div><dt>ID</dt><dd>{selected.id}</dd></div><div><dt>Ação vinculada</dt><dd>{selected.actionId}</dd></div><div><dt>Data</dt><dd>{selected.uploadedAt}</dd></div><div><dt>Enviado por</dt><dd>{selected.uploadedBy}</dd></div><div className="detail-wide"><dt>Observações</dt><dd>{selected.note}</dd></div>
              </dl>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setSelected(null)}>Fechar</button><button className="primary-button" type="button" onClick={() => downloadEvidence(selected)}><Download size={16} /> Baixar arquivo</button></div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
