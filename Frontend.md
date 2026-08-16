# Frontend Reference Sheet

React, JSX, and the client-side patterns used in Vault's `frontend/`. General JS language features live in `CS.md`; backend/Express content is in `Backend.md`; MongoDB/Mongoose is in `Mongoose.md`.

---

## 1. Component Structure
**What it is:** A function that takes props and returns JSX. Every piece of UI is a component.

```js
const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div>
      <h1>{prop1}</h1>
      <p>{prop2}</p>
    </div>
  )
}

export default ComponentName
```

---

## 2. JSX Attributes vs. Content
**What it is:** Two completely different places to put data on a JSX tag, and only one of them is visible on screen.

```js
// attribute — configures the element, NEVER shows up visually
<li key={transaction._id}></li>

// content — sits between the tags, this is what actually renders
<li key={transaction._id}>{transaction.category}</li>
```

Attributes live *inside* the opening tag, before its closing `>` — things like `key`, `value`, `onChange`, `className`. They configure the element or hand it data to work with internally, but the browser never draws them as text. Anything you actually want a person to **see** has to go between the opening and closing tags, as plain text or a `{}` expression. Writing `<li category={transaction.category}></li>` is completely valid JSX — it just renders an empty, invisible bullet point, because `category` is doing nothing but sitting there as configuration nobody asked for.

---

## 3. Props
**What it is:** Data passed from parent to child. Child can read it, never change it. One direction only.

```js
// parent
<Component value={data} onAction={handlerFn} />

// child
const Component = ({ value, onAction }) => {
  return <div>{value}</div>
}
```

---

## 4. useState
**What it is:** Stores a value in the component. When updated, the component re-renders.

```js
import { useState } from 'react'

const [value, setValue] = useState('')       // string
const [items, setItems] = useState([])       // array
const [show, setShow] = useState(false)      // boolean
const [count, setCount] = useState(0)        // number
```

---

## 5. Controlled Input
**What it is:** An input whose value is controlled by React state. `value` and `onChange` must always be paired.

```js
const [input, setInput] = useState('')

<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Type here"
/>
```

---

## 6. Form Submission
**What it is:** Handling a form submit without the page reloading. Always call `e.preventDefault()` first.

```js
const handleSubmit = (e) => {
  e.preventDefault()
  // use your state values here
}

<form onSubmit={handleSubmit}>
  <button type="submit">Submit</button>
</form>
```

---

## 7. Event Handlers
**What it is:** Functions that run when the user does something. Pass a reference, never call it directly.

```js
// correct — runs on click
<button onClick={() => handleDelete(item.id)}>Delete</button>

// wrong — runs immediately on render
<button onClick={handleDelete(item.id)}>Delete</button>
```

---

## 8. Conditional Rendering
**What it is:** Showing or hiding UI based on a condition.

```js
// ternary — one thing OR another
{isWatched ? 'Watched' : 'Not watched'}

// && — only show if true
{errorMessage && <p>{errorMessage}</p>}
```

**Two rules that have actually caused real bugs, worth checking every time you write one of these:**

**1. A ternary needs BOTH sides, always.** `condition ? a` with no `: b` isn't valid — it'll throw. If you only want something to render sometimes and nothing otherwise, that's what `&&` is for, not a ternary missing its else.

```js
// broken — ternary with no else branch, not valid JS
{user ? <button onClick={logout}>Logout</button>}

// fix option 1 — finish the ternary
{user ? <button onClick={logout}>Logout</button> : null}

// fix option 2 — if there's really no "else" case, use && instead
{user && <button onClick={logout}>Logout</button>}
```

**2. When each branch needs MORE THAN ONE element, JSX still only allows one root per branch (and one root for the whole `return`).** Wrap each branch's multiple elements in a fragment `<>...</>` — and if the component's `return` itself has multiple top-level things (like a conditional block sitting next to something else), wrap the whole `return` in a fragment too.

