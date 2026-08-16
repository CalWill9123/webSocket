# Backend Reference Sheet

Node.js and Express — the server side of Vault's `backend/`. MongoDB/Mongoose-specific content lives in `Mongoose.md`; general JS/web concepts are in `CS.md`.

**The big idea:** In the earlier FSO curriculum (json-server), the backend was fake. Here you build the real one yourself.

```
React (axios) ──► Your Express server ──► returns data
```

Run two terminals:
- `npm run dev` — React frontend (port 5173)
- `npm run dev:server` — Express backend (port 3001)

---

## 1. Raw Node.js HTTP Server
**What it is:** The built-in Node.js way to create a server. No install needed. FSO shows this first so you understand what Express wraps.

```js
import http from 'http'

const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(data))
})

app.listen(3001)
console.log('Server running on port 3001')
```

---

## 2. nodemon
**What it is:** Auto-restarts the server when you save `index.js`. Without it you'd restart manually every time.

```
npm run dev:server
```

---

## 3. Express Setup
**What it is:** A library that makes routing clean. Always put `express.json()` before your routes.

```js
import express from 'express'
import cors from 'cors'

const app = express()     // creates the app — everything hangs off this
app.use(cors())           // allows requests from other ports/domains
app.use(express.json())   // parses request body so request.body works

// routes go here

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

- `const app = express()` — creates your Express app, required for everything else
- `app.use(cors())` — without this the browser blocks cross-origin requests
- `app.use(express.json())` — without this `request.body` is undefined

---

## 4. Express Router — Splitting Routes into Files
**What it is:** Instead of writing every route directly on `app` in `index.js`, related routes can live in their own file using `express.Router()`. That router is then "mounted" onto the main app at a path prefix — every route inside it automatically gets that prefix.

```js
// routes/auth.js
import express from 'express'
const router = express.Router()

router.post('/register', (request, response) => { /* ... */ })
router.post('/login', (request, response) => { /* ... */ })

export default router
```

```js
// index.js
import auth from './routes/auth.js'
app.use('/api/auth', auth)   // mounts the router — /register becomes /api/auth/register
```

Mounting needs **both** arguments — the path prefix and the router object itself. Leave out the router and Express has a path with nothing to run there.

---

## 5. Creating a Server — Boilerplate
**What it is:** The minimum `index.js` to get a bare Express server running. No database yet — that's §6, kept separate on purpose.

```js
// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()                     // create the app — everything hangs off this
app.use(cors())                            // allow the frontend (different port) to call this server
app.use(express.json())                    // parse JSON bodies — MUST come before any routes, or req.body is undefined

// routes get mounted here — see §7

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

That's a complete, runnable server — it just has nowhere to store data yet.

---

## 6. Connecting to MongoDB
**What it is:** Wiring the server from §5 up to a real database. Add this to the same `index.js`, after the middleware, before `app.listen`.

```js
// index.js — add these two lines
import mongoose from 'mongoose'

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.error('error connecting to MongoDB:', err.message))
```

`MONGODB_URI` comes from your `.env` file (§19) — never hardcode it. This can happen any time before your routes actually try to read/write data; it doesn't have to be the very first line. See `Mongoose.md` for schemas, models, and the actual Mongoose query methods once you're connected.

---

## 7. CRUD Route Methods — All Four, Grouped
**What it is:** A full router file with GET/POST/PUT/DELETE side by side, so you can see the whole CRUD shape at once instead of piecing it together from separate examples.

```js
// routes/whatever.js
import express from 'express'
const router = express.Router()

router.use(authMiddleware)   // optional — protects every route below, delete if this resource is public

router.get('/', async (req, res) => {                    // READ — all
  const docs = await Model.find({ user: req.user.id })
  res.json(docs)
})

router.post('/', async (req, res) => {                   // CREATE
  const { field1, field2 } = req.body
  const saved = await new Model({ field1, field2, user: req.user.id }).save()
  res.status(201).json(saved)
})

router.put('/:id', async (req, res) => {                 // UPDATE
  const { field1, field2 } = req.body
  const updated = await Model.findByIdAndUpdate(req.params.id, { field1, field2 }, { new: true })
  res.status(200).json(updated)
})

router.delete('/:id', async (req, res) => {               // DELETE
  await Model.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

export default router
```

```js
// index.js — mount it, needs BOTH the prefix and the router itself (§4)
import whateverRouter from './routes/whatever.js'
app.use('/api/whatever', whateverRouter)
```

