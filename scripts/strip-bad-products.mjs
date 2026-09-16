import fs from 'node:fs'

const p = 'c:/Users/Elahe/Desktop/imenmahdi-shop-vue/src/data/catalog.js'
let s = fs.readFileSync(p, 'utf8')
const marker = "  {\n    id: 'p-patan-brown'"
const start = s.indexOf(marker)
const end = s.indexOf('].map((product) => ({')
if (start < 0 || end < 0) {
  console.error('fail', start, end)
  process.exit(1)
}
s = s.slice(0, start) + s.slice(end)
fs.writeFileSync(p, s)
console.log('ok removed', end - start, 'chars')
