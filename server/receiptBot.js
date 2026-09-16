import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { createWorker } from 'tesseract.js'
import { findSimilarReceipts } from './db.js'
import { shopBank } from '../src/data/bank.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(root, '..', 'public')

const RECEIPT_WORDS = [
  'واریز',
  'مبلغ',
  'کارت',
  'شبا',
  'پیگیری',
  'مرجع',
  'شاپرک',
  'بانک',
  'انتقال',
  'مبدأ',
  'مبدا',
  'مقصد',
  'حساب',
  'تراکنش',
  'موفق',
  'ریال',
  'تومان',
  'صادرات',
  'ملت',
  'ملی',
  'سامان',
  'پاسارگاد',
  'shaparak',
  'transfer',
  'amount',
  'card',
  'iban',
  'sheba',
  'rial',
  'bank',
  'success',
  'destination',
  'source',
  'ref',
  'trace',
]

function toFaDigits(value) {
  return String(value || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

function toNumber(value) {
  const digits = toFaDigits(value).replace(/[^\d.]/g, '')
  return Number(digits) || 0
}

function hamming(a, b) {
  const len = Math.min(a.length, b.length)
  if (!len) return 64
  let d = 0
  for (let i = 0; i < len; i += 1) if (a[i] !== b[i]) d += 1
  return d + Math.abs(a.length - b.length)
}

export async function dhashFromBuffer(buffer) {
  const raw = await sharp(buffer).grayscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer()
  let bits = ''
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      bits += raw[y * 9 + x] > raw[y * 9 + x + 1] ? '1' : '0'
    }
  }
  return bits
}

async function visualStats(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(160, 160, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const n = w * h
  const lum = new Float32Array(n)
  let white = 0
  let satSum = 0
  let satN = 0
  let edge = 0
  const corner = Math.max(2, Math.round(Math.min(w, h) * 0.18))
  let cornerWhite = 0

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 3
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const l = 0.299 * r + 0.587 * g + 0.114 * b
      lum[y * w + x] = l
      const sat = max === 0 ? 0 : (max - min) / max
      if (l > 232 && max - min < 22) white += 1
      if (l < 228) {
        satSum += sat
        satN += 1
      }
      const inCorner = x < corner || y < corner || x >= w - corner || y >= h - corner
      if (inCorner && l > 232) cornerWhite += 1
    }
  }

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const dx = Math.abs(lum[y * w + x] - lum[y * w + x + 1])
      const dy = Math.abs(lum[y * w + x] - lum[(y + 1) * w + x])
      if (dx > 16 || dy > 16) edge += 1
    }
  }

  const cornerArea = n - (w - 2 * corner) * (h - 2 * corner)
  return {
    whiteRatio: white / n,
    meanSat: satN ? satSum / satN : 0,
    edgeDensity: edge / n,
    aspect: w / h,
    cornerWhite: cornerArea > 0 ? cornerWhite / cornerArea : 0,
  }
}

async function catalogDistance(phash, items = []) {
  let best = 64
  const paths = items.flatMap((item) => [item.image, ...(item.gallery || [])]).filter(Boolean)
  for (const rel of paths.slice(0, 8)) {
    const file = path.join(publicDir, String(rel).replace(/^\/+/, ''))
    if (!fs.existsSync(file)) continue
    try {
      const hash = await dhashFromBuffer(fs.readFileSync(file))
      const dist = hamming(phash, hash)
      if (dist < best) best = dist
    } catch {
      /* skip unreadable catalog image */
    }
  }
  return best
}

function extractNumbers(text) {
  const normalized = toFaDigits(text).replace(/[^\d\s,]/g, ' ')
  return [...normalized.matchAll(/\d{4,12}/g)].map((m) => Number(m[0]))
}

function hasReceiptLanguage(text) {
  const lower = String(text || '').toLowerCase()
  return RECEIPT_WORDS.some((word) => lower.includes(word.toLowerCase()))
}

let ocrWorker = null

async function getOcrWorker() {
  if (ocrWorker) return ocrWorker
  try {
    ocrWorker = await createWorker('fas+eng')
  } catch {
    ocrWorker = await createWorker('eng')
  }
  return ocrWorker
}

async function readOcr(buffer) {
  try {
    const worker = await getOcrWorker()
    const result = await Promise.race([
      worker.recognize(buffer),
      new Promise((_, reject) => setTimeout(() => reject(new Error('ocr-timeout')), 22000)),
    ])
    return String(result?.data?.text || '').trim()
  } catch {
    return ''
  }
}

function shopCardLast4() {
  return String(shopBank.cardNumber || '').replace(/\D/g, '').slice(-4)
}

