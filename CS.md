# CS Reference Sheet

General, transferable knowledge — web fundamentals, core JS language features, and SWE concepts that apply regardless of framework or job. Not tied to React or Express specifically; see `Frontend.md`, `Backend.md`, and `Mongoose.md` for those.

---

## 1. What is MERN?
**What it is:** The stack Vault is built on — four technologies, one per letter. Say "I built a MERN app" in an interview and this is what you mean.

| Letter | Tech | Job | Where in Vault |
|---|---|---|---|
| M | **M**ongoDB | Stores your data permanently | `models/User.js`, `models/Transaction.js` |
| E | **E**xpress | Server framework — routes, middleware | `routes/`, `middleware/`, `index.js` |
| R | **R**eact | What the user sees and clicks | `src/pages/`, `src/components/` |
| N | **N**ode.js | Runs JavaScript outside the browser, on the server | Everything in `backend/` runs on it |

One thread ties it together: React (in the browser) → axios call → Express route (on Node) → Mongoose → MongoDB, and the response travels back the same path in reverse.

---

## 2. How the Web Works (the Request/Response Cycle)
A browser (or any client) sends a **request** to a server. The server sends back a **response**. True everywhere — Express, Django, Rails, any backend.

```
Client → HTTP Request → Server → HTTP Response → Client
```

Every time you visit a URL, load an image, or submit a form — that's a request/response cycle.

A request has: method (GET/POST/etc), path, optional body, optional headers (like Authorization). A response has: status code, optional body.

---

## 2b. WebSockets — When Request/Response Isn't Enough
**What it is:** §2's request/response cycle has a built-in assumption: the **client always speaks first**. The server can only ever reply to something it was asked. That's fine for "load this page" or "save this transaction" — but it breaks down for "tell me the instant someone else sends a message," because the server has no way to start that conversation.

A **WebSocket** fixes this by upgrading a single HTTP connection into something that stays open, instead of closing right after one response. Once that handshake happens, either side — client OR server — can send data at any time, with no new request needed first.

```
HTTP (§2):        Client → request  → Server
                   Client ← response ← Server        (connection closes)

WebSocket:         Client ⇄ Server                    (connection stays open)
                    either side can send, any time, no request required first
```

**The two fake-real-time alternatives this replaces, and why they're worse:**
- **Polling** — client asks "anything new?" every N seconds, whether or not there's anything. Wastes requests, and there's always up to N seconds of lag.
- **Long-polling** — client asks, server holds the request open until something happens, then responds — and the client immediately asks again. Better lag, but still built on request/response underneath, just stretched out.

A WebSocket isn't a trick on top of HTTP — it's a genuinely different connection type the server can push through unprompted. That's the one new concept this project exists to build hands-on experience with.

---

## 3. HTTP Methods
How you tell the server what you want to do.

| Method | Meaning         |
|--------|-----------------|
| GET    | Fetch data      |
| POST   | Send/create data|
| PUT    | Update data     |
| DELETE | Remove data     |

---

## 4. Status Codes
Numbers the server sends back to tell you what happened.

| Code | Meaning       |
|------|---------------|
| 200  | OK            |
| 201  | Created       |
| 204  | No Content    |
| 400  | Bad Request   |
| 401  | Unauthorized  |
| 403  | Forbidden     |
| 404  | Not Found     |
| 500  | Server Error  |

---

## 5. Frontend vs Backend
Two separate sides of every web app.

| | Frontend | Backend |
|---|---|---|
| What | What the user sees | Server logic and data |
| Language | HTML, CSS, JavaScript | Node.js, Python, etc. |
| Runs in | Browser | Server |
| Your tools | React, Vite | Express, MongoDB |

---

## 6. DNS & URLs
A URL is just a human-readable address that points to a server IP.

```
https://moviewatchbycal.fly.dev/api/movies
  │        │                      │
protocol  domain               path/route
```

