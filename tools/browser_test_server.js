import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const port = Number(process.env.PORT || 4173)

const harnessHtmlPath = join(projectRoot, 'test', 'browser', 'harness.html')
const distBundlePath = join(projectRoot, 'dist', 'dxf.js')
const reviewThreeBundlePath = join(projectRoot, 'dist', 'dxf-review-three.js')
const threeBuildDir = join(projectRoot, 'node_modules', 'three', 'build')
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

const JS = 'text/javascript; charset=utf-8'

const exactFiles = new Map([
  ['/', { path: harnessHtmlPath, type: 'text/html; charset=utf-8', missing: 'Missing test/browser/harness.html' }],
  ['/harness', { path: harnessHtmlPath, type: 'text/html; charset=utf-8', missing: 'Missing test/browser/harness.html' }],
  ['/dist/dxf.js', { path: distBundlePath, type: JS, missing: 'Missing dist/dxf.js. Run `yarn dist` before running browser tests.' }],
  ['/dist/dxf-review-three.js', { path: reviewThreeBundlePath, type: JS, missing: 'Missing dist/dxf-review-three.js. Run `yarn dist` before running browser tests.' }],
])

const mounts = [
  { prefix: '/vendor/three/', dir: threeBuildDir, type: JS, invalid: [404, 'Not found'], absent: 'Not found' },
  { prefix: '/fixtures/', dir: fixturesDir, type: null, invalid: [400, 'Invalid fixture path'], absent: 'Fixture not found' },
]

function sendFile(res, filePath, type) {
  res.writeHead(200, { 'Content-Type': type })
  return createReadStream(filePath).pipe(res)
}

function serveExact(res, entry) {
  if (!existsSync(entry.path)) return sendText(res, 500, entry.missing)
  return sendFile(res, entry.path, entry.type)
}

function serveMounted(res, mount, pathname) {
  const filePath = safeJoin(mount.dir, pathname.slice(mount.prefix.length))
  if (!filePath) return sendText(res, mount.invalid[0], mount.invalid[1])
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return sendText(res, 404, mount.absent)
  return sendFile(res, filePath, mount.type ?? contentTypeForPath(filePath))
}

// NOSONAR: This is a local development test server for browser tests only.
// HTTP is appropriate and safe for localhost testing. HTTPS would require
// certificate management without providing security benefits for local testing.
const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const exact = exactFiles.get(pathname)
  if (exact) return serveExact(res, exact)
  const mount = mounts.find((candidate) => pathname.startsWith(candidate.prefix))
  if (mount) return serveMounted(res, mount, pathname)
  return sendText(res, 404, 'Not found')
})

server.listen(port, () => {
  // Used by Playwright webServer readiness checks.
  console.log(`Browser test server listening on http://localhost:${port}`)
})
