import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const outDir = 'C:/Users/Elahe/Desktop/imenyab-social'
await mkdir(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto('http://127.0.0.1:5173/imenmahdi-shop/', {
  waitUntil: 'networkidle2',
  timeout: 90000,
})
await page.addStyleTag({
  content: '[aria-label="ارتباط با فروشگاه"], [id*="devtools"], [class*="devtools"] { display: none !important; }',
})
await new Promise((r) => setTimeout(r, 3000))
const file = path.join(outDir, 'fullpage-desktop-2x.png')
await page.screenshot({ path: file, fullPage: true, type: 'png' })
await browser.close()
console.log(file)