- **Protocol** — `https` means encrypted, `http` means not
- **Domain** — the address of the server
- **Path** — which route on that server to hit

---

## 7. Ports
Your computer has thousands of ports — each one is a separate door a service can listen on.

| Port | Common use            |
|------|-----------------------|
| 80   | HTTP (web)            |
| 443  | HTTPS (secure web)    |
| 3001 | Your Express server   |
| 5173 | Vite dev server       |
| 27017| MongoDB               |

In production you use port 80/443 (standard web ports). In dev you use custom ports like 3001.

---

## 8. localhost vs 0.0.0.0
- **localhost / 127.0.0.1** — only accepts connections from your own machine
- **0.0.0.0** — accepts connections from anywhere (required for deployment)

```js
app.listen(PORT, '0.0.0.0')  // use this for deployment
```

---

## 9. Environment Variables & Secrets Management
Values that change between environments (dev vs production). Never hardcode secrets.

```
# .env — local only, never commit
MONGODB_URI=mongodb+srv://...
API_KEY=abc123
PORT=3001
```

```js
process.env.MONGODB_URI   // read it in your code
process.env.API_KEY
process.env.PORT
```

On hosting platforms (Fly.io, Render) you set these as "secrets" instead of a `.env` file.

**The transferable rule (every job, not just Vault):** if it would be bad for a stranger to read it, it goes in `.env` — never in code that reaches GitHub. Database credentials, cloud API keys, third-party tokens — same rule every time.

*(See `Backend.md` §19 for the Node-specific mechanics of actually wiring `.env`/`process.env` into `index.js`.)*

---

## 10. Git Basics
Version control — tracks every change you make to your code.

```
git init                   // start tracking a project
git add filename           // stage a file
git add .                  // stage all changes
git commit -m "message"    // save a snapshot
git push                   // send to GitHub
git pull                   // get latest from GitHub
```

---

## 11. .gitignore
Tells Git which files to never track. Always ignore these:

```
node_modules    // huge, reinstalled with npm install
.env            // contains your passwords
dist            // built files, regenerated with npm run build
```

---

## 12. Import / Export
**What it is:** How files share code with each other. You must explicitly export and import everything.

```js
// default export — one per file
export default ComponentName
import ComponentName from './ComponentName'

// named export — can have multiple
export const myFunc = () => {}
import { myFunc } from './myFile'
```

---

## 13. Template Literals
**What it is:** Strings with embedded variables. Use backticks, not quotes.

```js
const name = 'value'
console.log(`Label: ${name}`)
window.alert(`${name} already exists`)
```

---

## 14. Ternary Operator
**What it is:** A one-line if/else that returns a value.

```js
// condition ? if true : if false
const label = isActive ? 'Active' : 'Inactive'
```

---

## 15. Optional Chaining (?.)
**What it is:** Safely access nested properties. Returns `undefined` instead of crashing if something is null.

```js
item?.genre?.toLowerCase()
```

---

## 16. Nullish Coalescing (??)
**What it is:** Fallback value only when something is `null` or `undefined`. Unlike `||`, won't override `0` or `false`.

```js
const rating = item.rating ?? 'No rating'
```

---

## 17. Object Shorthand
**What it is:** When the variable name matches the key name, you can skip the repetition.

```js
const title = 'Inception'
const rating = 9

const movie = { title, rating }   // same as { title: title, rating: rating }
```

---

## 18. Spread Operator
**What it is:** Copies arrays or objects. Use to add items or merge without mutating.

```js
const newArray = [...items, newItem]
const updated = { ...item, watched: true }
```

---

## 19. Array Methods
**What it is:** Built-in methods for working with arrays beyond map and filter.

```js
items.find(i => i.id === '3')          // first match or undefined
items.some(i => i.active)              // true if ANY match
items.every(i => i.active)             // true if ALL match
items.reduce((sum, i) => sum + i.rating, 0)  // collapse to single value
```

---

## 20. async/await
**What it is:** Cleaner syntax for promises. Same as `.then()` but easier to read.

