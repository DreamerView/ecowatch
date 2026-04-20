import express from 'express'
import areasRouter from './routes/areas.js'

const app = express()

app.use(express.json())

app.use('/api/areas', areasRouter)

app.listen(3000, () => {
  console.log('Server running on 3000')
})