import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { slugify } from '../src/utils/slugify.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const origin = (process.env.VITE_SITE_URL || 'https://elahevakili1382.github.io').replace(/\/$/, '')
const base = '/imenmahdi-shop'
const source = readFileSync(join(__dirname, '..', 'src', 'data', 'catalog.js'), 'utf8')

function loc(path = '') {
  const clean = path.replace(/^\//, '')
  return clean ? `${origin}${base}/${clean}` : `${origin}${base}/`
}

const productSlugs = [...new Set([...source.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1]))]
const categories = [...new Set([...source.matchAll(/^\s*category:\s*'([^']+)'/gm)].map((m) => m[1]))]
const subcategories = [
  ...new Set([...source.matchAll(/^\s*subcategory:\s*'([^']+)'/gm)].map((m) => m[1])),
]

// top-level category tree names (Persian strings inside children arrays + group names)
const treeBlock = source.slice(0, source.indexOf('export const products'))
const treeNames = [...new Set([...treeBlock.matchAll(/'([^']{2,40})'/g)].map((m) => m[1]))].filter(
  (name) => /[\u0600-\u06FF]/.test(name),
)

const urls = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'products', priority: '0.9', changefreq: 'daily' },
  { path: 'contact', priority: '0.6', changefreq: 'monthly' },
]

for (const name of [...new Set([...categories, ...subcategories, ...treeNames])]) {
  const slug = slugify(name)
  if (!slug) continue
  urls.push({ path: `products/category/${slug}`, priority: '0.75', changefreq: 'weekly' })
}

for (const slug of productSlugs) {
  urls.push({ path: `products/${slug}`, priority: '0.8', changefreq: 'weekly' })
}

const today = new Date().toISOString().slice(0, 10)
const body = urls
  .map(
    (item) => `  <url>
    <loc>${loc(item.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const out = join(__dirname, '..', 'public', 'sitemap.xml')
writeFileSync(out, xml, 'utf8')
console.log(`sitemap.xml written (${urls.length} urls) → ${out}`)