```js
const fetchItems = async () => {
  try {
    const data = await itemService.getAll()
    setItems(data)
  } catch (error) {
    console.error('Failed:', error)
  }
}
```

---

## 21. try/catch (Error Handling)
**What it is:** Wraps code that might throw an error. If it throws, the `catch` block runs instead of crashing the app. Not the same as `if/else` — use it specifically when a function is designed to throw on failure rather than return false.

```js
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)  // throws if invalid
  req.user = decoded
  next()
} catch {
  res.status(401).json({ error: 'invalid credentials' })
}
```

`if/else` handles expected conditions (true/false). `try/catch` handles code that can crash.

**The gotcha that actually bit you once: `try/catch` only catches errors from code it directly `await`s — not errors buried inside a separate `.then()` chain.** If a `.then()` chain is sitting inside a `try` block but isn't itself `await`ed, the `try` finishes (and moves on) before the `.then()` chain has even resolved — so if that chain later fails, the `catch` block is already long gone and can never run it. This is exactly what happened in the transactions GET route: an old `.then()` chain got wrapped in a new `try/await`, but the `.then()` itself was never `await`ed — so the `catch` looked like it was protecting the route, but was actually dead code.

```js
// BROKEN — catch never actually runs, because the .then() chain isn't awaited
try {
  Transaction.find({ user: req.user.id }).then(transactions => res.json(transactions))
} catch (err) {
  res.status(500).json({ error: err.message })   // unreachable
}

// FIXED — pick one style and commit to it. Either await the promise directly...
try {
  const transactions = await Transaction.find({ user: req.user.id })
  res.json(transactions)
} catch (err) {
  res.status(500).json({ error: err.message })
}

// ...or stay in .then()/.catch() the whole way, no try/catch at all
Transaction.find({ user: req.user.id })
  .then(transactions => res.json(transactions))
  .catch(err => res.status(500).json({ error: err.message }))
```

**The rule to check yourself against:** never mix `await` and `.then()` on the same call, and never leave a `.then()` chain un-awaited inside a `try` block expecting the `catch` to cover it. Pick `async/await` + `try/catch`, or `.then()` + `.catch()` — not both at once on the same operation.

---

## 22. Destructuring
**What it is:** Pull values out of objects or arrays into their own variables.

```js
const { title, rating } = movie
const [items, setItems] = useState([])
const Component = ({ title, rating }) => { ... }
```

---

## 23. console.log Debugging
**What it is:** Quick tricks to make debugging faster and clearer.

```js
console.log('items:', items)                    // label it
console.log(JSON.stringify(item, null, 2))      // full object structure
console.log({ title, rating, watched })         // multiple values at once
```

---

## 24. The Frontend↔Backend Contract
**What it is:** The frontend and backend aren't magically linked — they just both agree, separately, on the same shape of data. Nothing enforces this at write-time; if they drift apart, it fails silently instead of loudly.

```js
// backend/routes/auth.js — the route reads exactly these three keys off req.body
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  ...
})
```

```js
// frontend — the form has to send exactly those three keys, spelled the same way
authService.register({ name, email, password })
```

If the frontend sent `{ username, email, password }` instead — one field misnamed — `req.body.name` would just be `undefined` on the backend. No crash, no error. The user gets saved with a missing name and nobody's told. This is why `Login.jsx` sends `{email, password}` and `Register.jsx` sends `{name, email, password}` — they're not "the same form," they're two separate contracts, each matching its own backend route's `req.body` destructuring exactly. **Watch for this again with `transactionService.js`** — whatever shape `TransactionForm.jsx` sends has to match what `routes/transactions.js`'s POST route destructures, field for field.

---

## 25. Hashing vs Encryption
**What it is:** Two ways to protect data — not the same thing.

| | Hashing | Encryption |
|---|---|---|
| Reversible? | No | Yes (with a key) |
| Use case | Passwords | Data you need to read back |
| Example | bcrypt | HTTPS, file encryption |

