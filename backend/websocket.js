import { WebSocketServer } from 'ws'

let wss

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected')

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data)
        broadcast(msg)
      } catch {}
    })

    ws.on('close', () => console.log('[WS] Client disconnected'))
  })

  console.log('[WS] WebSocket server ready on /ws')
}

export function broadcast(data) {
  if (!wss) return
  const msg = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg)
  })
}
