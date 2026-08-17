# webSocket

A real-time price ticker & alerts app — second full project after [Vault](https://github.com/CalWill9123/vault), built to learn WebSockets: how a server pushes data to clients instead of clients having to ask for it. Started as a generic chat app, pivoted once the raw `ws` server was proven working — plain room chat is the single most common WebSocket demo project out there, and this domain gives the same core skill a sharper, more distinctive edge.

## What it does

Users log in, build a watchlist of crypto (and maybe stock) symbols, and see live price updates pushed to them the instant they change — no refreshing, no polling. Set a price threshold on any symbol and get an instant alert the moment it's crossed, pushed straight from the server the second it knows, not whenever the client happens to ask.

## Why WebSockets

Everything in Vault is request/response — the frontend asks, the backend answers, then the connection is done. An alert that matters can't wait for the client to poll "has it changed yet?" — the server has to be able to push the instant it knows. That's the whole point of this project: build something that actually needs that, not something that fakes it with repeated requests.

## Stack

- **Backend:** Node, Express, MongoDB/Mongoose (users, watchlists, price history), JWT auth (reused from Vault), and the raw [`ws`](https://github.com/websockets/ws) library — not Socket.io, on purpose, to learn the actual WebSocket protocol instead of a higher-level abstraction that hides it.
- **Frontend:** React, Tailwind, and the browser's native `WebSocket` API, matching the raw-protocol choice on the backend.
- **No TypeScript on this project.** WebSockets alone is a big enough shift in mental model (push vs. pull) to be the one new concept here — TypeScript is a deliberate next-project focus, not bundled in.

## Data source

[CoinGecko](https://www.coingecko.com/en/api) for crypto prices — free, no API key required. The backend polls it on an interval, diffs against the last known price, and pushes updates (plus any threshold-crossing alerts) out to subscribed clients over the WebSocket. Stock ticker support is a possible stretch goal, not v1 — free real-time stock data is a much harder problem than crypto.

## Status

Pivoted from an initial chat concept (2026-08-17) — the `ws`⇄Express server wiring built during that phase carries over as-is, since it never depended on the chat domain to begin with. No watchlist/ticker logic yet. Next: `User`/`Watchlist` models, then the price-poll-and-broadcast loop.

## Structure

```
backend/    Express + Mongo + ws server
frontend/   React + Tailwind client
```