```js
// the full pattern for "show a group of things in one state, a different group in the other"
return (
  <>
    {user ? (
      <>
        <Link to="/dashboard">Dashboard</Link>
        <button onClick={logout}>Logout</button>
      </>
    ) : (
      <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </>
    )}
  </>
)
```

Read it as three separate, stackable rules rather than one big pattern to memorize: *(a)* one root per `return`, *(b)* a ternary always has both sides, *(c)* more than one element on either side needs its own fragment wrapper. Check each one individually when something won't compile — usually only one of the three is actually broken, not all of them at once.

---

## 9. Rendering a List
**What it is:** Turning an array into JSX elements. Always use `key` with the item's id.

```js
{items.map(item =>
  <Component key={item.id} item={item} />
)}
```

---

## 10. Adding to an Array
**What it is:** Creating a new array with an item added. Never mutate state directly.

```js
setItems([...items, newItem])
```

---

## 11. Filtering an Array
**What it is:** Returning only items that match a condition.

```js
const visible = items.filter(item => showAll || item.active)

// toggle
setShowAll(!showAll)
```

---

## 12. Duplicate Check
**What it is:** Searching the array before adding to prevent duplicates.

```js
const duplicate = items.find(i => i.name.toLowerCase() === newName.toLowerCase())
if (duplicate) {
  window.alert(`${newName} already exists`)
  return
}
```

---

## 13. Service Module
**What it is:** A separate file that holds all axios calls. App.jsx never talks to the server directly.

```js
// services/itemService.js
import axios from 'axios'

const baseUrl = '/api/items'

const getAll = () => axios.get(baseUrl).then(res => res.data)
const create = (item) => axios.post(baseUrl, item).then(res => res.data)
const update = (id, item) => axios.put(`${baseUrl}/${id}`, item).then(res => res.data)
const remove = (id) => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
```

**Don't confuse this `create` with a MongoDB create.** This `create` just sends a POST request from the browser to your Express server — nothing touches the database here. The actual document only gets created later, on the server, inside the route handler that receives this POST (that's where `new Model().save()` happens — see `Mongoose.md` §8). Same word, two different layers: axios `create()` = "ask the server," Mongoose `.save()` = "server writes to the database."

---

## 14. useEffect + Service
**What it is:** Fetches data from the server once when the page loads. Empty array `[]` = run once only.

```js
import { useEffect } from 'react'

useEffect(() => {
  itemService
    .getAll()
    .then(data => setItems(data))
    .catch(error => console.error('Failed to load:', error))
}, [])
```

---

## 15. Error Handling
**What it is:** `.catch` runs if the server call fails. Always chain it so the app doesn't crash silently.

```js
itemService
  .create(newItem)
  .then(saved => setItems([...items, saved]))
  .catch(error => console.error('Failed:', error))
```

---

## 16. Deleting an Item
**What it is:** Handler lives in App.jsx where state is. Child just calls it with the id.

```js
// App.jsx
const handleDelete = (id) => {
  if (!window.confirm('Remove this item?')) return
  itemService
    .remove(id)
    .then(() => setItems(items.filter(i => i.id !== id)))
    .catch(error => console.error('Failed to delete:', error))
}
// pass down
<Component key={item.id} item={item} onDelete={handleDelete} />

// child button
<button onClick={() => onDelete(item.id)}>Delete</button>
```

---

## 17. Adding CSS
**What it is:** Two ways to style in React — CSS file with `className`, or inline styles as a JS object.

```js
// CSS file
import './App.css'
<div className="container">...</div>
```

```css
/* App.css */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

```js
// Inline style — camelCase, not kebab-case
<p style={{ color: 'red', borderRadius: '4px' }}>Error</p>
```

---

## 18. Notification Component
**What it is:** A reusable component for showing timed success/error messages. Returns null when there's nothing to show.

```js
// Notification.jsx
const Notification = ({ message, type }) => {
  if (message === null) return null
  return <div className={type === 'error' ? 'error' : 'success'}>{message}</div>
}

