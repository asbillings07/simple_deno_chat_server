import { WebSocket, isWebSocketCloseEvent, v4, camelCase } from './deps.ts'

const users = new Map<string, WebSocket>()

function brodcast(message: string, senderId?: string): void {
  if (!message) return
  for (const user of users.values()) {
    user.send(senderId ? `[${senderId}]: ${message}` : message)
  }
}

export async function chat(ws: WebSocket): Promise<void> {
  const userId = v4.generate()

  users.set(userId, ws)
  brodcast(`> User with the id of ${userId} has connected`)

  // wait for new messages
  for await (const event of ws) {
    const message = camelCase(typeof event === 'string' ? event : '')

    brodcast(message, userId)

    //unregister user connection

    if (!message && isWebSocketCloseEvent(event)) {
      users.delete(userId)
      brodcast(`> User with the id of ${userId} has disconnected`)
      break
    }
  }
}