Hashing is better for passwords — even if someone steals your database, they can't reverse a hash. Never store plaintext passwords. Always hash them.

---

## 26. Stateless vs Stateful Authentication
**What it is:** Two ways to handle "is this user logged in?"

| | Stateful (sessions) | Stateless (JWT) |
|---|---|---|
| Server stores session? | Yes | No |
| Scales easily? | Harder | Yes |
| What Vault uses | — | ✅ |

Stateless means the server hands you a signed token after login. You send it with every request and the server just verifies the signature — no database lookup needed.

---

## 27. Enumeration Attack Prevention
**What it is:** Never tell an attacker which specific field failed on login. Always return the same error for wrong email AND wrong password.

```js
// correct — attacker learns nothing
res.status(401).json({ error: 'invalid credentials' })

// wrong — attacker can map which emails are registered
res.status(401).json({ error: 'email not found' })
```

If you say "email not found," an attacker can cycle through emails and build a list of valid accounts.

---

## 28. Separation of Concerns
**What it is:** Each file should have one job. If a file is doing two things, it's a sign it should be split. Makes bugs easier to find and code easier to explain in interviews.

| File | Job |
|---|---|
| `models/` | Define data shape |
| `routes/` | Handle requests |
| `middleware/` | Run checks before routes |
| `index.js` | Wire everything together |

---

## 29. How to Read an Error Message
**What it is:** Error messages tell you exactly what went wrong — most beginners skip past them. Read them like a sentence.

```
TypeError: Cannot read properties of null (reading 'password')
```

Break it down:
- **TypeError** — the category of error
- **Cannot read properties of null** — you tried to access something on a null value
- **(reading 'password')** — specifically the `password` field

Then ask: *where in my code would something be null that I'm calling `.password` on?* — that's your bug.

**Always read the line number** in the stack trace. It points directly to where things went wrong.

---

## 30. Debugging Systematically
**What it is:** A process for finding bugs without panicking. Guessing randomly wastes time — narrow it down.

1. **Read the error message** — what does it actually say?
2. **Find the line number** — go there first
3. **Add a console.log before the crash** — what does the data actually look like at that point?
4. **Check your assumptions** — "I thought this was a string" → log it and confirm
5. **Change one thing at a time** — if you change three things at once, you won't know what fixed it

Most bugs come from: wrong variable name, wrong data shape, something being null/undefined when you expected a value.

---

## 31. Tracing a Request End-to-End
**What it is:** The technique for the specific fear of "I don't actually understand how this whole app fits together" — not a comprehension problem, a working-memory one. You can understand every individual file perfectly and still lose the thread the moment you try to hold *all* of them in your head simultaneously. The fix isn't more explaining — it's picking one real user action and narrating its path through the code **one link at a time**, out loud or in writing, only moving to the next link once the current one is nailed down.

**The path, as a checklist you can reuse for any feature:**
1. **The trigger** — what does the user actually do? (click a button, submit a form)
2. **The component-level handler** — what function runs first, in what file?
3. **The service call** — what function from `services/` does the handler call, and with what arguments?
4. **The network hop** — `axios` sends this over HTTP to some URL. What method, what URL?
5. **The backend route** — which file, which `router.METHOD(...)` matches that URL?
6. **Middleware, if any** — does this route run through `authMiddleware` first? What does it check?
7. **The database operation** — what Mongoose call actually touches MongoDB?
8. **The response** — what does the route send back, and with what status code?
9. **Back on the frontend** — what does the service function's `.then()` receive? What does it do with it?
10. **The re-render** — what state actually updates, and which component re-renders because of it?

You don't have to get every link right on the first guess — the value is in narrating each one specifically enough that a wrong guess is easy to correct, instead of staying vague enough that nothing can be checked. "Data goes to the backend" isn't link 3, 4, and 5 answered — it's all three skipped at once. Naming the exact function each time is what turns "I'm lost" into "here's exactly where I lost the thread," which is a much smaller, much more fixable problem.

