import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Paperclip,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ActionItem } from '../data/actions'
import { listActions } from '../services/actionsApi'
import { listEvidences, type EvidenceItem } from '../services/evidencesApi'
import { KpiCard } from '../components/KpiCard'

const statusColors: Record<string, string> = {
  'Concluída': '#18b7c8',
  'Em andamento': '#f2b84b',
  'Não iniciada': '#607484',
  'Atrasada': '#ef5f67',
}

const ownerColors = ['#18b7c8', '#45b97c', '#f2b84b', '#f59e42', '#9b7ad8', '#ef5f67']

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0
}

export function Indicators() {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [evidences, setEvidences] = useState<EvidenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [actionRows, evidenceRows] = await Promise.all([listActions(), listEvidences()])
        setActions(actionRows)
        setEvidences(evidenceRows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os indicadores.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const completed = actions.filter((item) => item.status === 'Concluída').length
  const delayed = actions.filter((item) => item.status === 'Atrasada').length
  const critical = actions.filter((item) => item.criticality === 'Crítica').length
  const averageProgress = actions.length
    ? Math.round(actions.reduce((sum, item) => sum + item.progress, 0) / actions.length)
    : 0
  const evidenceActions = new Set(evidences.map((item) => item.actionId)).size
  const evidenceCoverage = percent(evidenceActions, actions.length)

  const statusData = useMemo(() => {
    const order: ActionItem['status'][] = ['Concluída', 'Em andamento', 'Não iniciada', 'Atrasada']
    return order
      .map((name) => ({ name, value: actions.filter((item) => item.status === name).length }))
      .filter((item) => item.value > 0)
  }, [actions])

  const ownerData = useMemo(() => {
    const owners = new Map<string, { total: number; completed: number; delayed: number; progress: number }>()
    actions.forEach((item) => {
      const name = item.owner || 'Não definido'
      const current = owners.get(name) || { total: 0, completed: 0, delayed: 0, progress: 0 }
      current.total += 1
      current.completed += item.status === 'Concluída' ? 1 : 0
      current.delayed += item.status === 'Atrasada' ? 1 : 0
      current.progress += item.progress
      owners.set(name, current)
    })
    return Array.from(owners.entries())
      .map(([name, value]) => ({
        name,
        total: value.total,
        concluídas: value.completed,
        atrasadas: value.delayed,
        progresso: Math.round(value.progress / value.total),
      }))
      .sort((a, b) => b.total - a.total)
  }, [actions])

  const areaData = useMemo(() => {
    const areas = new Map<string, { total: number; progress: number }>()
    actions.forEach((item) => {
      const name = item.area || 'Não definida'
      const current = areas.get(name) || { total: 0, progress: 0 }
      current.total += 1
      current.progress += item.progress
      areas.set(name, current)
    })
    return Array.from(areas.entries())
      .map(([name, value]) => ({ name, total: value.total, progresso: Math.round(value.progress / value.total) }))
      .sort((a, b) => b.total - a.total)
  }, [actions])

  const criticalActions = useMemo(() => actions
    .filter((item) => item.criticality === 'Crítica' || item.status === 'Atrasada')
    .sort((a, b) => {
      if (a.status === 'Atrasada' && b.status !== 'Atrasada') return -1
      if (b.status === 'Atrasada' && a.status !== 'Atrasada') return 1
      return a.deadline.localeCompare(b.deadline)
    })
    .slice(0, 6), [actions])

  const kpis = [
    { label: 'Conclusão', value: `${percent(completed, actions.length)}%`, helper: `${completed} de ${actions.length} ações`, tone: 'green' as const, icon: CheckCircle2 },
    { label: 'Progresso médio', value: `${averageProgress}%`, helper: 'Média consolidada do projeto', tone: 'blue' as const, icon: Gauge },
    { label: 'Atrasadas', value: delayed, helper: `${percent(delayed, actions.length)}% do plano`, tone: 'red' as const, icon: AlertTriangle },
    { label: 'Cobertura de evidências', value: `${evidenceCoverage}%`, helper: `${evidenceActions} ações documentadas`, tone: 'violet' as const, icon: Paperclip },
    { label: 'Criticidade alta', value: critical, helper: 'Ações críticas no banco', tone: 'amber' as const, icon: ClipboardCheck },
  ]

  if (loading) return <div className="empty-state">Carregando indicadores do banco...</div>

  return (
    <section className="action-plan-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BUSINESS INTELLIGENCE • PROJETO P-35</p>
          <h2>Central de Indicadores</h2>
          <p>Leitura gerencial em tempo real a partir das ações e evidências registradas no SGPA.</p>
        </div>
        <span className="trend-positive"><TrendingUp size={15} /> SQLite + API online</span>
      </div>

      {error && <div className="empty-state">{error}</div>}

      <section className="kpi-grid" aria-label="Indicadores gerenciais">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header"><div><p className="eyebrow">STATUS</p><h3>Distribuição do plano</h3></div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>
                  {statusData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name] || '#607484'} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#102634', border: '1px solid #294554', borderRadius: 10 }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header"><div><p className="eyebrow">PESSOAS</p><h3>Carga por responsável</h3></div><Users size={18} /></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ownerData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#29404d" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#8aa0ad" tickLine={false} axisLine={false} />
                <YAxis stroke="#8aa0ad" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#14303d' }} contentStyle={{ background: '#102634', border: '1px solid #294554', borderRadius: 10 }} />
                <Bar dataKey="total" name="Ações" radius={[8, 8, 0, 0]}>
                  {ownerData.map((entry, index) => <Cell key={entry.name} fill={ownerColors[index % ownerColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel discipline-panel">
          <div className="panel-header"><div><p className="eyebrow">DISCIPLINAS</p><h3>Progresso por área</h3></div></div>
          <div className="discipline-list">
            {areaData.map((item) => (
              <div className="discipline-row" key={item.name}>
                <div><span>{item.name}</span><strong>{item.progresso}%</strong></div>
                <div className="progress-track"><span style={{ width: `${item.progresso}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel actions-panel">
          <div className="panel-header"><div><p className="eyebrow">FOCO GERENCIAL</p><h3>Ações críticas e atrasadas</h3></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Criticidade</th><th>Status</th></tr></thead>
              <tbody>
                {criticalActions.map((action) => (
                  <tr key={action.id}>
                    <td className="action-id">{action.id}</td>
                    <td>{action.title}</td>
                    <td>{action.owner}</td>
                    <td>{action.deadline}</td>
                    <td><span className={`badge badge-${action.criticality.toLowerCase()}`}>{action.criticality}</span></td>
                    <td><span className={`badge status-${action.status.toLowerCase().replaceAll(' ', '-').replaceAll('í', 'i')}`}>{action.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!criticalActions.length && <div className="empty-state">Nenhuma ação crítica ou atrasada registrada.</div>}
          </div>
        </article>
      </section>
    </section>
  )
}
