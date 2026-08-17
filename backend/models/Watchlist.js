import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
    watched:[{
        coinId: String,
        threshold: Number
    }]
})

const Watchlist = mongoose.model('Watchlist',WatchlistSchema)

export default Watchlist 