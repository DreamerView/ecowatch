import express from 'express'
import db from '../db.js'

const router = express.Router()

// ==========================
// 📥 GET все районы
// ==========================
router.get('/', async (req, res) => {
  await db.read()
  res.json(db.data || [])
})

// ==========================
// ➕ POST добавить
// ==========================
router.post('/', async (req, res) => {
  const area = req.body

  await db.read()

  db.data ||= []

  const newArea = {
    id: Date.now(),
    name: area.name || '',
    lat: Number(area.lat) || 0,
    lan: Number(area.lan) || 0,
    factors_air: Number(area.factors_air) || 0,
    factors_noise: Number(area.factors_noise) || 0,
    factors_traffic: Number(area.factors_traffic) || 0,
    factors_greenZones: Number(area.factors_greenZones) || 0
  }

  db.data.push(newArea)

  await db.write()

  res.json({ ok: true, data: newArea })
})

// ==========================
// ✏️ PUT обновить
// ==========================
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const payload = req.body

  await db.read()

  const index = db.data.findIndex(a => a.id === id)

  if (index === -1) {
    return res.status(404).json({ ok: false, error: 'not_found' })
  }

  db.data[index] = {
    ...db.data[index],
    ...payload,
    id // защита id
  }

  await db.write()

  res.json({ ok: true, data: db.data[index] })
})

// ==========================
// 🗑 DELETE удалить
// ==========================
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await db.read()

  const exists = db.data.some(a => a.id === id)

  if (!exists) {
    return res.status(404).json({ ok: false, error: 'not_found' })
  }

  db.data = db.data.filter(a => a.id !== id)

  await db.write()

  res.json({ ok: true })
})

export default router