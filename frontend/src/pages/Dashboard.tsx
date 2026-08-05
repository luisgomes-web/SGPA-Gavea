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
import {
  criticalityData,
  disciplineData,
  kpis,
  statusData,
  upcomingActions,
} from '../data/dashboard'

const kpiIcons = [ClipboardList, CheckCircle2, Clock3, AlertTriangle, Flag]
const pieColors = ['#18b7c8', '#f2b84b', '#607484']
const criticalityColors = ['#ef5f67', '#f59e42', '#f2c94c', '#45b97c']

export function Dashboard() {
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
          </div>
        </div>
        <div className="hero-progress">
          <span>Conclusão geral</span>
          <strong>20%</strong>
          <div className="progress-track"><span style={{ width: '20%' }} /></div>
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
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>
                  {statusData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index]} />)}
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
              <BarChart data={criticalityData} margin={{ top: 12, right: 8, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#29404d" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#8aa0ad" tickLine={false} axisLine={false} />
                <YAxis stroke="#8aa0ad" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#14303d' }} contentStyle={{ background: '#102634', border: '1px solid #294554', borderRadius: 10 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {criticalityData.map((entry, index) => <Cell key={entry.name} fill={criticalityColors[index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel discipline-panel">
          <div className="panel-header"><div><p className="eyebrow">ÁREAS</p><h3>Ações por disciplina</h3></div></div>
          <div className="discipline-list">
            {disciplineData.map((item) => (
              <div className="discipline-row" key={item.name}>
                <div><span>{item.name}</span><strong>{item.value}</strong></div>
                <div className="progress-track"><span style={{ width: `${item.value * 28}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel actions-panel">
          <div className="panel-header">
            <div><p className="eyebrow">AGENDA OPERACIONAL</p><h3>Próximos vencimentos</h3></div>
            <button className="text-button" type="button">Ver plano completo</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Criticidade</th><th>Status</th></tr></thead>
              <tbody>
                {upcomingActions.map((action) => (
                  <tr key={action.id}>
                    <td className="action-id">{action.id}</td>
                    <td>{action.title}</td>
                    <td>{action.owner}</td>
                    <td>{action.deadline}</td>
                    <td><span className={`badge badge-${action.criticality.toLowerCase()}`}>{action.criticality}</span></td>
                    <td><span className="badge badge-progress">{action.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  )
}
