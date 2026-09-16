import { mkdir, writeFile, cp } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve('C:/Users/Elahe/Desktop/imenmahdi-shop-vue')
const OUT = path.join(ROOT, 'mockups', 'social')
const CAPTURE = path.join(OUT, 'captures')
const POSTS = path.join(OUT, 'posts')
const HTML_DIR = path.join(OUT, 'html')
const URL = 'http://127.0.0.1:5173/imenmahdi-shop/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

function fileUrl(file) {
  return pathToFileURL(file).href
}

function slideHtml({ title, shots, mode }) {
  const cards = shots
    .map((shot, i) => {
      const src = fileUrl(shot)
      if (mode === 'stack') {
        return `<img class="stack-card" src="${src}" alt="" style="z-index:${shots.length - i}" />`
      }
      if (mode === 'zoom') {
        const cls = [
          'zoom-card',
          shot.includes('featured') || shot.includes('brands') ? 'contain' : '',
          shot.includes('hero') ? 'hero' : '',
        ].filter(Boolean).join(' ')
        return `<img class="${cls}" src="${src}" alt="" />`
      }
      return `<img class="tilt-card" src="${src}" alt="" />`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@500;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, .canvas {
      width: 1080px;
      height: 1350px;
      overflow: hidden;
    }
    .canvas {
      position: relative;
      background: #F4EFE7;
      font-family: Vazirmatn, sans-serif;
    }
    .canvas.dark { background: #0C0E12; }
    .label {
      position: absolute;
      top: 48px;
      right: 56px;
      z-index: 20;
      color: #C45C26;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.18em;
    }
    .canvas.dark .label { color: #C4A484; }
    .stack {
      position: absolute;
      inset: 110px 72px 72px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .stack-card {
      width: 100%;
      height: 290px;
      object-fit: cover;
      object-position: top center;
      border-radius: 28px;
      box-shadow: 0 22px 50px rgba(12, 14, 18, 0.16);
      background: #fff;
    }
    .zoom-wrap, .tilt-wrap {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }
    .zoom-card {
      width: 980px;
      height: 1180px;
      object-fit: cover;
      object-position: top center;
      border-radius: 36px;
      box-shadow: 0 40px 80px rgba(12, 14, 18, 0.28);
      background: #fff;
    }
    .zoom-card.contain {
      object-fit: contain;
      background: #F4EFE7;
    }
    .zoom-card.hero {
      object-position: top right;
    }
    .tilt-card {
      width: 920px;
      height: 1080px;
      object-fit: cover;
      object-position: center;
      border-radius: 36px;
      transform: rotate(-8deg);
      box-shadow: 0 40px 90px rgba(12, 14, 18, 0.32);
    }
  </style>
</head>
<body>
  <div class="canvas ${mode === 'tilt' ? 'dark' : ''}">
    <p class="label">${title}</p>
    ${mode === 'stack' ? `<div class="stack">${cards}</div>` : ''}
    ${mode === 'zoom' ? `<div class="zoom-wrap">${cards}</div>` : ''}
    ${mode === 'tilt' ? `<div class="tilt-wrap">${cards}</div>` : ''}
  </div>
</body>
</html>`
}

async function shotElement(page, selector, file) {
  const handle = await page.$(selector)
  if (!handle) throw new Error(`Missing ${selector}`)
  await handle.scrollIntoViewIfNeeded()
  await new Promise((r) => setTimeout(r, 500))
  await handle.screenshot({ path: file, type: 'png' })
}

async function main() {
  await mkdir(CAPTURE, { recursive: true })
  await mkdir(POSTS, { recursive: true })
  await mkdir(HTML_DIR, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: null,
    args: ['--hide-scrollbars', '--window-size=1440,900'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 })
  await page.addStyleTag({
    content: `
      [aria-label="ارتباط با فروشگاه"],
      a[href="#content"],
      [id*="devtools"],
      [class*="devtools"],
      [class*="vue-devtools"] { display: none !important; }
    `,
  })
  await page.evaluate(() => {
    document.querySelectorAll('[id*="devtools"], [class*="devtools"], iframe').forEach((el) => {
      if (el.closest('#app')) return
      el.remove()
    })
  })
  await new Promise((r) => setTimeout(r, 2500))

  const hero = path.join(CAPTURE, 'hero.png')
  const cats = path.join(CAPTURE, 'categories.png')
  const featured = path.join(CAPTURE, 'featured.png')
  const lookbook = path.join(CAPTURE, 'lookbook.png')
  const poster = path.join(CAPTURE, 'poster.png')
  const brands = path.join(CAPTURE, 'brands.png')

  const heroBox = await page.evaluate(() => {
    const header = document.querySelector('header')
    const section = document.querySelector('section.relative')
    const top = 0
    const bottom = Math.max(header?.getBoundingClientRect().bottom || 0, section?.getBoundingClientRect().bottom || 780)
    return { x: 0, y: top, width: 1440, height: Math.min(900, Math.ceil(bottom - top)) }
  })
  await page.screenshot({ path: hero, clip: heroBox })

  const selectors = await page.evaluate(() => {
    const shops = [...document.querySelectorAll('.container-shop')]
    const pick = (el) => {
      if (!el) return null
      if (!el.id) el.dataset.shot = el.dataset.shot || Math.random().toString(36).slice(2)
      return el.id ? `#${el.id}` : `[data-shot="${el.dataset.shot}"]`
    }
    const featured = shops.find((el) => el.innerText.includes('منتخب فروشگاه'))
    const catsEl = shops.find((el) => el.innerText.includes('دسته‌بندی'))
    featured?.setAttribute('data-shot', 'featured')
    catsEl?.setAttribute('data-shot', 'cats')
    document.querySelector('.lookbook')?.closest('section')?.setAttribute('data-shot', 'lookbook')
    document.querySelector('article.poster')?.closest('section')?.setAttribute('data-shot', 'poster')
    document.querySelector('.brand-gallery')?.setAttribute('data-shot', 'brands')
    return {
      cats: pick(catsEl),
      featured: pick(featured),
      lookbook: '[data-shot="lookbook"]',
      poster: '[data-shot="poster"]',
      brands: '[data-shot="brands"]',
    }
  })

  await shotElement(page, selectors.cats, cats)
  await shotElement(page, selectors.featured, featured)
  await shotElement(page, selectors.lookbook, lookbook)
  await shotElement(page, selectors.poster, poster)
  await shotElement(page, selectors.brands, brands)

  const slides = [
    { file: '01-overview.png', title: 'IMEN YAB', mode: 'stack', shots: [hero, cats, featured, lookbook] },
    { file: '02-hero.png', title: 'ایمن یاب', mode: 'zoom', shots: [hero] },
    { file: '03-lookbook.png', title: 'کاتالوگ', mode: 'tilt', shots: [lookbook] },
    { file: '04-products.png', title: 'منتخب', mode: 'zoom', shots: [featured] },
    { file: '05-poster.png', title: 'تعهد فروشگاه', mode: 'zoom', shots: [poster] },
    { file: '06-brands.png', title: 'برندها', mode: 'zoom', shots: [brands] },
  ]

  for (const slide of slides) {
    const htmlPath = path.join(HTML_DIR, slide.file.replace('.png', '.html'))
    await writeFile(htmlPath, slideHtml(slide), 'utf8')
    const art = await browser.newPage()
    await art.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 })
    await art.goto(fileUrl(htmlPath), { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 1200))
    await art.screenshot({ path: path.join(POSTS, slide.file), type: 'png' })
    await art.close()
  }

  await browser.close()
  const desktop = path.join('C:/Users/Elahe/Desktop', 'imenyab-social')
  await mkdir(desktop, { recursive: true })
  for (const slide of slides) {
    await cp(path.join(POSTS, slide.file), path.join(desktop, slide.file))
  }
  console.log(`Wrote ${slides.length} posts to ${POSTS}`)
  console.log(`Copied to ${desktop}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
