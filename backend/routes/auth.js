import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const router = express.Router()
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, email, password: passwordHash })
  const savedUser = await user.save()
  res.status(201).json(savedUser)
})

// login
router.post('/login', async (req, res) => {
  const { username,email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user) return res.status(401).json({ error: 'invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token })
})

export default router