**Two things that silently break, not loudly:** `express.json()` (§5) registered *after* your routes → `req.body` is `undefined`, no error thrown. Router built but never `app.use()`'d → every route on it 404s like it doesn't exist, because to Express it doesn't.

Test new routes with Postman (§14)/`curl` directly before wiring the frontend to them — confirms the route itself works before stacking an unverified frontend call on top of an unverified route.

---

## 8. REST Endpoints
**What REST actually is:** REST (**RE**presentational **S**tate **T**ransfer) is an architectural style for designing APIs — a set of conventions, not a strict protocol. Three core ideas:
- **Client-server:** frontend and backend are separate pieces that only talk over HTTP — neither needs to know how the other is built internally.
- **Stateless:** every request carries everything the server needs to handle it (e.g. a JWT in the header) — the server doesn't remember anything about your previous requests.
- **Resources, not actions:** URLs name *things* (`/api/items`, `/api/items/:id`), not verbs. The *action* you're taking comes from the HTTP method (GET/POST/PUT/DELETE), never from the URL itself — `/api/items/delete/3` is not RESTful, `DELETE /api/items/3` is.

**In practice, that convention looks like:** structuring URLs and HTTP methods so each method has one job.

| Method | Job             | Example              |
|--------|-----------------|----------------------|
| GET    | Fetch data      | GET /api/items       |
| POST   | Create item     | POST /api/items      |
| PUT    | Update item     | PUT /api/items/:id   |
| DELETE | Remove item     | DELETE /api/items/:id |

```js
app.get('/api/items', (request, response) => {
  response.json(items)
})

app.get('/api/items/:id', (request, response) => {
  const item = items.find(i => i.id === request.params.id)
  item ? response.json(item) : response.status(404).end()
})

app.delete('/api/items/:id', (request, response) => {
  items = items.filter(i => i.id !== request.params.id)
  response.status(204).end()
})
```

---

## 9. request.params vs request.body
**What it is:** Two places incoming data can come from.

```js
// params — from the URL: DELETE /api/items/3
request.params.id  // "3"

// body — data sent with the request: axios.post('/api/items', { name: 'thing' })
request.body.name  // "thing"
```

GET and DELETE use `params`. POST and PUT use `body`.

---

## 10. generateId
**What it is:** Finds the highest existing id and adds 1. Always returns a string to stay consistent with your data.

```js
const generateId = () => {
  const maxId = items.length > 0
    ? Math.max(...items.map(i => Number(i.id)))
    : 0
  return String(maxId + 1)
}
```

---

## 11. Validating the Request Body
**What it is:** Check that required fields exist before saving. The `return` stops the function immediately after the 400.

```js
app.post('/api/items', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  const item = {
    name: body.name,
    active: body.active || false,
    id: generateId(),
  }

  items = [...items, item]
  response.json(item)
})
```

---

## 12. Middleware Boilerplate
**What it is:** A function that runs *between* the request arriving and your route handler running — checks something, then either lets the request continue (`next()`) or cuts it off early (sends a response, no `next()`). `express.json()` and `cors()` are middleware someone else wrote; `authMiddleware` is one you wrote yourself.

**The shape every middleware function has, always the same three params:**

```js
const someMiddleware = (req, res, next) => {
  // check something about the request
  // either:
  next()                                    // pass control to the next thing (route, or next middleware)
  // or:
  res.status(...).json({ error: '...' })    // stop here — don't call next()
}
```

**The actual one you built — `middleware/auth.js`, verifies a JWT before letting a request through:**

```js
// middleware/auth.js
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]   // pull token out of "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)   // throws if invalid/missing
    req.user = decoded                                          // attach the decoded user to req
    next()                                                       // valid — let the route run
  } catch {
    res.status(401).json({ error: 'invalid credentials' })      // invalid — stop here
  }
}

export default authMiddleware
```

**Two ways to apply it, depending on scope:**

```js
// whole file — every route below this line requires a valid token
router.use(authMiddleware)

// one route only — everything else in the file stays public
router.post('/', authMiddleware, async (req, res) => { ... })
```

**Built-in middleware you're already using, same `(req, res, next)` shape under the hood, just pre-written:**

```js
app.use(cors())           // allows requests from other ports/origins
app.use(express.json())   // parses the request body into req.body
```

**Order matters — middleware runs top to bottom, in registration order.** `express.json()` has to be registered before any route that reads `req.body`, or it'll be `undefined`. `authMiddleware` has to run before the route it's protecting, which is exactly what `router.use(authMiddleware)` placed above your routes achieves.