export default Notification
```

```css
.success { color: green; background: #e0ffe0; border: 2px solid green; padding: 10px; border-radius: 4px; }
.error   { color: red;   background: #ffe0e0; border: 2px solid red;   padding: 10px; border-radius: 4px; }
```

```js
// App.jsx
const [notification, setNotification] = useState(null)
const [notifType, setNotifType] = useState('success')

const notify = (message, type = 'success') => {
  setNotification(message)
  setNotifType(type)
  setTimeout(() => setNotification(null), 3000)
}

// in JSX
<Notification message={notification} type={notifType} />
```

---

## 19. React Context (createContext / useContext)
**What it is:** A way to share state across your whole app without passing props through every component. Instead of `App → Page → Component → DeepChild`, any component can just call `useAuth()` and get what it needs directly.

Three moving parts:

```js
// 1. create the context (the "channel")
const AuthContext = createContext()

// 2. Provider — wraps your app, holds the state, broadcasts it
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. custom hook — any component calls this to plug in
export const useAuth = () => useContext(AuthContext)
```

```js
// in main.jsx — wrap your whole app in the Provider
<AuthProvider>
  <App />
</AuthProvider>

// in any component — grab what you need
const { user, logout } = useAuth()
```

The `value` prop on `<AuthContext.Provider>` is what every consumer receives. Whatever you put in `value`, any component can pull out via `useAuth()`.

---

## 20. React Router — Routes & Pages
**What it is:** Maps different URL paths to different page components. Wrap the whole app once in `BrowserRouter`, then declare which component renders at which path with `Routes`/`Route`.

```js
// main.jsx — wrap the whole app once
import { BrowserRouter } from 'react-router-dom'

<BrowserRouter>
  <App />
</BrowserRouter>
```

```js
// App.jsx — map paths to pages
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
</Routes>
```

**Don't confuse this with your API layer.** `BrowserRouter` has nothing to do with `authService` or Express — it only connects React to the **browser's URL bar** (and back/forward history) so React Router knows what the current URL is and can change it without a full page reload. No network call happens here at all.

**A `Route` is declarative, not active.** It doesn't "navigate" anywhere itself — it's just a mapping: "if the URL is X, show component Y." It reacts to whatever the URL already is; it doesn't change it.

---

## 21. Link — Declarative Navigation
**What it is:** React Router's version of `<a href="...">`, for links the user clicks themselves (as opposed to `useNavigate`, §22, which redirects from inside your own code). Renders as a real `<a>` tag in the DOM, but swaps the page via React Router instead of triggering a full browser reload.

```js
import { Link } from 'react-router-dom'

<Link to="/login">Login</Link>
<Link to="/register">Register</Link>
```

**Use `to`, not `href`.** `href` still works technically (it's a real `<a>` under the hood), but it bypasses React Router and forces a full page reload — same problem `BrowserRouter` (§20) exists to avoid. `to` is the React Router-aware prop; always use it on `<Link>`.

**Pick `Link` vs `useNavigate` by what triggers the move.** User clicking something → `<Link to="...">`. Your own code deciding to redirect (after a form submits, after a check in `useEffect`) → `useNavigate()`.

---

## 22. useNavigate — Redirecting in Code
**What it is:** Sends the user to a different page from inside a function (e.g. after a successful login) instead of waiting for them to click a link.

```js
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/dashboard')   // call this after login succeeds
```

`useNavigate` only works inside a component that's rendered underneath `BrowserRouter` — that's why the wrap in §20 has to happen first.

**Not click-bound.** `navigate` is just a plain function — you call it from wherever your own code decides to (inside an `async` `handleSubmit` after `authService.login()` resolves, a `useEffect`, a timeout, whatever). The click-triggered, declarative version of this is `<Link to="/dashboard">` (§21) — not the same tool.

---

## 23. Lifting State Up (Callback Props)
**What it is:** When a child component needs to change data that lives in its parent, it can't just reach up and edit the parent's state directly — props only flow one way (§3). Instead, the parent passes a *function* down as a prop; the child calls that function, and the function (which lives in the parent, next to the real `setState`) does the actual updating.

```js
// parent — owns the state
const Dashboard = () => {
  const [transactions, setTransactions] = useState([])

  const handleAdd = (newTransaction) => {
    setTransactions([...transactions, newTransaction])
  }

  return <TransactionForm onAdd={handleAdd} />
}

// child — never touches state directly, just calls what it was given
const TransactionForm = ({ onAdd }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd({ amount, category })   // hands data back UP to the parent
  }
}
```

This is the pattern behind `Dashboard.jsx` coordinating `TransactionForm.jsx` and `TransactionList.jsx` — the parent is the single source of truth for the transactions array; the children just report events (`onAdd`, `onDelete`) and let the parent decide what to do about them.

---

## 24. Protected Routes (Route Guarding)
**What it is:** Right now, typing `/dashboard` directly into the URL bar works whether or not you're logged in — nothing checks. A protected route wraps a page and checks `useAuth()`'s `user` before rendering it: no user, redirect to `/login`; user exists, render the real page.

```js
// components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  return children
}