/**
 * Server-side receipt inspector. Never auto-approves authenticity.
 * Uses OCR + perceptual hash memory + catalog comparison.
 */
export async function inspectReceipt({
  buffer,
  fileName = '',
  fileSize = 0,
  mime = '',
  declaredAmount,
  last4,
  order,
}) {
  const checks = []
  const issues = []
  const amount = toNumber(declaredAmount)
  const total = toNumber(order?.total)
  const cardLast4 = String(last4 || '').replace(/\D/g, '')
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')

  const push = (id, label, ok, detail) => {
    checks.push({ id, label, ok, detail })
    if (!ok) issues.push(detail)
  }

  push('file', 'وجود فایل در سرور', Boolean(buffer?.length), buffer?.length ? 'تصویر روی سرور ذخیره شد' : 'فایل به سرور نرسید')

  const imageOk = !mime || String(mime).startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(fileName)
  push('filetype', 'نوع فایل', imageOk, imageOk ? 'فایل تصویر است' : 'فقط تصویر رسید پذیرفته می‌شود')

  const sizeOk = fileSize <= 0 || (fileSize >= 8 * 1024 && fileSize <= 8 * 1024 * 1024)
  push(
    'filesize',
    'حجم فایل',
    sizeOk,
    sizeOk ? 'حجم فایل مجاز است' : 'حجم فایل خارج از محدوده رسید معتبر است',
  )

  let phash = ''
  let stats = null
  try {
    phash = await dhashFromBuffer(buffer)
    stats = await visualStats(buffer)
  } catch {
    push('decode', 'خواندن تصویر', false, 'سرور نتوانست تصویر را باز کند')
  }

  const productDist = phash ? await catalogDistance(phash, order?.items || []) : 64
  const looksLikeProduct =
    productDist <= 12 ||
    (stats &&
      stats.whiteRatio > 0.34 &&
      stats.edgeDensity < 0.15 &&
      stats.cornerWhite > 0.45 &&
      stats.meanSat > 0.1)

  push(
    'catalog',
    'عدم شباهت به عکس کالا',
    !looksLikeProduct,
    looksLikeProduct
      ? productDist <= 12
        ? 'این تصویر با عکس کالای همین سفارش یکی است، نه رسید بانکی'
        : 'الگوی تصویر شبیه عکس استودیویی محصول است، نه رسید'
      : 'با عکس کالاهای این سفارش یکی نیست',
  )

  const memory = phash ? findSimilarReceipts(phash, 12) : []
  const fakeHit = memory.find((row) => row.verdict === 'fake')
  const genuineHit = memory.find((row) => row.verdict === 'genuine')
  push(
    'memory',
    'حافظه رسیدهای قبلی',
    !fakeHit,
    fakeHit
      ? `شبیه رسید جعلی قبلی (سفارش ${fakeHit.order_id || 'نامشخص'})`
      : genuineHit
        ? `شبیه رسید تاییدشده قبلی (سفارش ${genuineHit.order_id || 'نامشخص'}) — باز هم تایید ادمین لازم است`
        : 'نمونه مشابه جعلی در دیتابیس نیست',
  )

  const ocrText = buffer ? await readOcr(buffer) : ''
  const ocrOk = hasReceiptLanguage(ocrText)
  const ocrNumbers = extractNumbers(ocrText)
  const amountInImage = ocrNumbers.some((n) => Math.abs(n - total) <= Math.max(1000, total * 0.01))
  const destCard = shopCardLast4()
  const destInImage = destCard && ocrText.replace(/\D/g, '').includes(destCard)
  const last4InImage = /^\d{4}$/.test(cardLast4) && ocrText.includes(cardLast4)

  push(
    'ocr',
    'متن بانکی در تصویر (OCR)',
    ocrOk,
    ocrOk
      ? `کلمات بانکی در تصویر پیدا شد`
      : ocrText
        ? 'متن خوانده شد ولی واژه بانکی/واریز در آن نیست'
        : 'متنی شبیه رسید بانکی در تصویر پیدا نشد',
  )

  if (ocrText) {
    push(
      'ocr_amount',
      'مبلغ سفارش داخل تصویر',
      amountInImage,
      amountInImage
        ? 'رقم مبلغ سفارش در متن رسید دیده شد'
        : 'مبلغ سفارش در متن تصویر پیدا نشد',
    )
    if (destCard) {
      push(
        'ocr_card',
        'کارت فروشگاه در تصویر',
        destInImage,
        destInImage
          ? `رقم‌های کارت فروشگاه (${destCard}) در رسید هست`
          : 'شماره کارت فروشگاه در متن تصویر دیده نشد',
      )
    }
  }

  push(
    'declared_amount',
    'مبلغ اعلامی مشتری',
    Boolean(amount),
    amount ? `مبلغ واردشده: ${amount.toLocaleString('fa-IR')} تومان` : 'مبلغ واریزی وارد نشده است',
  )

  const diff = Math.abs(amount - total)
  const amountExact = Boolean(amount && total && diff === 0)
  const amountFar = Boolean(amount && total && diff > Math.max(10000, total * 0.02))
  push(
    'amount_match',
    'تطبیق مبلغ اعلامی با سفارش',
    amountExact,
    amountExact
      ? 'مبلغ تایپ‌شده با سفارش یکی است — این به‌تنهایی رسید را تایید نمی‌کند'
      : amountFar
        ? 'مبلغ تایپ‌شده با سفارش فرق دارد'
        : 'مبلغ اعلامی دقیق نیست',
  )

  push(
    'last4',
    '۴ رقم کارت مبدأ (اظهاری)',
    /^\d{4}$/.test(cardLast4),
    /^\d{4}$/.test(cardLast4) ? `وارد شده: ${cardLast4}` : 'چهار رقم آخر کارت مبدأ کامل نیست',
  )

  if (last4InImage) {
    push('last4_ocr', 'رقم کارت مبدأ در تصویر', true, '۴ رقم اظهاری در متن رسید دیده شد')
  }

  let decision = 'needs_review'
  let confidence = 0.5
  let adminSummary = ''
  let customerHint = ''

  const hardFake = looksLikeProduct || Boolean(fakeHit) || !imageOk || !sizeOk
  const notReceipt = !ocrOk && !looksLikeProduct && stats && stats.edgeDensity < 0.16
  const amountConflict = amountFar || (ocrText && ocrNumbers.length && !amountInImage && amountExact === false)

  if (hardFake || notReceipt) {
    decision = 'rejected'
    confidence = fakeHit || looksLikeProduct ? 0.95 : 0.88
    adminSummary = looksLikeProduct
      ? 'بات سرور این فایل را عکس کالا تشخیص داد، نه رسید بانکی.'
      : fakeHit
        ? 'این تصویر شبیه رسیدهایی است که قبلاً به‌عنوان جعلی رد شده‌اند.'
        : 'بات سرور الگوی رسید بانکی در تصویر پیدا نکرد.'
    customerHint = 'تصویر ارسالی رسید بانکی معتبر نیست. عکس یا اسکرین‌شات رسید واریز را بفرستید.'
  } else if (amountFar && !amountInImage) {
    decision = 'rejected'
    confidence = 0.84
    adminSummary = 'مبلغ اعلامی و متن تصویر با مبلغ سفارش هم‌خوان نیست.'
    customerHint = 'مبلغ رسید با سفارش یکی نیست. رسید درست را دوباره بفرستید.'
  } else if (ocrOk && (amountInImage || amountExact)) {
    decision = 'needs_review'
    confidence = destInImage ? 0.78 : 0.66
    adminSummary =
      'OCR واژه‌های بانکی پیدا کرد. ظاهر قابل قبول است، ولی جعل پیشرفته را فقط ادمین با دیدن عکس تایید کند.'
    customerHint = 'رسید دریافت شد و برای تایید نهایی مدیر در صف است.'
  } else {
    decision = 'needs_review'
    confidence = 0.45
    adminSummary = amountConflict
      ? 'متن تصویر مبهم است یا مبلغ داخل عکس با سفارش یکی نیست. بررسی دستی لازم است.'
      : 'بات نشانه‌های کافی برای رد یا تایید ندارد. بررسی دستی لازم است.'
    customerHint = 'رسید ثبت شد و به‌زودی بررسی می‌شود.'
  }

  if (decision === 'approved') decision = 'needs_review'

  return {
    bot: 'بات سرور ایمن یاب',
    engine: 'ocr+phash+memory',
    decision,
    confidence,
    issues: [...new Set(issues)],
    checks,
    adminSummary,
    customerHint,
    ocrText: ocrText.slice(0, 800),
    phash,
    sha256,
    visualKind: looksLikeProduct ? 'product_photo' : ocrOk ? 'receipt_like' : 'unknown',
    declaredAmount: amount,
    last4: cardLast4,
    fingerprint: sha256,
    checkedAt: new Date().toISOString(),
  }
}

export const botDecisionLabel = {
  approved: 'تایید خودکار بات',
  rejected: 'رد خودکار بات',
  needs_review: 'نیاز به بررسی ادمین',
}
