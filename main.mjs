import http from 'http'
import readStream from './readStream.mjs'
import Queue from './Queue.mjs'

class Message {
  constructor(author, text) {
    this.id = lastid++
    this.buffer = Buffer.from(`id:${this.id}\ndata:${JSON.stringify({
      author,
      time: new Date().toISOString(),
      text: text.replace(/\s+/g, ' ')
    })}\n\n`)
  }
}

const esHeaders = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
}
let lastid = 1
const clients = new Set() // this is where we store the open response streams
const messages = new Queue(new Message('server', 'Hello world!'))

const server = http.createServer((req, res) => {
  if (req.headers.origin) res.setHeader('Access-Control-Allow-Origin', req.headers.origin)

  // GET /         ->      start an event-stream response
  if (req.url === '/') {
    if (req.headers.origin) res.setHeader('Access-Control-Allow-Methods', 'GET')
    if (clients.size > 1000) {
      res.writeHead(503)
      res.end('Il y a trop de monde sur le canal ; revenez plus tard.')
      return
    }
    switch (req.method) {
      case 'OPTIONS': break
      case 'GET':
      res.writeHead(200, esHeaders)
      const connectedEvent = Buffer.from(`event:join\ndata:${remoteAddr(req)}\n\n`)
      for (const client of clients) client.write(connectedEvent)
      clients.add(res)
      const lastEventId = req.headers['Last-Event-ID']
      for (const message of messages.valuesAfterID(lastEventId)) res.write(message.buffer)
      req.socket.addListener('close', () => {
        clients.delete(res)
        const disconnectedEvent = Buffer.from(`event:quit\ndata:${remoteAddr(req)}\n\n`)
        for (const client of clients) client.write(disconnectedEvent)  
      })
      return
      default: res.writeHead(405)
    }
  }
  // POST /send     ->     add a message
  else if (req.url === '/send') {
    if (req.headers.origin) res.setHeader('Access-Control-Allow-Methods', 'POST')
    switch (req.method) {
      case 'OPTIONS': break
      case 'POST':
      readStream(req, 4095)
      .then(buffer => {
        clearTimeout(keepaliveTimer)
        res.writeHead(204)
        res.end()
        const message = new Message(remoteAddr(req), buffer.toString())
        messages.push(message)
        if (messages.length > 1000) messages.shift()
        for (const client of clients) client.write(message.buffer)
        keepaliveTimer = setTimeout(keepalive, 3e4)
      })
      .catch(err => {
        res.writeHead(400)
        res.end(err.message)
      })
      return
      default: res.writeHead(405)
    }
  } else res.writeHead(404)
  res.end()
})

server.listen(8916)

// ping to keep connections alive when channel is inactive
const ping = Buffer.from(':ping\n\n')
function keepalive() {
  for (const client of clients) client.write(ping)
  keepaliveTimer = setTimeout(keepalive, 3e4)
}
let keepaliveTimer = setTimeout(keepalive, 3e4)

function remoteAddr(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress
}
