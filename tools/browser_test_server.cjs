const http = require('node:http')
const { createReadStream, existsSync, statSync } = require('node:fs')
const { extname, join, normalize, resolve } = require('node:path')

const projectRoot = resolve(__dirname, '..')
const port = Number(process.env.PORT || 4173)

const harnessHtmlPath = join(projectRoot, 'test', 'browser', 'harness.html')
const distBundlePath = join(projectRoot, 'dist', 'dxf.js')
const fixturesDir = join(projectRoot, 'test', 'resources')

function sendText(res, statusCode, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType })
  res.end(text)
}

function contentTypeForPath(filePath) {
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.dxf':
      return 'text/plain; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function safeJoin(baseDir, requestedPath) {
  const cleaned = requestedPath.replace(/^\/+/, '')
  const target = normalize(join(baseDir, cleaned))
  const resolvedBase = resolve(baseDir)
  const resolvedTarget = resolve(target)
  if (!resolvedTarget.startsWith(resolvedBase + '/')) {
    return null
  }
  return resolvedTarget
}

// NOSONAR: This is a local development test server for browser tests only.
// HTTP is appropriate and safe for localhost testing. HTTPS would require
// certificate management without providing security benefits for local testing.
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname

  if (pathname === '/' || pathname === '/harness') {
    if (!existsSync(harnessHtmlPath)) {
      return sendText(res, 500, 'Missing test/browser/harness.html')
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return createReadStream(harnessHtmlPath).pipe(res)
  }

  if (pathname === '/dist/dxf.js') {
    if (!existsSync(distBundlePath)) {
      return sendText(
        res,
        500,
        'Missing dist/dxf.js. Run `yarn dist` before running browser tests.'
      )
    }
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' })
    return createReadStream(distBundlePath).pipe(res)
  }

  if (pathname.startsWith('/fixtures/')) {
    const fixtureName = pathname.slice('/fixtures/'.length)
    const fixturePath = safeJoin(fixturesDir, fixtureName)
    if (!fixturePath) {
      return sendText(res, 400, 'Invalid fixture path')
    }
    if (!existsSync(fixturePath) || !statSync(fixturePath).isFile()) {
      return sendText(res, 404, 'Fixture not found')
    }
    res.writeHead(200, { 'Content-Type': contentTypeForPath(fixturePath) })
    return createReadStream(fixturePath).pipe(res)
  }

  return sendText(res, 404, 'Not found')
})

server.listen(port, () => {
  // Used by Playwright webServer readiness checks.
  console.log(`Browser test server listening on http://localhost:${port}`)
})