---

## 13. HTTP Status Codes — In Practice
**What it is:** Sending the status codes from `CS.md` §4 inside real Express routes.

```js
response.status(404).end()
response.status(400).json({ error: 'field missing' })
```

Most common in your routes: `200`/`201` on success, `400` for bad input, `404` for a missing id, `204` for a delete with nothing to send back.

---

## 14. Postman — Testing Routes
**What it is:** A tool to send HTTP requests to your backend without needing the frontend.

**GET all:**
- Method: `GET` — URL: `http://localhost:3001/api/items` — Send

**POST new item:**
- Method: `POST` — URL: `http://localhost:3001/api/items`
- Body → raw → JSON
```json
{ "name": "Item Name", "active": false }
```

**DELETE:**
- Method: `DELETE` — URL: `http://localhost:3001/api/items/1` — Send (expect 204)

---

## 15. Vite Proxy
**What it is:** Forwards `/api` requests from the frontend to the backend in development. Avoids CORS errors.

```js
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

This is why `server.js` uses `/api/items` not `http://localhost:3001/api/items`.

---

## 16. Serving the Frontend from Express (Production)
**What it is:** In production there's no Vite, no proxy. Express serves everything — the React app AND the API. You build the frontend into a `dist` folder and tell Express to serve it as static files.

```js
// index.js — add these imports at the top
import { fileURLToPath } from 'url'
import path from 'path'

// add this after middleware, before routes
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, 'dist')))
```

---

## 17. Dev vs Production
**What it is:** The two environments your app runs in and how they differ.

| | Development | Production |
|---|---|---|
| Frontend | Vite on port 5173 | Built into `dist/` |
| Backend | Express on port 3001 | Express on one port |
| Proxy | Vite proxy forwards `/api` | Not needed — same server |
| Command | `npm run dev` + `npm run dev:server` | `npm start` |

---

## 18. Deploying to Fly.io
**What it is:** Hosting your app on the internet so anyone can visit it.

**Steps:**
```
# 1. install flyctl (Mac)
brew install flyctl

# 2. login
fly auth login

# 3. build the frontend first
npm run build

# 4. set up fly config (do once)
fly launch

# 5. deploy
fly deploy
```

**After any change:**
```
npm run build
fly deploy
```

**Important — listen on 0.0.0.0 for deployment:**
Fly.io requires your server to accept connections from outside, not just localhost.
```js
app.listen(PORT, '0.0.0.0')  // required for Fly.io — without this you get a 502
```

**Set environment variables on Fly:**
```
fly secrets set MONGODB_URI="your-connection-string"
```

---

## 19. .env File & process.env
**Why it's needed:** Your code goes to GitHub, and GitHub is public. If you hardcode your MongoDB password or JWT secret directly in your code, anyone can read it and own your database. The `.env` file keeps secrets off GitHub entirely — it never gets committed.

Think of it like this: your code is a recipe that says "add the secret ingredient." The `.env` file is a locked box only the server can open. Someone stealing the recipe still doesn't know the ingredient.

**What it is:** A file that stores sensitive values like passwords and API keys. `process.env` is how Node reads those values inside your code.

```
# .env — local only, never commit this file
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=somesupersecretkey
PORT=3001
```

```
# .gitignore — add this line so Git never touches it
.env
```

```js
// index.js — import at the top, then read with process.env
import 'dotenv/config'

mongoose.connect(process.env.MONGODB_URI)
jwt.sign({ id: user._id }, process.env.JWT_SECRET)
```

In production (Fly.io, Render), you set these as server "secrets" instead of a `.env` file — same idea, different delivery.

*(See `CS.md` §9 for the general "why secrets never go in code" concept — this entry is the Node-specific mechanics.)*

---

## 20. Password Hashing with bcrypt
**What it is:** You never store a plain-text password. bcrypt scrambles it into a one-way hash before saving. On login, bcrypt compares the input against the stored hash — it can't "un-hash", it just checks if they match.

```js
// hashing — do this before saving a new user
const passwordHash = await bcrypt.hash(password, 10)  // 10 = salt rounds

// comparing — do this on login
const match = await bcrypt.compare(plainTextPassword, storedHash)  // true or false
```

Never store `password` — always store `passwordHash`.

---

## 21. JWT (JSON Web Tokens)
**What it is:** A signed token you hand to the user after a successful login. The frontend stores it and sends it with every future request to prove who they are. You sign it with a secret key — anyone can read the payload, but only your server can create a valid signature.

