import express from 'express'
import cors from 'cors'
import { db, initializeDatabase } from './db.js'

initializeDatabase()

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'] }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SGPA API', database: 'SQLite' })
})

app.get('/api/projects', (_req, res) => {
  res.json(db.prepare('SELECT * FROM projects ORDER BY name').all())
})

app.get('/api/actions', (req, res) => {
  const projectCode = String(req.query.project || 'P35')
  const rows = db.prepare(`
    SELECT a.*, p.code AS project_code,
      (SELECT COUNT(*) FROM evidences e WHERE e.action_item_id = a.id) AS evidence_count
    FROM action_items a
    JOIN projects p ON p.id = a.project_id
    WHERE p.code = ?
    ORDER BY a.code
  `).all(projectCode)
  res.json(rows)
})

app.post('/api/actions', (req, res) => {
  const body = req.body ?? {}
  const projectCode = body.projectCode || 'P35'
  const project = db.prepare('SELECT id FROM projects WHERE code = ?').get(projectCode)
  if (!project) return res.status(400).json({ error: 'Projeto não encontrado.' })
  if (!body.code || !body.title) return res.status(400).json({ error: 'Código e título são obrigatórios.' })

  try {
    const result = db.prepare(`
      INSERT INTO action_items
      (project_id, code, title, area, owner, manager, opened_at, deadline, status, criticality, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      project.id, body.code, body.title, body.area || '', body.owner || '', body.manager || '',
      body.openedAt || null, body.deadline || null, body.status || 'Não iniciada',
      body.criticality || 'Média', Number(body.progress || 0)
    )
    const row = db.prepare(`SELECT a.*, 0 AS evidence_count FROM action_items a WHERE id = ?`).get(result.lastInsertRowid)
    db.prepare('INSERT INTO audit_log (entity_type, entity_id, action, actor, payload) VALUES (?, ?, ?, ?, ?)')
      .run('action_item', row.id, 'CREATE', body.actor || 'Sistema', JSON.stringify(row))
    res.status(201).json(row)
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'Já existe uma ação com esse código no projeto.' })
    console.error(error)
    res.status(500).json({ error: 'Não foi possível criar a ação.' })
  }
})

app.put('/api/actions/:id', (req, res) => {
  const id = Number(req.params.id)
  const current = db.prepare('SELECT * FROM action_items WHERE id = ?').get(id)
  if (!current) return res.status(404).json({ error: 'Ação não encontrada.' })
  const body = req.body ?? {}

  try {
    db.prepare(`
      UPDATE action_items SET code=?, title=?, area=?, owner=?, manager=?, opened_at=?, deadline=?, status=?, criticality=?, progress=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      body.code ?? current.code, body.title ?? current.title, body.area ?? current.area,
      body.owner ?? current.owner, body.manager ?? current.manager, body.openedAt ?? current.opened_at,
      body.deadline ?? current.deadline, body.status ?? current.status, body.criticality ?? current.criticality,
      Number(body.progress ?? current.progress), id
    )
    const updated = db.prepare(`SELECT a.*, (SELECT COUNT(*) FROM evidences e WHERE e.action_item_id = a.id) AS evidence_count FROM action_items a WHERE id = ?`).get(id)
    db.prepare('INSERT INTO audit_log (entity_type, entity_id, action, actor, payload) VALUES (?, ?, ?, ?, ?)')
      .run('action_item', id, 'UPDATE', body.actor || 'Sistema', JSON.stringify({ before: current, after: updated }))
    res.json(updated)
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'Já existe uma ação com esse código no projeto.' })
    console.error(error)
    res.status(500).json({ error: 'Não foi possível atualizar a ação.' })
  }
})

app.delete('/api/actions/:id', (req, res) => {
  const id = Number(req.params.id)
  const current = db.prepare('SELECT * FROM action_items WHERE id = ?').get(id)
  if (!current) return res.status(404).json({ error: 'Ação não encontrada.' })
  db.prepare('DELETE FROM action_items WHERE id = ?').run(id)
  db.prepare('INSERT INTO audit_log (entity_type, entity_id, action, actor, payload) VALUES (?, ?, ?, ?, ?)')
    .run('action_item', id, 'DELETE', req.body?.actor || 'Sistema', JSON.stringify(current))
  res.status(204).end()
})

app.get('/api/metrics', (req, res) => {
  const projectCode = String(req.query.project || 'P35')
  const metrics = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN a.status = 'Concluída' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN a.status = 'Atrasada' THEN 1 ELSE 0 END) AS delayed,
      SUM(CASE WHEN a.criticality = 'Crítica' THEN 1 ELSE 0 END) AS critical,
      COALESCE(ROUND(AVG(a.progress), 1), 0) AS average_progress
    FROM action_items a
    JOIN projects p ON p.id = a.project_id
    WHERE p.code = ?
  `).get(projectCode)
  res.json(metrics)
})

app.listen(port, () => {
  console.log(`SGPA API disponível em http://localhost:${port}`)
})
