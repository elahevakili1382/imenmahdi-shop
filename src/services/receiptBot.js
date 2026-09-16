import { toNumber } from '@/utils/money'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fingerprint({ name, size, declaredAmount, last4 }) {
  return `${name || ''}-${size || 0}-${declaredAmount}-${last4}`
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src || typeof Image === 'undefined') {
      reject(new Error('no image'))
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('load failed'))
    img.src = src
  })
}

function sample(img, size = 96) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const ratio = img.width / Math.max(1, img.height)
  const w = ratio >= 1 ? size : Math.max(12, Math.round(size * ratio))
  const h = ratio >= 1 ? Math.max(12, Math.round(size / ratio)) : size
  canvas.width = w
  canvas.height = h
  ctx.drawImage(img, 0, 0, w, h)
  return { w, h, data: ctx.getImageData(0, 0, w, h).data, ratio: img.width / Math.max(1, img.height) }
}

function analyzePixels(data, w, h) {
  const n = w * h
  const lum = new Float32Array(n)
  let white = 0
  let satSum = 0
  let satN = 0
  let edge = 0
  let horiz = 0
  let vert = 0
  let cornerWhite = 0
  const corner = Math.max(2, Math.round(Math.min(w, h) * 0.18))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
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

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const c = lum[y * w + x]
      const dx = Math.abs(c - lum[y * w + x + 1])
      const dy = Math.abs(c - lum[(y + 1) * w + x])
      if (dx > 16 || dy > 16) edge += 1
      if (dx > 20) horiz += 1
      if (dy > 20) vert += 1
    }
  }

  const cornerArea = n - (w - 2 * corner) * (h - 2 * corner)
  return {
    whiteRatio: white / n,
    meanSat: satN ? satSum / satN : 0,
    edgeDensity: edge / n,
    horizShare: horiz / Math.max(1, horiz + vert),
    aspect: w / h,
    cornerWhite: cornerArea > 0 ? cornerWhite / cornerArea : 0,
  }
}

function averageHash(data) {
  const bits = []
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    bits.push(y)
    sum += y
  }
  const mean = sum / bits.length
  return bits.map((y) => (y > mean ? 1 : 0))
}

function hamming(a, b) {
  const len = Math.min(a.length, b.length)
  if (!len) return 1
  let d = 0
  for (let i = 0; i < len; i += 1) if (a[i] !== b[i]) d += 1
  return d / len
}

async function looksLikeOrderProduct(uploadSample, productImages = []) {
  if (!productImages.length) return { match: false, distance: 1 }
  const uploadHash = averageHash(uploadSample.data)
  let best = 1
  for (const src of productImages.slice(0, 8)) {
    try {
      const img = await loadImage(src)
      const sampled = sample(img, 96)
      const dist = hamming(uploadHash, averageHash(sampled.data))
      if (dist < best) best = dist
    } catch {
      /* ignore missing catalog image */
    }
  }
  return { match: best < 0.27, distance: best }
}

/**
 * Product-on-white catalog shots are smooth, studio-lit, and sparse.
 * Bank slips / app screenshots are text-heavy with many small edges.
 */
function classifyVisual(stats, productMatch) {
  const productLike =
    productMatch ||
    (stats.whiteRatio > 0.34 &&
      stats.edgeDensity < 0.15 &&
      stats.cornerWhite > 0.45 &&
      stats.meanSat > 0.1)

  const receiptLike =
    stats.edgeDensity >= 0.16 &&
    stats.meanSat < 0.38 &&
    (stats.horizShare > 0.42 || stats.aspect < 0.92 || stats.aspect > 1.15)

  if (productLike) {
    return {
      ok: false,
      kind: 'product_photo',
      detail: 'این تصویر شبیه عکس کالا است، نه رسید بانکی. بات آن را رد کرد.',
    }
  }
  if (!receiptLike) {
    return {
      ok: false,
      kind: 'not_receipt',
      detail: 'الگوی تصویر با رسید بانکی / اسکرین‌شات اپ بانک هم‌خوان نیست.',
    }
  }
  return {
    ok: true,
    kind: 'receipt_like',
    detail: 'از نظر بصری به رسید یا رسید دیجیتال شبیه است؛ اصالت نهایی با ادمین است.',
  }
}

