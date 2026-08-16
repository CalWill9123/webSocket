# Mongoose Reference Sheet

MongoDB and Mongoose — schemas, models, and database-level operations. General Express/routing content is in `Backend.md`.

**The big idea:** Your data currently lives in a `let movies = []` array in `index.js`. Every time the server restarts, it resets. MongoDB is a database that stores data permanently so it survives restarts and deployments.

```
Before:   React → Express → array in memory (resets on restart)
After:    React → Express → MongoDB (persists forever)
```

---

## 1. mongoose.js — Practice Script
**What it is:** A standalone script for testing your MongoDB connection and saving documents. Not part of your main app — run it directly from the terminal to verify things work.

```js
import mongoose from 'mongoose'

if (process.argv.length < 3) {
  console.log('give a password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://<username>:${password}@cluster0.xxxxx.mongodb.net/?appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url, { family: 4 })

// define the shape of your data
const itemSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  watched: Boolean
})

// create a model — this becomes the collection in MongoDB
const Item = mongoose.model('Item', itemSchema)

// create and save one document
const item = new Item({
  title: 'The Conjuring',
  rating: 4,
  watched: true
})

item.save().then(() => {
  console.log('item saved')
  mongoose.connection.close()
})
```

**Run it:**
```
node mongoose.js yourpassword
```

---

## 2. Schema & Model
**What it is:** A schema defines the shape of your data. A model is what you use to create, read, update, and delete documents in MongoDB.

```js
// schema — defines what fields exist and their types
const itemSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  watched: Boolean
})

// model — gives you methods to interact with the database
// first arg = collection name (MongoDB pluralizes it automatically → 'items')
const Item = mongoose.model('Item', itemSchema)
```

---

## 3. Schema Field Options — enum
**What it is:** Restricts a field to one of a fixed set of values. Wrap the type in an object and add `enum` — if a save doesn't match one of the listed values, Mongoose blocks it with a validation error.

```js
type: { type: String, enum: ['income', 'expense'] }
```

---

## 4. Schema Field Options — ObjectId & ref (Relationships)
**What it is:** How one document points to another. `mongoose.Schema.Types.ObjectId` is the type of every document's `_id` — when a field holds a *different* document's id, you type it as `ObjectId` and add `ref` to say which model it points to. This is how Vault links a transaction to the user who owns it.

```js
// Transaction.js — this is exactly what you built
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

- `type: mongoose.Schema.Types.ObjectId` — this field stores an id, not a full document
- `ref: 'User'` — tells Mongoose *which* model that id belongs to (must match the string you passed to `mongoose.model('User', ...)`)

**Querying by a reference field:** `req.user.id` from your JWT is a string, but the `user` field in the database is stored as an `ObjectId`. Mongoose casts the string for you automatically, so this just works:

```js
Transaction.find({ user: req.user.id })   // string gets cast to ObjectId under the hood
```

**`.populate()` — the method you'll reach for next:** Right now `Transaction.find()` returns transactions with just the user's raw id (e.g. `"64abc..."`). If you ever need the actual user data (their name or email) attached to a transaction instead of just the id, `.populate()` swaps the id for the full referenced document:

```js
Transaction.find({ user: req.user.id }).populate('user')
// each transaction.user is now the full User document, not just its id
```

You don't need `.populate()` for Vault's current features (the frontend already knows who's logged in) — but it's the standard next step the moment you need related data from two collections in one response.

---

## 5. MongoDB Atlas Setup
**What it is:** The cloud-hosted MongoDB service. Your database lives here, not on your computer.

**Steps:**
1. Create account at mongodb.com
2. Create a free cluster
3. Database Access → create a user with a password
4. Network Access → allow access from anywhere (0.0.0.0/0)
5. Connect → get your connection string

**Connection string format:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

---

## 6. Connecting index.js to MongoDB
**What it is:** Replacing the hardcoded array in `index.js` with a real MongoDB connection. After this, data persists even when the server restarts.

```js
import mongoose from 'mongoose'
import 'dotenv/config'

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(error => console.error('error connecting:', error.message))
```

---

## 7. toJSON Transform
**What it is:** MongoDB stores documents with `_id` and `__v` fields. This transform cleans them up so your frontend receives a normal `id` instead.
Without this, your frontend gets `_id: "64abc..."` instead of `id: "64abc..."` and React won't match them correctly.

```js
movieSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()  // create id from _id
    delete returnedObject._id                           // remove _id
    delete returnedObject.__v                           // remove version field
  }
})
```

---

## 8. MongoDB Route Methods
**What it is:** Replace your old array operations with these MongoDB model methods. No more manual `generateId` — MongoDB handles IDs automatically.

```js
// GET all — find({}) means "find everything"
Movie.find({}).then(movies => response.json(movies))

// GET one by id
Movie.findById(request.params.id).then(movie => response.json(movie))

// POST — create and save a new document
const movie = new Movie({ title: body.title, rating: body.rating })
movie.save().then(savedMovie => response.json(savedMovie))

// DELETE
Movie.findByIdAndDelete(request.params.id).then(() => response.status(204).end())
```