**This worked, concretely, on 2026-08-13** tracing `TransactionForm`'s add-transaction flow — the first vague pass skipped straight from "form" to "backend," but slowing down to one link at a time produced an accurate, unassisted trace across three files. Come back to this exact checklist next time the whole-app-at-once fear shows up, on any feature.

---

## 32. How to Google an Error
**What it is:** Googling effectively is a real skill. Bad searches return nothing useful.

**Remove project-specific parts** from the error:
```
// bad search — too specific to your code
"foundUser.password undefined vault app express"

// good search — the actual error pattern
"cannot read properties of null reading password express"
```

Add the technology name: `express`, `mongoose`, `react`, `jwt`

If Stack Overflow doesn't help, search the **official docs** — MDN for JS, Mongoose docs for MongoDB, Express docs for routing.

---

## 33. CRUD — The Four Operations
**What it is:** Every database-driven app does some combination of these four things. If you understand CRUD, you understand 80% of what backends do.

| Letter | Operation | HTTP Method | Mongoose |
|---|---|---|---|
| C | Create | POST | `new Model().save()` |
| R | Read | GET | `Model.find()` |
| U | Update | PUT | `Model.findByIdAndUpdate()` |
| D | Delete | DELETE | `Model.findByIdAndDelete()` |

Vault's transaction routes are CRUD. So is every todo app, every social media feed, every e-commerce site.

---

## 34. Thinking in Inputs and Outputs
**What it is:** When you don't know how to write a function, ignore the code and just ask: *what goes in, what comes out?*

Example — POST /api/transactions:
- **Input:** amount, type, category, description, date (from req.body) + user id (from req.user)
- **Output:** the saved transaction object, status 201

Once you know that, the code is just filling in the middle. This works for any function at any level.

---

## 35. Working Backwards
**What it is:** When you're stuck, start from what you *want* to end up with and trace backwards to what you need.

Example — you want `res.json({ token })`:
- To have a `token` → you need `jwt.sign(...)`
- To call `jwt.sign` → you need the user's `_id`
- To have the user's `_id` → you need to find the user first
- To find the user → you need their email from `req.body`

Now you have your steps in order. Write them top to bottom.

---

## 36. The Principle of Least Privilege
**What it is:** Only give code (or users) the minimum access they need to do their job. A real security principle used everywhere.

Examples in Vault:
- Transactions route only gets the user's own transactions — not everyone's
- `req.user.id` comes from the verified JWT — not from `req.body` where users could fake it
- `.env` keeps secrets off GitHub — the app only reads what it needs at runtime

In interviews: "I applied least privilege by scoping transactions to the authenticated user via middleware rather than trusting client-supplied user ids."

---

## 37. Precision vs Comprehension Errors
**What it is:** Two completely different types of mistakes. Knowing which one you made tells you how to fix it.

**Comprehension error** — you don't understand the concept. Fix: re-read, ask for an explanation, look it up.

**Precision error** — you understand the concept but made a small execution mistake. Fix: slow down, re-read your own code line by line.

Examples of precision errors:
- Missing `const` before a variable
- Wrong parameter name (`res` vs `response`)
- `export default` placed too early
- Calling `.then()` and `await` on the same line

Most bugs while learning are precision errors, not comprehension errors. That distinction matters — it means you're further along than you think.

---

## 38. Think Smaller
**What it is:** When a problem feels overwhelming, you're probably trying to solve too much at once. The fix is always to shrink the problem until it's something you can actually hold in your head.

**The rule:** If you can't explain what the next line of code should do, the step is still too big.

Break it down until each step is one sentence:
```
// too big — "write the login route"

// just right:
// 1. pull email and password from req.body
// 2. find the user by email
// 3. if no user, return 401
// 4. compare passwords
// 5. if no match, return 401
// 6. sign a token
// 7. send the token back
```