async function inspectVisual({ dataUrl, productImages = [] }) {
  if (typeof document === 'undefined' || !dataUrl) {
    return {
      ok: false,
      kind: 'unreadable',
      detail: 'بات نتوانست محتوای تصویر را بخواند.',
      stats: null,
    }
  }
  try {
    const img = await loadImage(dataUrl)
    const sampled = sample(img, 96)
    const stats = analyzePixels(sampled.data, sampled.w, sampled.h)
    const product = await looksLikeOrderProduct(sampled, productImages)
    const verdict = classifyVisual(stats, product.match)
    return { ...verdict, stats, productDistance: product.distance }
  } catch {
    return {
      ok: false,
      kind: 'unreadable',
      detail: 'خواندن تصویر برای تشخیص رسید ناموفق بود.',
      stats: null,
    }
  }
}

/**
 * Receipt checker: numbers + visual heuristics.
 * Still cannot do real bank OCR; a catalog/product photo must be rejected.
 */
export async function runReceiptBot({
  file,
  dataUrl,
  declaredAmount,
  orderTotal,
  last4,
  existingOrders = [],
  orderId,
  productImages = [],
}) {
  await wait(400)

  const issues = []
  const checks = []
  const amount = toNumber(declaredAmount)
  const total = toNumber(orderTotal)
  const cardLast4 = String(last4 || '').replace(/\D/g, '')

  const pushCheck = (id, label, ok, detail = '') => {
    checks.push({ id, label, ok, detail })
    if (!ok && detail) issues.push(detail)
  }

  pushCheck('image', 'آپلود تصویر', Boolean(dataUrl), dataUrl ? 'فایل تصویر دریافت شد' : 'تصویر آپلود نشد')

  if (file && file.type && !file.type.startsWith('image/')) {
    pushCheck('filetype', 'نوع فایل', false, 'فقط تصویر پذیرفته می‌شود')
  } else {
    pushCheck('filetype', 'نوع فایل', true, 'فرمت فایل تصویر است — این به‌معنای رسید بودن نیست')
  }

  if (file && file.size > 8 * 1024 * 1024) {
    pushCheck('filesize', 'حجم فایل', false, 'حجم فایل بیش از ۸ مگابایت است')
  } else if (file && file.size > 0 && file.size < 8 * 1024) {
    pushCheck('filesize', 'حجم فایل', false, 'فایل خیلی کوچک است')
  } else {
    pushCheck('filesize', 'حجم فایل', true, 'حجم فایل در محدوده مجاز است')
  }

  const visual = await inspectVisual({ dataUrl, productImages })
  pushCheck('visual', 'تشخیص رسید بانکی در تصویر', visual.ok, visual.detail)

  pushCheck(
    'amount_present',
    'مبلغ اعلام‌شده توسط مشتری',
    Boolean(amount),
    amount ? `مبلغ واردشده: ${amount.toLocaleString('fa-IR')} تومان` : 'مبلغ واریزی وارد نشده است',
  )

  pushCheck(
    'card_last4',
    '۴ رقم آخر کارت (اظهاری)',
    /^\d{4}$/.test(cardLast4),
    /^\d{4}$/.test(cardLast4)
      ? `رقم‌های واردشده: ${cardLast4}`
      : 'چهار رقم آخر کارت مبدأ باید ۴ رقم باشد',
  )

  const diff = Math.abs(amount - total)
  const amountExact = Boolean(amount && total && diff === 0)
  const amountClose = Boolean(amount && total && diff > 0 && diff <= Math.max(10000, total * 0.02))
  const amountFar = Boolean(amount && total && diff > Math.max(10000, total * 0.02))

  if (amountExact) {
    pushCheck('amount_match', 'تطبیق مبلغ اظهاری با سفارش', true, 'عددی که مشتری نوشته با جمع سفارش یکی است')
  } else if (amountClose) {
    pushCheck('amount_match', 'تطبیق مبلغ اظهاری با سفارش', false, 'مبلغ واردشده نزدیک است ولی دقیق نیست')
  } else if (amountFar || (amount && total)) {
    pushCheck('amount_match', 'تطبیق مبلغ اظهاری با سفارش', false, 'مبلغ واردشده با مبلغ سفارش هم‌خوانی ندارد')
  } else {
    pushCheck('amount_match', 'تطبیق مبلغ اظهاری با سفارش', false, 'امکان مقایسه مبلغ وجود ندارد')
  }

  const mark = fingerprint({
    name: file?.name,
    size: file?.size,
    declaredAmount: amount,
    last4: cardLast4,
  })
  const duplicated = existingOrders.some(
    (order) => order.id !== orderId && order.receiptFingerprint === mark,
  )
  pushCheck(
    'duplicate',
    'عدم تکرار فایل',
    !duplicated,
    duplicated ? 'این فایل قبلاً برای سفارش دیگری ثبت شده است' : 'فایل تکراری در سیستم دیده نشد',
  )

  let decision = 'needs_review'
  let confidence = 0.55
  let adminSummary = ''
  let customerHint = ''

  const visualFail = !visual.ok
  const hardFail =
    visualFail ||
    duplicated ||
    amountFar ||
    checks.some((item) => !item.ok && ['image', 'filetype', 'filesize'].includes(item.id))

  if (visualFail) {
    decision = 'rejected'
    confidence = visual.kind === 'product_photo' ? 0.93 : 0.86
    adminSummary =
      visual.kind === 'product_photo'
        ? 'بات تصویر را عکس کالا تشخیص داد، نه رسید بانکی. رد شد.'
        : `بات تصویر را رسید بانکی ندانست: ${visual.detail}`
    customerHint = 'تصویر ارسالی رسید بانکی نیست. لطفاً عکس یا اسکرین‌شات رسید واریز را بفرستید.'
  } else if (hardFail) {
    decision = 'rejected'
    confidence = 0.9
    adminSummary = 'بات رسید را به‌خاطر مشکل فایل یا مبلغ رد کرد.'
    customerHint = 'رسید تایید نشد. لطفاً تصویر رسید بانکی و مبلغ را اصلاح کنید.'
  } else if (amountExact) {
    decision = 'needs_review'
    confidence = 0.64
    issues.push('تصویر از نظر ظاهری شبیه رسید است، ولی متن بانک خوانده نشده؛ تایید نهایی با ادمین است')
    adminSummary =
      'ظاهر تصویر شبیه رسید است و مبلغ اظهاری با سفارش یکی است. خودتان عکس را بخوانید و تایید یا رد کنید.'
    customerHint = 'رسید دریافت شد و برای تایید نهایی ادمین در صف بررسی است.'
  } else if (amountClose) {
    decision = 'needs_review'
    confidence = 0.48
    adminSummary = 'ظاهر تصویر قابل قبول است، ولی مبلغ اظهاری دقیق نیست.'
    customerHint = 'رسید دریافت شد؛ به‌خاطر اختلاف مبلغ، بررسی دستی انجام می‌شود.'
  } else {
    decision = 'needs_review'
    confidence = 0.5
    if (!issues.length) issues.push('رسید نیاز به بررسی دستی ادمین دارد')
    adminSummary = 'بات نتوانست با اطمینان تصمیم بگیرد. بررسی دستی لازم است.'
    customerHint = 'رسید شما ثبت شد و به‌زودی بررسی می‌شود.'
  }

  if (decision === 'approved') decision = 'needs_review'

  return {
    bot: 'بات بررسی رسید ایمن یاب',
    decision,
    confidence,
    issues: [...new Set(issues)],
    checks,
    adminSummary,
    customerHint,
    visualKind: visual.kind,
    declaredAmount: amount,
    last4: cardLast4,
    fingerprint: mark,
    checkedAt: new Date().toISOString(),
  }
}

export const botDecisionLabel = {
  approved: 'تایید خودکار بات',
  rejected: 'رد خودکار بات',
  needs_review: 'نیاز به بررسی ادمین',
}
