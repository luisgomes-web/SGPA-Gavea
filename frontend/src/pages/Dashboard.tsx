import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Flag,
  MoreHorizontal,
  TrendingUp,
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
import { KpiCard } from '../components/KpiCard'
import type { ActionItem } from '../data/actions'
import { actionItems as fallbackActions } from '../data/actions'
import { listActions } from '../services/actionsApi'

const kpiIcons = [ClipboardList, CheckCircle2, Clock3, AlertTriangle, Flag]
const statusColors: Record<string, string> = {
  'Concluída': '#18b7c8',
  'Em andamento': '#f2b84b',
  'Não iniciada': '#607484',
  'Atrasada': '#ef5f67',
}
const criticalityColors: Record<string, string> = {
  'Crítica': '#ef5f67',
  'Alta': '#f59e42',
  'Média': '#f2c94c',
  'Baixa': '#45b97c',
}

function parseDate(value: string) {
  if (!value) return null
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value: string) {
  const date = parseDate(value)
  return date ? new Intl.DateTimeFormat('pt-BR').format(date) : '—'
}

export function Dashboard() {
  const [actions, setActions] = useState<ActionItem[]>(fallbackActions)
  const [isLoading, setIsLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    let mounted = true
    listActions()
      .then((rows) => {
        if (!mounted) return
        setActions(rows)
        setApiOnline(true)
      })
      .catch(() => {
        if (!mounted) return
        setApiOnline(false)
      })
      .finally(() => mounted && setIsLoading(false))
    return () => { mounted = false }
  }, [])

  const dashboard = useMemo(() => {
    const total = actions.length
    const completed = actions.filter((item) => item.status === 'Concluída').length
    const inProgress = actions.filter((item) => item.status === 'Em andamento').length
    const delayed = actions.filter((item) => item.status === 'Atrasada').length
    const critical = actions.filter((item) => item.criticality === 'Crítica').length
    const completion = total ? Math.round((completed / total) * 100) : 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDays = new Date(today)
    sevenDays.setDate(sevenDays.getDate() + 7)
    const dueSoon = actions.filter((item) => {
      if (item.status === 'Concluída') return false
      const deadline = parseDate(item.deadline)
      if (!deadline) return false
      deadline.setHours(0, 0, 0, 0)
      return deadline >= today && deadline <= sevenDays
    }).length

    const statusOrder: ActionItem['status'][] = ['Concluída', 'Em andamento', 'Não iniciada', 'Atrasada']
    const statusData = statusOrder
      .map((name) => ({ name, value: actions.filter((item) => item.status === name).length }))
      .filter((item) => item.value > 0)

    const criticalityOrder: ActionItem['criticality'][] = ['Crítica', 'Alta', 'Média', 'Baixa']
    const criticalityData = criticalityOrder.map((name) => ({
      name,
      value: actions.filter((item) => item.criticality === name).length,
    }))

    const disciplineMap = new Map<string, number>()
    actions.forEach((item) => {
      const area = item.area.trim() || 'Não informada'
      disciplineMap.set(area, (disciplineMap.get(area) || 0) + 1)
    })
    const disciplineData = [...disciplineMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
      .slice(0, 7)
    const maxDiscipline = Math.max(1, ...disciplineData.map((item) => item.value))

    const upcomingActions = [...actions]
      .filter((item) => item.status !== 'Concluída' && parseDate(item.deadline))
      .sort((a, b) => (parseDate(a.deadline)?.getTime() || 0) - (parseDate(b.deadline)?.getTime() || 0))
      .slice(0, 5)

    return {
      total,
      completed,
      inProgress,
      delayed,
      critical,
      completion,
      dueSoon,
      statusData,
      criticalityData,
      disciplineData,
      maxDiscipline,
      upcomingActions,
    }
  }, [actions])

  const kpis = [
    { label: 'Total de ações', value: dashboard.total, helper: apiOnline ? 'Dados do banco P-35' : 'Modo de contingência', tone: 'blue' as const },
    { label: 'Concluídas', value: dashboard.completed, helper: `${dashboard.completion}% do total`, tone: 'green' as const },
    { label: 'Em andamento', value: dashboard.inProgress, helper: `${dashboard.delayed} ação(ões) atrasada(s)`, tone: 'amber' as const },
    { label: 'Críticas', value: dashboard.critical, helper: 'Prioridade executiva', tone: 'red' as const },
    { label: 'Vencem em 7 dias', value: dashboard.dueSoon, helper: 'A partir de hoje', tone: 'violet' as const },
  ]

  return (
    <>
      <section className="hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">CENTRO DE COMANDO OPERACIONAL</p>
          <h2>Plano de Ação P-35</h2>
          <p>Visão executiva das ações, prazos, responsáveis, evidências e riscos do contrato.</p>
          <div className="hero-meta">
            <span><strong>Diretor:</strong> Diogo Salomão</span>
            <span><strong>Gerência:</strong> Rodrigo Santos</span>
            <span><strong>Coordenação:</strong> Bernardo Kuo</span>
            <span><strong>Fonte:</strong> {isLoading ? 'Sincronizando...' : apiOnline ? 'SQLite • API online' : 'Dados locais de contingência'}</span>
          </div>
        </div>
        <div className="hero-progress">
          <span>Conclusão geral</span>
          <strong>{dashboard.completion}%</strong>
          <div className="progress-track"><span style={{ width: `${dashboard.completion}%` }} /></div>
        </div>
      </section>

      <section className="kpi-grid" aria-label="Indicadores principais">
        {kpis.map((kpi, index) => <KpiCard key={kpi.label} {...kpi} icon={kpiIcons[index]} />)}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div><p className="eyebrow">DISTRIBUIÇÃO</p><h3>Ações por status</h3></div>
            <button className="icon-button" type="button"><MoreHorizontal size={20} /></button>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboard.statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>
                  {dashboard.statusData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#102634', border: '1px solid #294554', borderRadius: 10 }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <div><p className="eyebrow">PRIORIDADE</p><h3>Ações por criticidade</h3></div>
            <span className="trend-positive"><TrendingUp size={15} /> Foco executivo</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.criticalityData} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#29404d" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#8aa0ad" tickLine={false} axisLine={false} />
                <YAxis stroke="#8aa0ad" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#14303d' }} contentStyle={{ background: '#102634', border: '1px solid #294554', borderRadius: 10 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {dashboard.criticalityData.map((entry) => <Cell key={entry.name} fill={criticalityColors[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel discipline-panel">
          <div className="panel-header"><div><p className="eyebrow">ÁREAS</p><h3>Ações por disciplina</h3></div></div>
          <div className="discipline-list">
            {dashboard.disciplineData.map((item) => (
              <div className="discipline-row" key={item.name}>
                <div><span>{item.name}</span><strong>{item.value}</strong></div>
                <div className="progress-track"><span style={{ width: `${(item.value / dashboard.maxDiscipline) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel actions-panel">
          <div className="panel-header">
            <div><p className="eyebrow">AGENDA OPERACIONAL</p><h3>Próximos vencimentos</h3></div>
            <span className="result-count">Atualizado pelo banco de dados</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Criticidade</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard.upcomingActions.map((action) => (
                  <tr key={action.id}>
                    <td className="action-id">{action.id}</td>
                    <td>{action.title}</td>
                    <td>{action.owner}</td>
                    <td>{formatDate(action.deadline)}</td>
                    <td><span className={`badge badge-${action.criticality.toLowerCase()}`}>{action.criticality}</span></td>
                    <td><span className={`badge status-${action.status.toLowerCase().replaceAll(' ', '-').replaceAll('í', 'i').replaceAll('ã', 'a').replaceAll('ç', 'c')}`}>{action.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dashboard.upcomingActions.length === 0 && <div className="empty-state">Nenhum vencimento pendente encontrado.</div>}
          </div>
        </article>
      </section>
    </>
  )
}
