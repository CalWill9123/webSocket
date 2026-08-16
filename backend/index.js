import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import http from 'http'
import {WebSocketServer} from 'ws'
const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting to MongoDB:', error.message))

  const server = http.createServer(app)

  const wss = new WebSocketServer({server})

  wss.on('connection',(socket) => {
    console.log('connection secured')

    socket.on('message',(data)=>{
      console.log('data received',data.toString())
    })
  })


const PORT = process.env.PORT || 4001
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
