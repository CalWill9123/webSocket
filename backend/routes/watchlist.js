import express from 'express'
import Watchlist from '../models/Watchlist.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
router.use(authMiddleware)


router.get('/', async (req, res) => {                    // READ — the one watchlist for this user
  const doc = await Watchlist.findOne({ user: req.user.id })
  res.json(doc)
})

router.post('/', async (req, res) => {                   // CREATE (or add to the existing one)
  const { coinId, threshold } = req.body
  let watchlist = await Watchlist.findOne({ user: req.user.id })
  if (!watchlist) {
    watchlist = await new Watchlist({ user: req.user.id }).save()
  }
  let updated = watchlist
  if (coinId){
     updated = await Watchlist.findByIdAndUpdate(watchlist._id, {$push:{watched:{coinId,threshold}}},{new:true})
  }
  res.status(201).json(updated)
})

router.put('/:id', async (req, res) => {                 // UPDATE
  const { watched } = req.body
  const updated = await Watchlist.findByIdAndUpdate(req.params.id, { $set: { watched } }, { new: true })
  res.status(200).json(updated)
})


router.delete('/:id', async (req, res) => {               // DELETE
  const { coinId } = req.body
  const updated = await Watchlist.findByIdAndUpdate(req.params.id, { $pull: { watched: { coinId } } }, { new: true })
  res.status(200).json(updated)
})

export default router

