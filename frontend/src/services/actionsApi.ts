import type { ActionItem } from '../data/actions'

const API_URL = 'http://localhost:3001/api'

type ApiAction = {
  id: number
  code: string
  title: string
  area: string | null
  owner: string | null
  manager: string | null
  opened_at: string | null
  deadline: string | null
  status: ActionItem['status']
  criticality: ActionItem['criticality']
  progress: number
  evidence_count?: number
}

function toUiAction(row: ApiAction): ActionItem {
  return {
    dbId: row.id,
    id: row.code,
    title: row.title,
    area: row.area || '',
    owner: row.owner || '',
    manager: row.manager || '',
    openedAt: row.opened_at || '',
    deadline: row.deadline || '',
    status: row.status,
    criticality: row.criticality,
    progress: Number(row.progress || 0),
    evidenceCount: Number(row.evidence_count || 0),
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Erro HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function listActions() {
  const rows = await request<ApiAction[]>('/actions?project=P35')
  return rows.map(toUiAction)
}

export async function createAction(action: ActionItem) {
  const row = await request<ApiAction>('/actions', {
    method: 'POST',
    body: JSON.stringify({
      projectCode: 'P35', code: action.id, title: action.title, area: action.area,
      owner: action.owner, manager: action.manager, openedAt: action.openedAt || null,
      deadline: action.deadline || null, status: action.status, criticality: action.criticality,
      progress: action.progress, actor: 'Luis Phillipe',
    }),
  })
  return toUiAction(row)
}

export async function updateAction(action: ActionItem) {
  if (!action.dbId) throw new Error('Ação sem identificador do banco.')
  const row = await request<ApiAction>(`/actions/${action.dbId}`, {
    method: 'PUT',
    body: JSON.stringify({
      code: action.id, title: action.title, area: action.area, owner: action.owner,
      manager: action.manager, openedAt: action.openedAt || null, deadline: action.deadline || null,
      status: action.status, criticality: action.criticality, progress: action.progress,
      actor: 'Luis Phillipe',
    }),
  })
  return toUiAction(row)
}

export async function deleteAction(action: ActionItem) {
  if (!action.dbId) throw new Error('Ação sem identificador do banco.')
  await request<void>(`/actions/${action.dbId}`, {
    method: 'DELETE',
    body: JSON.stringify({ actor: 'Luis Phillipe' }),
  })
}
