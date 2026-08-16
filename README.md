# webSocket

A real-time chat app — second full project after [Vault](https://github.com/CalWill9123/vault), built to learn WebSockets: how a server pushes data to clients instead of clients having to ask for it.

## What it does

Multiple users connect, join a room, and see messages appear instantly for everyone in that room — no refreshing, no polling. Message history persists, so refreshing the page doesn't wipe the conversation.

## Why WebSockets

Everything in Vault is request/response — the frontend asks, the backend answers, then the connection is done. A WebSocket keeps the connection open, so either side can send a message at any time. That's the whole point of this project: build something that actually needs that, not something that fakes it with repeated requests.

## Stack

- **Backend:** Node, Express, MongoDB/Mongoose, JWT auth (reused from Vault), and the raw [`ws`](https://github.com/websockets/ws) library — not Socket.io, on purpose, to learn the actual WebSocket protocol instead of a higher-level abstraction that hides it.
- **Frontend:** React, Tailwind, and the browser's native `WebSocket` API, matching the raw-protocol choice on the backend.
- **No TypeScript on this project.** WebSockets alone is a big enough shift in mental model (push vs. pull) to be the one new concept here — TypeScript is a deliberate next-project focus, not bundled in.

## Status

Scaffolded — empty Express/Mongo backend and Vite/React frontend, same structure as Vault. No chat logic yet. The `ws` server integration is the next thing to build.

## Structure

```
backend/    Express + Mongo + ws server
frontend/   React + Tailwind client
```