```js
// signing — after verifying login credentials
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

// verifying — in middleware to protect routes
const decoded = jwt.verify(token, process.env.JWT_SECRET)
// decoded.id is the user's _id
```

Store `JWT_SECRET` in `.env` — never hardcode it.

---

## 22. Auth Route Pattern (Register & Login)
**What it is:** The two routes every auth system needs. Register saves a new user with a hashed password. Login finds the user, checks the password, and returns a JWT. Always use the same error message for wrong email AND wrong password — never reveal which one failed.

```js
// register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ name, email, password: passwordHash })
  const savedUser = await user.save()
  res.status(201).json(savedUser)
})

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'invalid credentials' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token })
})
```

---

## 23. Protected CRUD Routes (Transactions Pattern)
**What it is:** Routes that require a logged-in user. `router.use(authMiddleware)` protects every route in the file at once. User identity comes from `req.user.id` (set by the middleware) — never from `req.body`, or users could fake ownership.

```js
router.use(authMiddleware)  // protects all routes below this line

// GET — fetch only this user's transactions
router.get('/', async (req, res) => {
  Transaction.find({ user: req.user.id }).then(transactions => res.json(transactions))
})

// POST — create a transaction, stamp it with the logged-in user's id
router.post('/', async (req, res) => {
  const { amount, type, category, description, date } = req.body
  const transaction = new Transaction({ amount, type, category, description, date, user: req.user.id })
  const savedTransaction = await transaction.save()
  res.status(201).json(savedTransaction)
})

// PUT — update by id, needs 3 arguments: id, new data, options
router.put('/:id', async (req, res) => {
  const { amount, type, category, description, date } = req.body
  const updated = await Transaction.findByIdAndUpdate(
    req.params.id,
    { amount, type, category, description, date },
    { new: true }
  )
  res.status(200).json(updated)
})

// DELETE — remove by id
router.delete('/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id)
  res.status(204).end()
})
```

`user: req.user.id` is what links each transaction to the logged-in user — the same `ref: 'User'` you set up in the Transaction schema (`Mongoose.md` §4).

**`findByIdAndUpdate` takes 3 arguments, not 1:** `(id, newData, options)`. By default Mongoose returns the *old* document, so `{ new: true }` is required as the 3rd argument to get the *updated* one back instead.

---

## 24. Attaching `ws` to Your Express Server
**What it is:** §1 showed Node's raw `http.createServer` before Express hid it from you. `app.listen(PORT)` (§5) is actually doing that same `http.createServer` internally, then immediately listening on it — but it never hands you a reference to that server object. That's fine for plain Express, but the `ws` library needs a direct reference to the underlying `http.Server` so it can attach itself to the *same* port instead of opening a second one. So instead of letting `app.listen()` create that server invisibly, you create it yourself and pass `app` into it.

```js
import http from 'http'
import express from 'express'

const app = express()
// ...app.use(...) middleware, routes, all exactly as before...

const server = http.createServer(app)   // same server app.listen() would've made — just named, so ws can use it too

// server.listen(...) replaces app.listen(...) at the bottom of the file —
// same arguments, just called on `server` instead of `app`
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`))
```

`app` itself doesn't change — it still handles every normal HTTP route exactly like before. `server` is just the explicit handle that both Express *and* `ws` can share.

---

## 25. WebSocketServer — `connection` and `message` Events
**What it is:** The `ws` library's `WebSocketServer` attaches to the `http.Server` from §24 and starts listening for the WebSocket handshake. From there, two event names matter:

- **`'connection'`** — fires once per client, the moment that client's WebSocket handshake completes. The callback receives that one client's socket (conventionally named `socket` or `ws`, not to be confused with the `ws` *package*).
- **`'message'`** — fires on that individual client's socket every time *that client* sends data. This is where incoming chat messages arrive, one client at a time — it does not fire for every client's socket at once.

```js
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ server })   // server = the http.Server from §24, not `app`

wss.on('connection', (socket) => {
  console.log('a client connected')

  socket.on('message', (data) => {
    console.log('received:', data.toString())   // data arrives as a Buffer — .toString() to read it
  })
})
```

**What this does NOT do yet:** nothing here sends anything back to anyone. `socket.send(...)` (on any client's socket, not just the sender's) is how the server pushes data out — but deciding *which* sockets to call `.send()` on (just this one? every client in the same room?) is a separate step, once basic connect/receive is proven working. Don't reach for broadcasting until you've confirmed messages are arriving here first — smaller step (`CS.md` §38).
