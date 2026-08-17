const API_URL = 'http://localhost:3001'

export type EvidenceItem = {
  id: number
  actionId: string
  actionTitle: string
  name: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string
  note: string
  url: string
  downloadUrl: string
}

type ApiEvidence = {
  id: number
  action_code: string
  action_title: string
  file_name: string
  file_type: string | null
  file_size: number | null
  notes: string | null
  uploaded_by: string | null
  created_at: string
  url: string
}

function toUiEvidence(row: ApiEvidence): EvidenceItem {
  return {
    id: row.id,
    actionId: row.action_code,
    actionTitle: row.action_title,
    name: row.file_name,
    mimeType: row.file_type || 'application/octet-stream',
    sizeBytes: Number(row.file_size || 0),
    uploadedAt: row.created_at,
    uploadedBy: row.uploaded_by || 'Sistema',
    note: row.notes || '',
    url: `${API_URL}${row.url}`,
    downloadUrl: `${API_URL}/api/evidences/${row.id}/download`,
  }
}

async function readError(response: Response) {
  const body = await response.json().catch(() => ({}))
  return body.error || `Erro HTTP ${response.status}`
}

export async function listEvidences() {
  const response = await fetch(`${API_URL}/api/evidences?project=P35`)
  if (!response.ok) throw new Error(await readError(response))
  const rows = await response.json() as ApiEvidence[]
  return rows.map(toUiEvidence)
}

export async function uploadEvidences(actionCode: string, notes: string, files: File[]) {
  const data = new FormData()
  data.append('projectCode', 'P35')
  data.append('actionCode', actionCode)
  data.append('notes', notes)
  data.append('uploadedBy', 'Luis Phillipe')
  files.forEach((file) => data.append('files', file))

  const response = await fetch(`${API_URL}/api/evidences`, { method: 'POST', body: data })
  if (!response.ok) throw new Error(await readError(response))
  const rows = await response.json() as ApiEvidence[]
  return rows.map(toUiEvidence)
}

export async function deleteEvidence(id: number) {
  const response = await fetch(`${API_URL}/api/evidences/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: 'Luis Phillipe' }),
  })
  if (!response.ok) throw new Error(await readError(response))
}
