export const navigationItems = [
  'Dashboard',
  'Plano de Ação',
  'Evidências',
  'Indicadores',
  'Cronograma',
  'Riscos',
  'Relatórios',
  'Usuários',
  'Configurações',
] as const

export const kpis = [
  { label: 'Total de ações', value: 10, helper: 'Base consolidada P-35', tone: 'blue' },
  { label: 'Concluídas', value: 2, helper: '20% do total', tone: 'green' },
  { label: 'Em andamento', value: 7, helper: '70% do total', tone: 'amber' },
  { label: 'Críticas', value: 3, helper: '30% do total', tone: 'red' },
  { label: 'Vencem em 7 dias', value: 2, helper: 'Atenção imediata', tone: 'violet' },
] as const

export const statusData = [
  { name: 'Concluídas', value: 2 },
  { name: 'Em andamento', value: 7 },
  { name: 'Não iniciadas', value: 1 },
]

export const criticalityData = [
  { name: 'Crítica', value: 3 },
  { name: 'Alta', value: 3 },
  { name: 'Média', value: 3 },
  { name: 'Baixa', value: 1 },
]

export const disciplineData = [
  { name: 'Civil', value: 3 },
  { name: 'Mecânica', value: 2 },
  { name: 'Elétrica', value: 2 },
  { name: 'Instrumentação', value: 1 },
  { name: 'Outros', value: 2 },
]

export const upcomingActions = [
  { id: 'P35-001', title: 'Implantação de cancelas e catracas', owner: 'Wamberto', deadline: '15/08/2026', criticality: 'Crítica', status: 'Em andamento' },
  { id: 'P35-004', title: 'Instalação de câmeras de monitoramento', owner: 'Wamberto', deadline: '10/08/2026', criticality: 'Alta', status: 'Em andamento' },
  { id: 'P35-007', title: 'Aprimoramento do sistema de iluminação', owner: 'Wamberto', deadline: '12/08/2026', criticality: 'Alta', status: 'Em andamento' },
  { id: 'P35-002', title: 'Implantação de portaria blindada', owner: 'Wamberto', deadline: '20/08/2026', criticality: 'Média', status: 'Em andamento' },
  { id: 'P35-009', title: 'Implantar rotinas internas de segurança', owner: 'Wamberto', deadline: '18/08/2026', criticality: 'Média', status: 'Em andamento' },
]
