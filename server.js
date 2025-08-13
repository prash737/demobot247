
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = process.env.PORT || 5000

// Optimize for better memory management
const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
    experimental: {
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    }
  }
})
const handle = app.getRequestHandler()

let server

app.prepare().then(() => {
  server = createServer(async (req, res) => {
    try {
      // Add security and performance headers
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Referrer-Policy', 'origin-when-cross-origin')
      res.setHeader('Cache-Control', 'public, max-age=3600')

      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  // Set server timeout to prevent hanging connections
  server.timeout = 30000 // 30 seconds
  server.keepAliveTimeout = 5000 // 5 seconds

  server.on('error', (err) => {
    console.error('Server error:', err)
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`)
      process.exit(1)
    }
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Environment: ${process.env.NODE_ENV}`)
  })
})

// Improved graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...')
  if (server) {
    server.close(() => {
      console.log('HTTP server closed')
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
process.on('SIGQUIT', gracefulShutdown)

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  gracefulShutdown()
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown()
})
