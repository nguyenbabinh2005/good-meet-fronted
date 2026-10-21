import { preview } from 'vite'

const server = await preview({ preview: { host: '127.0.0.1', port: 4173 } })

const shutdown = async () => {
  await new Promise(resolve => server.httpServer.close(resolve))
  process.exit(0)
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
