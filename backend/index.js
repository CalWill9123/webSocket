import express, { response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import http from 'http'
import {WebSocketServer} from 'ws'
import authRouter from './routes/auth.js'
import watchlistRouter from './routes/watchlist.js'
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/watchlist', watchlistRouter)
const apiKey = process.env.COINGECKO_API_KEY
const GET_INTERVAL = 45000
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting to MongoDB:', error.message))

  const server = http.createServer(app)

  const wss = new WebSocketServer({server})

  async function retrieveGeckoData () {
    
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,btc&include_24hr_change=true'
    try{
      const response = await fetch(url,{
        method:'GET',
        headers:{
          'x-cg-demo-api-key':apiKey,
          'accept':'application/json'
          
          
        }
        
      })

      if (!response.ok){
        throw new Error(`HTTP ERROR.${response.status} has occured.`)

      }
      const data = await response.json()
      console.log(data.bitcoin.btc)
      console.log(data.bitcoin.usd)

    }catch(error){
      console.error(`${error} has occurred`)
    }
      
    
  }
  

  wss.on('connection',(socket) => {
    console.log('connection secured')

    socket.on('message',(data)=>{
      console.log('data received',data.toString())
    })
  })
retrieveGeckoData()
  setInterval(retrieveGeckoData,GET_INTERVAL)

const PORT = process.env.PORT || 4001
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))