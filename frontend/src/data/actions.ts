export type ActionStatus = 'Não iniciada' | 'Em andamento' | 'Concluída' | 'Atrasada'
export type Criticality = 'Crítica' | 'Alta' | 'Média' | 'Baixa'

export type ActionItem = {
  dbId?: number
  id: string
  title: string
  area: string
  owner: string
  manager: string
  openedAt: string
  deadline: string
  status: ActionStatus
  criticality: Criticality
  progress: number
  evidenceCount: number
}

// Mantido como fallback visual enquanto a API inicializa.
export const actionItems: ActionItem[] = [
  { id: 'P35-001', title: 'Implantação de cancelas e catracas', area: 'Segurança Patrimonial', owner: 'Wamberto', manager: 'Rodrigo Santos', openedAt: '2026-08-01', deadline: '2026-08-15', status: 'Em andamento', criticality: 'Crítica', progress: 65, evidenceCount: 4 },
  { id: 'P35-002', title: 'Implantação de portaria blindada', area: 'Infraestrutura', owner: 'Wamberto', manager: 'Rodrigo Santos', openedAt: '2026-08-01', deadline: '2026-08-20', status: 'Em andamento', criticality: 'Média', progress: 40, evidenceCount: 2 },
  { id: 'P35-003', title: 'Reforço da iluminação no cais', area: 'Elétrica', owner: 'Arthur', manager: 'Rodrigo Santos', openedAt: '2026-07-28', deadline: '2026-08-08', status: 'Atrasada', criticality: 'Alta', progress: 55, evidenceCount: 1 },
  { id: 'P35-004', title: 'Instalação de câmeras de monitoramento', area: 'CFTV', owner: 'Nathalia', manager: 'Rodrigo Santos', openedAt: '2026-07-30', deadline: '2026-08-10', status: 'Em andamento', criticality: 'Alta', progress: 72, evidenceCount: 6 },
  { id: 'P35-005', title: 'Controle de acesso ao portaló', area: 'Operação', owner: 'Bernardo Kuo', manager: 'Rodrigo Santos', openedAt: '2026-07-25', deadline: '2026-08-05', status: 'Concluída', criticality: 'Crítica', progress: 100, evidenceCount: 8 },
  { id: 'P35-006', title: 'Revisão dos procedimentos de ronda', area: 'Segurança Patrimonial', owner: 'Wamberto', manager: 'Rodrigo Santos', openedAt: '2026-08-02', deadline: '2026-08-22', status: 'Não iniciada', criticality: 'Média', progress: 0, evidenceCount: 0 },
  { id: 'P35-007', title: 'Aprimoramento do sistema de iluminação', area: 'Elétrica', owner: 'Arthur', manager: 'Rodrigo Santos', openedAt: '2026-07-31', deadline: '2026-08-12', status: 'Em andamento', criticality: 'Alta', progress: 35, evidenceCount: 3 },
  { id: 'P35-008', title: 'Sinalização das áreas restritas', area: 'SMS', owner: 'Bernardo Kuo', manager: 'Rodrigo Santos', openedAt: '2026-07-20', deadline: '2026-08-02', status: 'Concluída', criticality: 'Baixa', progress: 100, evidenceCount: 5 },
  { id: 'P35-009', title: 'Implantar rotinas internas de segurança', area: 'Segurança Patrimonial', owner: 'Wamberto', manager: 'Rodrigo Santos', openedAt: '2026-08-03', deadline: '2026-08-18', status: 'Em andamento', criticality: 'Média', progress: 25, evidenceCount: 1 },
  { id: 'P35-010', title: 'Adequação da área de armazenamento temporário', area: 'Resíduos', owner: 'Letícia', manager: 'Rodrigo Santos', openedAt: '2026-08-01', deadline: '2026-08-25', status: 'Não iniciada', criticality: 'Média', progress: 0, evidenceCount: 0 },
]
