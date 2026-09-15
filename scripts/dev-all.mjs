import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const node = process.execPath
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')

const children = [
  spawn(node, ['server/index.js'], { cwd: root, stdio: 'inherit', windowsHide: true }),
  spawn(node, [vite], { cwd: root, stdio: 'inherit', windowsHide: true }),
]

let exiting = false
function shutdown(code = 0) {
  if (exiting) return
  exiting = true
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  process.exit(code)
}

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!exiting) shutdown(signal ? 1 : (code ?? 1))
  })
  child.on('error', (err) => {
    console.error(err)
    shutdown(1)
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
