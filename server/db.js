import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 👉 теперь путь всегда корректный
const file = path.join(__dirname, '../data/temirtau-areas.json')

console.log(file)

const adapter = new JSONFile(file)

const db = new Low(adapter, [])

await db.read()

console.log(db)

db.data ||= []

export default db