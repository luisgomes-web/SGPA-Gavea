import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'

mkdirSync('data', { recursive: true })

export const db = new Database('data/sgpa.db')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const initialActions = [
  ['P35-001', 'Implantação de cancelas e catracas', 'Segurança Patrimonial', 'Wamberto', 'Rodrigo Santos', '2026-08-01', '2026-08-15', 'Em andamento', 'Crítica', 65],
  ['P35-002', 'Implantação de portaria blindada', 'Infraestrutura', 'Wamberto', 'Rodrigo Santos', '2026-08-01', '2026-08-20', 'Em andamento', 'Média', 40],
  ['P35-003', 'Reforço da iluminação no cais', 'Elétrica', 'Arthur', 'Rodrigo Santos', '2026-07-28', '2026-08-08', 'Atrasada', 'Alta', 55],
  ['P35-004', 'Instalação de câmeras de monitoramento', 'CFTV', 'Nathalia', 'Rodrigo Santos', '2026-07-30', '2026-08-10', 'Em andamento', 'Alta', 72],
  ['P35-005', 'Controle de acesso ao portaló', 'Operação', 'Bernardo Kuo', 'Rodrigo Santos', '2026-07-25', '2026-08-05', 'Concluída', 'Crítica', 100],
  ['P35-006', 'Revisão dos procedimentos de ronda', 'Segurança Patrimonial', 'Wamberto', 'Rodrigo Santos', '2026-08-02', '2026-08-22', 'Não iniciada', 'Média', 0],
  ['P35-007', 'Aprimoramento do sistema de iluminação', 'Elétrica', 'Arthur', 'Rodrigo Santos', '2026-07-31', '2026-08-12', 'Em andamento', 'Alta', 35],
  ['P35-008', 'Sinalização das áreas restritas', 'SMS', 'Bernardo Kuo', 'Rodrigo Santos', '2026-07-20', '2026-08-02', 'Concluída', 'Baixa', 100],
  ['P35-009', 'Implantar rotinas internas de segurança', 'Segurança Patrimonial', 'Wamberto', 'Rodrigo Santos', '2026-08-03', '2026-08-18', 'Em andamento', 'Média', 25],
  ['P35-010', 'Adequação da área de armazenamento temporário', 'Resíduos', 'Letícia', 'Rodrigo Santos', '2026-08-01', '2026-08-25', 'Não iniciada', 'Média', 0],
]

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      client TEXT,
      status TEXT NOT NULL DEFAULT 'Ativo',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      area TEXT,
      owner TEXT,
      manager TEXT,
      opened_at TEXT,
      deadline TEXT,
      status TEXT NOT NULL DEFAULT 'Não iniciada',
      criticality TEXT NOT NULL DEFAULT 'Média',
      progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, code),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_item_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      storage_path TEXT,
      notes TEXT,
      uploaded_by TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(action_item_id) REFERENCES action_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      actor TEXT,
      payload TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)

  let project = db.prepare('SELECT id FROM projects WHERE code = ?').get('P35')
  if (!project) {
    const result = db.prepare('INSERT INTO projects (code, name, client) VALUES (?, ?, ?)').run('P35', 'Plano de Ação P-35', 'Petrobras')
    project = { id: Number(result.lastInsertRowid) }
  }

  const actionCount = db.prepare('SELECT COUNT(*) AS total FROM action_items WHERE project_id = ?').get(project.id).total
  if (actionCount === 0) {
    const insert = db.prepare(`
      INSERT INTO action_items
      (project_id, code, title, area, owner, manager, opened_at, deadline, status, criticality, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const seed = db.transaction(() => {
      for (const action of initialActions) insert.run(project.id, ...action)
    })
    seed()
  }
}
