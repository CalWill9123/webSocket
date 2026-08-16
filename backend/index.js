import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting to MongoDB:', error.message))

// TODO: wire up the ws WebSocket server here — this is the new part

const PORT = process.env.PORT || 4001
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