Now write step 1. Don't think about step 2 yet.

---

## 39. Git Branching & Pull Requests
**What it is:** Solo, committing straight to `main` is fine. On any real team, it isn't — everyone works on a separate **branch** so `main` always stays deployable.

```
git checkout -b feature/add-register-page   // branch off main
// make your commits here
git push -u origin feature/add-register-page
```

Then you open a **pull request (PR)** — a request for someone to review your branch's changes before they get merged into `main`. A reviewer reads the diff, comments, you push fixes, then it merges. This is the actual day-to-day workflow at almost every SWE job — "just push to main" doesn't scale past one person.

---

## 40. The Event Loop — Why async/await Doesn't Block
**What it is:** JavaScript runs on a single thread — it can only do one thing at a time. So when you `await` a database call or an axios request, how does the rest of the app keep responding?

The **event loop** is the mechanism: slow operations (network calls, timers, file reads) get handed off to the runtime (Node/browser), and your JS code moves on immediately. When that operation finishes, its `.then()`/callback gets queued and run *later*, in between other work — not blocking anything in the meantime.

```js
console.log('1')
setTimeout(() => console.log('2'), 0)   // queued for later, even with 0ms delay
console.log('3')
// logs: 1, 3, 2 — not 1, 2, 3
```

This is why your `authService.login()` call doesn't freeze the page while it waits for the server — the request goes off, the event loop keeps the UI responsive, and your `.then()` runs once the response comes back.

---

## 41. Big O Notation — The Basics
**What it is:** A way to describe how an algorithm's runtime grows as the input grows. Common interview topic, and useful for spotting slow code in your own projects.

| Notation | Name | Example |
|---|---|---|
| O(1) | Constant | Reading `arr[0]` |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | `.find()`, `.filter()`, a `for` loop over an array |
| O(n²) | Quadratic | A loop inside a loop over the same data |

You don't need to calculate it precisely day to day — the useful habit is noticing **loops inside loops over the same data** (that's usually O(n²) and a sign there might be a faster way) versus a single pass (O(n), usually fine).

---

## 42. Technical Debt
**What it is:** Shortcuts taken to ship faster now, at the cost of harder-to-maintain code later — like a financial loan, it has to get "paid back" eventually (refactored) or it keeps accumulating interest (more bugs, slower changes).

Not inherently bad — sometimes shipping now and cleaning up later is the right call. The problem is debt that's never acknowledged or repaid. In interviews, being able to say "we took on debt here to hit a deadline, and here's what paying it down would've looked like" reads as senior judgment, not a confession.

---

## 43. DRY vs. Premature Abstraction (Rule of Three)
**What it is:** "Don't Repeat Yourself" is real, but applying it too early creates the opposite problem — an abstraction built around a guess at future needs that doesn't actually fit when those needs arrive.

**The Rule of Three:** don't abstract something out until you've written it **three** separate times. Two similar-looking pieces of code might just be a coincidence; a third occurrence is a real pattern worth extracting into a shared function/component.

Building `TransactionForm` and `TransactionList` separately even though they'll share some logic is fine at first — the shared piece becomes obvious once you're staring at actual duplication, not before.

---

## 44. Idempotency
**What it is:** An operation is **idempotent** if doing it once and doing it five times leave the system in the same state. This matters because networks are unreliable — a client might retry a request that actually succeeded but whose response got lost.

| Method | Idempotent? | Why |
|---|---|---|
| GET | Yes | Reading data doesn't change anything |
| PUT | Yes | "Set this field to X" — repeating it is harmless |
| DELETE | Yes | Already deleted → deleting again is still "gone" |
| POST | **No** | Retrying a POST can create a duplicate (e.g. two identical transactions) |

This is part of *why* REST (`Backend.md` §8) assigns POST specifically to "create" — it's the one method callers have to be careful about retrying.

**When you're stuck:** Don't stare at the whole file. Pick the smallest possible next thing and do only that. The rest will follow.