// App.jsx — wrap the route that needs protecting
<Route path="/dashboard" element={
  <ProtectedRoute><Dashboard /></ProtectedRoute>
} />
```

`<Navigate to="..." />` is the declarative cousin of `useNavigate()` (§22) — same redirect, but usable directly in JSX instead of inside a function.

---

## 25. Sending the JWT with Requests (Authorization Header)
**What it is:** The backend's `authMiddleware` (`Backend.md` §22) checks every protected request for `req.headers.authorization` — a login token has to actually be attached to each request, or the server sends back a 401. Nothing does this automatically; every service call that hits a protected route has to add the header itself.

```js
// services/transactionService.js
const getTransactions = (token) =>
  axios.get(baseURL, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data)
```

The `Bearer ` prefix has to match what the backend expects to split on (`req.headers.authorization?.split(' ')[1]` in `middleware/auth.js`) — that's why it's `Bearer ${token}`, not just the raw token. The token itself comes from `useAuth()`'s `user` (whatever `authService.login()` returned), so `Dashboard.jsx` will need to pass it into every `transactionService` call.

---

## 26. Persisting State to localStorage
**What it is:** React state (`useState`) resets to its initial value every time the component tree remounts — which includes a full page refresh. A valid JWT sitting in memory doesn't survive that, so without extra work, refreshing the page logs the user out even though their token is still good. `localStorage` is a browser-provided key/value store that *does* survive refreshes (and even closing the tab) — only cleared by `logout()`, `localStorage.clear()`, or the user manually clearing site data.

Three raw methods, all string-only — objects need `JSON.stringify`/`JSON.parse` on the way in/out:
```js
localStorage.setItem('key', JSON.stringify(value))   // save
localStorage.getItem('key')                           // read — returns a string or null
localStorage.removeItem('key')                         // delete
```

Applied to `AuthContext.jsx` — read from localStorage once, on mount, as `useState`'s **lazy initializer** (a function passed to `useState` instead of a plain value; it only runs once, on the very first render):

```js
const [user, setUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem('auth_user')
    return savedUser ? JSON.parse(savedUser) : null
  } catch (e) {
    console.error(`Failed to parse session. ${e} has occured.`)
    return null
  }
})

useEffect(() => {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('auth_user')
  }
}, [user])   // re-run only when user actually changes — not every render
```

The `try/catch` (`CS.md` §21) guards against corrupted/manually-edited localStorage data crashing `JSON.parse` on load. The `useEffect` keeps localStorage in sync going forward — it fires on `login()` (writes) and `logout()` (removes), since both just call `setUser(...)`, which changes `user`, which re-triggers this effect.

**Check it for real, don't just trust the code:** DevTools → Application tab → Storage → Local Storage → your origin. You'll see the `auth_user` key appear on login and disappear on logout.
