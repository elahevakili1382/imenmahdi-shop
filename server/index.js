import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { inspectReceipt } from './receiptBot.js'
import { ensureDirs, load, update, uploadDir, rememberReceipt } from './db.js'
import { normalizePhone, notifyAdmin, notifyOrder, sendSms } from './sms.js'
import { defaultShippingSettings, getShipping as catalogShipping, slotLabel } from '../src/data/shipping.js'
import { shopBank } from '../src/data/bank.js'
import { ORDER_STATUS } from '../src/data/orderStatus.js'
import { products as catalogProducts } from '../src/data/catalog.js'
import { isStrongPassword, PASSWORD_HINT } from '../src/utils/password.js'
import {
  zarinpalConfigured,
  zarinpalIsPaidCode,
  zarinpalRequest,
  zarinpalStartPayUrl,
  zarinpalVerify,
} from './zarinpal.js'

const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET = String(process.env.JWT_SECRET || '').trim()
if (!JWT_SECRET || JWT_SECRET === 'imenmahdi-dev-secret') {
  throw new Error(
    'JWT_SECRET در .env تنظیم نشده یا ناامن است. سرور بدون JWT_SECRET قوی بالا نمی‌آید.',
  )
}
const SESSION_MS = 8 * 60 * 60 * 1000
const API_PUBLIC_URL = String(process.env.API_PUBLIC_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, '')
const FRONTEND_URL = String(process.env.FRONTEND_URL || 'http://127.0.0.1:5173/imenmahdi-shop').replace(/\/$/, '')
const ZARINPAL_CURRENCY = process.env.ZARINPAL_CURRENCY === 'IRR' ? 'IRR' : 'IRT'
const receiptDir = path.join(uploadDir, 'receipts')
const locks = new Map()
const otps = new Map()
const OTP_TTL_MS = 2 * 60 * 1000
const OTP_RESEND_MS = 60 * 1000

function frontendOrigin(url) {
  try {
    return new URL(url).origin
  } catch {
    return ''
  }
}

const corsOrigins = [
  ...new Set(
    [
      frontendOrigin(FRONTEND_URL),
      ...String(process.env.CORS_ORIGINS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ].filter(Boolean),
  ),
]

ensureDirs()
fs.mkdirSync(receiptDir, { recursive: true })
seedUsers()
seedProducts()

const app = express()
app.use(
  cors({
    origin(origin, callback) {
      // درخواست‌های بدون Origin (مثل curl / پروکسی سرور به سرور) مجازند
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '64mb' }))
// عکس محصول عمومی است؛ مسیر رسیدها را مسدود کن
app.use('/uploads', (req, res, next) => {
  const safe = decodeURIComponent(String(req.path || '')).toLowerCase()
  if (safe.includes('receipt') || safe.includes('..')) {
    return res.status(404).json({ message: 'یافت نشد.' })
  }
  return next()
}, express.static(uploadDir))

function uniqueId(prefix) {
  const n = String(Math.floor(1e7 + Math.random() * 9e7))
  if (prefix === 'IM') return n
  return `${prefix}-${n.slice(0, 6)}`
}

function seedUsers() {
  const allowDemo = String(process.env.ALLOW_DEMO_ADMIN || '').toLowerCase() === 'true'
  if (!allowDemo) return
  const phone = normalizePhone(process.env.ADMIN_SEED_PHONE || '')
  const password = String(process.env.ADMIN_SEED_PASSWORD || '')
  if (!phone || !isStrongPassword(password)) {
    console.warn(
      'ALLOW_DEMO_ADMIN=true است ولی ADMIN_SEED_PHONE / ADMIN_SEED_PASSWORD معتبر نیست — seed ادمین انجام نشد.',
    )
    return
  }
  update((db) => {
    if (db.users.some((item) => item.role === 'admin')) return
    db.users.push({
      id: 'admin-demo',
      name: String(process.env.ADMIN_SEED_NAME || 'مدیر فروشگاه').trim() || 'مدیر فروشگاه',
      title: 'آقا',
      phone,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'admin',
      company: 'ایمنی مهدی',
      city: 'تهران',
      address: '',
    })
    console.warn('ادمین دمو از env ساخته شد. قبل از پروداکشن ALLOW_DEMO_ADMIN را خاموش کنید.')
  })
}

/** یک‌بار کاتالوگ را در دیتابیس می‌ریزد؛ بعد از آن حذف/اضافه ادمین منبع حقیقت است */
function seedProducts() {
  update((db) => {
    const meta = db.meta && typeof db.meta === 'object' ? db.meta : {}
    if (meta.productsSeeded) return
    const removed = new Set((meta.removedProductIds || []).map(String))
    if (!Array.isArray(db.products) || db.products.length === 0) {
      db.products = catalogProducts
        .filter((item) => !removed.has(String(item.id)))
        .map((item) => ({ ...item }))
    } else if (removed.size) {
      db.products = db.products.filter((item) => item?.id && !removed.has(String(item.id)))
    }
    db.meta = { ...meta, productsSeeded: true }
  })
}

function publicUser(user) {
  if (!user) return null
  return Object.fromEntries(Object.entries(user).filter(([key]) => key !== 'passwordHash'))
}

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
}

function auth(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'وارد شوید.' })
  try {
    req.auth = jwt.verify(token, JWT_SECRET)
    const db = load()
    req.user = db.users.find((item) => item.id === req.auth.id)
    if (!req.user) return res.status(401).json({ message: 'نشست نامعتبر است.' })
    next()
  } catch {
    res.status(401).json({ message: 'نشست منقضی شده است.' })
  }
}

function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'دسترسی مدیر لازم است.' })
  next()
}

function resolveShipping(id) {
  const base = catalogShipping(id)
  if (id === 'tehran-courier' || id === 'tehran-express') {
    return { ...base, price: 0, payOnDelivery: true }
  }
  return base
}

function withDelivery(order) {
  const settings = { ...defaultShippingSettings, ...(load().shipping || {}) }
  const slots = Array.isArray(settings.tehranSlots) ? settings.tehranSlots : defaultShippingSettings.tehranSlots
  return {
    ...order,
    deliverySlotLabel: slotLabel(order.deliverySlot, slots),
  }
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(.+);base64,(.+)$/)
  if (!match) return null
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') }
}

function saveUpload(dataUrl, prefix = 'file') {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return ''
  const ext = parsed.mime.includes('png') ? 'png' : parsed.mime.includes('webp') ? 'webp' : 'jpg'
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  fs.writeFileSync(path.join(uploadDir, filename), parsed.buffer)
  return `/uploads/${filename}`
}

function saveReceipt(dataUrl) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return ''
  fs.mkdirSync(receiptDir, { recursive: true })
  const ext = parsed.mime.includes('png') ? 'png' : parsed.mime.includes('webp') ? 'webp' : 'jpg'
  const filename = `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  fs.writeFileSync(path.join(receiptDir, filename), parsed.buffer)
  // مسیر خصوصی — فقط از route احراز هویت‌شده قابل دانلود است
  return `receipts/${filename}`
}

function materializeImageSrc(src, prefix = 'product') {
  const value = String(src || '')
  if (!value) return ''
  if (value.startsWith('/uploads/')) return value
  if (value.startsWith('data:')) return saveUpload(value, prefix) || value
  return value
}

function materializeProductImages(product) {
  if (!product || typeof product !== 'object') return product
  const idHint = String(product.id || 'product').replace(/[^\w-]+/g, '').slice(0, 24) || 'product'
  const gallery = [...new Set(
    (Array.isArray(product.gallery) ? product.gallery : [])
      .map((src) => materializeImageSrc(src, idHint))
      .filter(Boolean),
  )]
  const image = materializeImageSrc(product.image, idHint) || gallery[0] || ''
  const nextGallery = gallery.length ? gallery : image ? [image] : []
  return { ...product, image, gallery: nextGallery }
}

function receiptPath(receiptUrl) {
  const value = String(receiptUrl || '')
  if (!value || value.startsWith('data:')) return ''
  const name = path.basename(value)
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return ''
  const privatePath = path.join(receiptDir, name)
  if (fs.existsSync(privatePath)) return privatePath
  // سازگاری با رسیدهای قدیمی که در /uploads عمومی بودند
  const legacy = path.join(uploadDir, name)
  if (fs.existsSync(legacy)) return legacy
  return privatePath
}

function unitSalePrice(product) {
  if (!product || product.priceOnRequest) return null
  const price = Math.max(0, Number(product.price) || 0)
  const discount = Math.min(100, Math.max(0, Math.round(Number(product.discountPercent) || 0)))
  if (!discount) return price
  return Math.max(0, Math.round((price * (100 - discount)) / 100))
}

function buildPricedItems(db, rawItems) {
  const byId = new Map((db.products || []).map((item) => [String(item.id), item]))
  const items = []
  for (const raw of Array.isArray(rawItems) ? rawItems : []) {
    const id = String(raw?.id || '')
    const product = byId.get(id)
    if (!product) {
      const error = new Error(`محصول نامعتبر در سبد: ${id || '—'}`)
      error.status = 400
      throw error
    }
    const price = unitSalePrice(product)
    if (price == null) {
      const error = new Error(`«${product.title}» فقط با تماس قابل سفارش است.`)
      error.status = 400
      throw error
    }
    const quantity = Math.min(99, Math.max(1, Math.round(Number(raw?.quantity) || 1)))
    const sizes = Array.isArray(product.sizes)
      ? product.sizes.map((item) => String(item || '').trim()).filter(Boolean)
      : []
    let size = String(raw?.size || '').trim()
    if (sizes.length) {
      if (!sizes.includes(size)) {
        const error = new Error(`سایز نامعتبر برای «${product.title}».`)
        error.status = 400
        throw error
      }
    } else {
      size = ''
    }
    const color = String(raw?.color || '').trim()
    items.push({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      badge: product.badge || '',
      size,
      color: color || undefined,
      quantity,
      price,
    })
  }
  if (!items.length) {
    const error = new Error('سبد خالی است.')
    error.status = 400
    throw error
  }
  return items
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'imenmahdi-api' })
})

app.post('/api/uploads', auth, admin, (req, res) => {
  const dataUrl = req.body?.dataUrl || req.body?.image || ''
  if (!String(dataUrl).startsWith('data:')) {
    return res.status(400).json({ message: 'تصویر معتبر نیست.' })
  }
  try {
    const url = saveUpload(dataUrl, String(req.body?.prefix || 'product').replace(/[^\w-]+/g, '').slice(0, 24) || 'product')
    if (!url) return res.status(400).json({ message: 'ذخیره عکس انجام نشد.' })
    res.json({ url })
  } catch (err) {
    res.status(500).json({ message: err?.message || 'آپلود عکس انجام نشد.' })
  }
})

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim()
  const phone = String(req.body.phone || '').trim()
  const password = String(req.body.password || '')
  const title = req.body.title === 'خانم' ? 'خانم' : 'آقا'
  if (!name || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'نام و موبایل معتبر لازم است.' })
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: PASSWORD_HINT })
  }
  try {
    const user = update((db) => {
      if (db.users.some((item) => item.phone === phone)) throw new Error('این شماره قبلاً ثبت شده است.')
      const created = {
        id: uniqueId('user'),
        name,
        title,
        phone,
        passwordHash: bcrypt.hashSync(password, 10),
        role: 'customer',
        company: '',
        city: '',
        address: '',
      }
      db.users.push(created)
      return created
    })
    res.json({ token: sign(user), user: publicUser(user), startedAt: Date.now() })
  } catch (err) {
    res.status(409).json({ message: err.message })
  }
})

app.post('/api/auth/login', (req, res) => {
  const phone = normalizePhone(req.body.phone)
  const password = String(req.body.password || '')
  const expectedRole = req.body.expectedRole
  const lock = locks.get(phone)
  if (lock?.until > Date.now()) {
    return res.status(429).json({ message: 'ورود موقتاً قفل است.' })
  }
  const db = load()
  const found = db.users.find((item) => normalizePhone(item.phone) === phone)
  const ok = found && found.passwordHash && bcrypt.compareSync(password, found.passwordHash)
  if (!ok || (expectedRole && found.role !== expectedRole)) {
    const attempts = (lock?.attempts || 0) + 1
    locks.set(phone, { attempts, until: attempts >= 5 ? Date.now() + 10 * 60 * 1000 : 0 })
    return res.status(401).json({ message: 'شماره یا رمز عبور نادرست است.' })
  }
  locks.delete(phone)
  res.json({ token: sign(found), user: publicUser(found), startedAt: Date.now() })
})

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: publicUser(req.user), startedAt: Date.now() - SESSION_MS / 8 })
})

app.post('/api/auth/otp/request', async (req, res) => {
  const phone = normalizePhone(req.body.phone)
  if (!/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'شماره موبایل را با ۰۹ و ۱۱ رقم وارد کنید.' })
  }
  const prev = otps.get(phone)
  if (prev && Date.now() - prev.sentAt < OTP_RESEND_MS) {
    return res.status(429).json({ message: 'کد قبلاً ارسال شده. یک دقیقه بعد دوباره تلاش کنید.' })
  }
  const code = String(Math.floor(10000 + Math.random() * 90000))
  otps.set(phone, {
    code,
    expires: Date.now() + OTP_TTL_MS,
    attempts: 0,
    sentAt: Date.now(),
    verified: false,
  })
  const row = await sendSms({ event: 'otp_login', phone, payload: { code } })
  if (row.status === 'failed') {
    return res.status(502).json({ message: 'ارسال پیامک انجام نشد. دوباره تلاش کنید.' })
  }
  res.json({
    ok: true,
    expiresIn: 120,
    delivery: row.status === 'sent' ? 'sms' : 'log',
  })
})

app.post('/api/auth/otp/verify', (req, res) => {
  const phone = normalizePhone(req.body.phone)
  const code = String(req.body.code || '').trim()
  const entry = otps.get(phone)
  if (!entry || entry.expires < Date.now()) {
    return res.status(400).json({ message: 'کد منقضی شده است. دوباره درخواست کنید.' })
  }
  if (!entry.verified) {
    if (entry.attempts >= 5) {
      return res.status(429).json({ message: 'تعداد تلاش بیش از حد است. کد جدید بگیرید.' })
    }
    if (entry.code !== code) {
      entry.attempts += 1
      return res.status(401).json({ message: 'کد تایید نادرست است.' })
    }
    entry.verified = true
  }

  const existing = load().users.find((item) => item.phone === phone)
  if (!existing) {
    const name = String(req.body.name || '').trim()
    const title = req.body.title === 'خانم' ? 'خانم' : 'آقا'
    if (!name) return res.json({ needsProfile: true, phone })
    const user = update((db) => {
      const created = {
        id: uniqueId('user'),
        name,
        title,
        phone,
        passwordHash: bcrypt.hashSync(uniqueId('otp'), 10),
        role: 'customer',
        company: '',
        city: '',
        address: '',
      }
      db.users.push(created)
      return created
    })
    otps.delete(phone)
    return res.json({ token: sign(user), user: publicUser(user), startedAt: Date.now() })
  }

  otps.delete(phone)
  res.json({ token: sign(existing), user: publicUser(existing), startedAt: Date.now() })
})

app.put('/api/auth/profile', auth, (req, res) => {
  const allowed = ['name', 'title', 'company', 'city', 'address']
  const user = update((db) => {
    const current = db.users.find((item) => item.id === req.user.id)
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) current[key] = req.body[key]
    })
    if (current.title !== 'خانم') current.title = 'آقا'
    return current
  })
  res.json({ user: publicUser(user) })
})

app.put('/api/auth/credentials', auth, (req, res) => {
  const phone = normalizePhone(req.body.phone)
  const password = req.body.password ? String(req.body.password) : ''
  const currentPassword = String(req.body.currentPassword || '')

  if (!/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'شماره موبایل معتبر نیست.' })
  }
  if (!currentPassword) {
    return res.status(400).json({ message: 'رمز فعلی را وارد کنید.' })
  }
  if (password && !isStrongPassword(password)) {
    return res.status(400).json({ message: PASSWORD_HINT })
  }

  try {
    const user = update((db) => {
      const current = db.users.find((item) => item.id === req.user.id)
      if (!current) {
        const error = new Error('کاربر پیدا نشد.')
        error.status = 404
        throw error
      }
      if (!current.passwordHash || !bcrypt.compareSync(currentPassword, current.passwordHash)) {
        const error = new Error('رمز فعلی نادرست است.')
        error.status = 401
        throw error
      }
      if (db.users.some((item) => normalizePhone(item.phone) === phone && item.id !== current.id)) {
        const error = new Error('این شماره قبلاً ثبت شده است.')
        error.status = 409
        throw error
      }
      current.phone = phone
      if (password) current.passwordHash = bcrypt.hashSync(password, 10)
      return current
    })
    res.json({ token: sign(user), user: publicUser(user) })
  } catch (err) {
    const status = Number(err.status) || 400
    res.status(status).json({ message: err.message || 'ذخیره اطلاعات ورود انجام نشد.' })
  }
})

app.get('/api/orders', auth, (req, res) => {
  const db = load()
  const list = req.user.role === 'admin' ? db.orders : db.orders.filter((item) => item.userId === req.user.id)
  res.json(list)
})

app.get('/api/orders/:id', auth, (req, res) => {
  const order = load().orders.find((item) => item.id === req.params.id)
  if (!order) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ message: 'دسترسی ندارید.' })
  }
  res.json(order)
})

app.post('/api/orders', auth, async (req, res) => {
  const shipping = resolveShipping(req.body.shippingId)
  const wantGateway = req.body.paymentMethod !== 'card' && zarinpalConfigured()
  const paymentMethod = wantGateway ? 'zarinpal' : 'card'
  let order
  try {
    order = update((db) => {
      // قیمت و جمع فقط از دیتابیس — ورودی کلاینت برای مبلغ قابل اعتماد نیست
      const items = buildPricedItems(db, req.body.items)
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const created = {
        id: uniqueId('IM'),
        userId: req.user.id,
        customerName: req.user.name,
        title: req.user.title || 'آقا',
        company: req.user.company || '',
        phone: req.user.phone,
        city: req.body.city || req.user.city || '',
        address: req.body.address || req.user.address || '',
        destination: req.body.destination || 'county',
        deliveryDate: req.body.deliveryDate || '',
        deliverySlot: req.body.deliverySlot || '',
        shipping,
        items,
        subtotal,
        shippingPrice: shipping.price,
        total: subtotal + shipping.price,
        status: paymentMethod === 'zarinpal' ? ORDER_STATUS.AWAITING_PAYMENT : ORDER_STATUS.AWAITING_RECEIPT,
        paymentMethod,
        payment: null,
        bank: shopBank,
        receiptUrl: '',
        receiptName: '',
        receiptFingerprint: '',
        botResult: null,
        createdAt: new Date().toISOString(),
        note: req.body.note || '',
        adminNote: '',
      }
      db.orders.unshift(created)
      return created
    })
  } catch (err) {
    const status = Number(err.status) || 400
    return res.status(status).json({ message: err.message || 'ثبت سفارش انجام نشد.' })
  }
  notifyOrder('order_created', withDelivery(order)).catch(() => {})
  res.status(201).json(order)
})

/**
 * شروع پرداخت زرین‌پال برای سفارش
 * مرحله ۱ داک: request.json → authority
 * مرحله ۲: StartPay/{authority}
 */
app.post('/api/orders/:id/pay/zarinpal', auth, async (req, res) => {
  if (!zarinpalConfigured()) {
    return res.status(503).json({ message: 'درگاه زرین‌پال هنوز پیکربندی نشده است.' })
  }
  const current = load().orders.find((item) => item.id === req.params.id)
  if (!current) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  if (req.user.role !== 'admin' && current.userId !== req.user.id) {
    return res.status(403).json({ message: 'دسترسی ندارید.' })
  }
  if (current.payment?.refId || current.status === ORDER_STATUS.PREPARING) {
    return res.status(409).json({ message: 'این سفارش قبلاً پرداخت شده است.' })
  }
  if (![ORDER_STATUS.AWAITING_PAYMENT, ORDER_STATUS.AWAITING_RECEIPT, ORDER_STATUS.REJECTED].includes(current.status)) {
    return res.status(400).json({ message: 'این سفارش قابل پرداخت آنلاین نیست.' })
  }

  const amount = Math.round(Number(current.total) || 0)
  if (amount < 1000) {
    return res.status(400).json({ message: 'مبلغ سفارش برای درگاه معتبر نیست.' })
  }

  const callbackUrl = `${API_PUBLIC_URL}/api/payments/zarinpal/callback`
  let result
  try {
    result = await zarinpalRequest({
      amount,
      currency: ZARINPAL_CURRENCY,
      description: `پرداخت سفارش ${current.id} — ایمن یاب`,
      callbackUrl,
      mobile: current.phone,
      orderId: current.id,
    })
  } catch (err) {
    return res.status(502).json({ message: err.message || 'ارتباط با زرین‌پال برقرار نشد.' })
  }

  const code = Number(result?.data?.code)
  const authority = result?.data?.authority
  if (code !== 100 || !authority) {
    const message =
      result?.errors?.message ||
      result?.errors?.[0]?.message ||
      result?.data?.message ||
      'درخواست پرداخت از زرین‌پال رد شد.'
    return res.status(400).json({ message, zarinpal: result })
  }

  update((db) => {
    const order = db.orders.find((item) => item.id === req.params.id)
    if (!order) return null
    order.paymentMethod = 'zarinpal'
    order.status = ORDER_STATUS.AWAITING_PAYMENT
    order.payment = {
      provider: 'zarinpal',
      authority,
      amount,
      currency: ZARINPAL_CURRENCY,
      requestedAt: new Date().toISOString(),
      status: 'requested',
      refId: null,
      cardPan: null,
      fee: result?.data?.fee ?? null,
      feeType: result?.data?.fee_type || null,
    }
    return order
  })

  res.json({
    authority,
    paymentUrl: zarinpalStartPayUrl(authority),
    amount,
    currency: ZARINPAL_CURRENCY,
  })
})

/**
 * بازگشت از درگاه — QueryString: Authority و Status (OK|NOK)
 * طبق داک: فقط وقتی Status=OK متد verify صدا زده می‌شود.
 */
app.get('/api/payments/zarinpal/callback', async (req, res) => {
  const status = String(req.query.Status || req.query.status || '')
  const authority = String(req.query.Authority || req.query.authority || '')

  const fail = (reason) => {
    const q = new URLSearchParams({ payment: 'fail', reason: reason || 'nok' })
    if (authority) q.set('authority', authority)
    return res.redirect(`${FRONTEND_URL}/orders?${q.toString()}`)
  }

  if (!authority) return fail('missing_authority')

  const current = load().orders.find((item) => item.payment?.authority === authority)
  if (status.toUpperCase() !== 'OK') {
    if (current) {
      return res.redirect(`${FRONTEND_URL}/orders/${current.id}/pay?payment=fail&reason=cancelled`)
    }
    return fail('cancelled')
  }

  if (!current) return fail('order_not_found')

  const amount = Math.round(Number(current.payment?.amount || current.total) || 0)
  let result
  try {
    result = await zarinpalVerify({ amount, authority })
  } catch {
    return res.redirect(`${FRONTEND_URL}/orders/${current.id}/pay?payment=fail&reason=verify_network`)
  }

  const code = Number(result?.data?.code)
  if (!zarinpalIsPaidCode(code)) {
    update((db) => {
      const order = db.orders.find((item) => item.id === current.id)
      if (!order) return null
      order.payment = {
        ...(order.payment || {}),
        status: 'failed',
        verifyCode: code,
        verifyMessage: result?.data?.message || result?.errors?.message || '',
        verifiedAt: new Date().toISOString(),
      }
      return order
    })
    return res.redirect(`${FRONTEND_URL}/orders/${current.id}/pay?payment=fail&reason=verify_${code || 'error'}`)
  }

  const next = update((db) => {
    const order = db.orders.find((item) => item.id === current.id)
    if (!order) return null
    // اگر قبلاً با code 100 تایید شده، 101 را هم موفق حساب می‌کنیم (طبق داک)
    if (order.payment?.refId && order.status === ORDER_STATUS.PREPARING) return order
    order.payment = {
      ...(order.payment || {}),
      provider: 'zarinpal',
      authority,
      amount,
      status: 'paid',
      verifyCode: code,
      refId: result?.data?.ref_id ?? order.payment?.refId,
      cardPan: result?.data?.card_pan || null,
      cardHash: result?.data?.card_hash || null,
      fee: result?.data?.fee ?? null,
      feeType: result?.data?.fee_type || null,
      verifiedAt: new Date().toISOString(),
    }
    order.paymentMethod = 'zarinpal'
    order.status = ORDER_STATUS.PREPARING
    order.adminNote = order.adminNote || `پرداخت آنلاین زرین‌پال · رسید ${order.payment.refId}`
    return order
  })

  if (next && code === 100) {
    notifyOrder('payment_paid', withDelivery(next)).catch(() => {})
  }

  return res.redirect(`${FRONTEND_URL}/orders/${current.id}/pay?payment=ok&ref=${encodeURIComponent(next?.payment?.refId || '')}`)
})

app.get('/api/payments/zarinpal/status', auth, (_req, res) => {
  res.json({
    configured: zarinpalConfigured(),
    sandbox: String(process.env.ZARINPAL_SANDBOX || '').toLowerCase() === 'true',
    currency: ZARINPAL_CURRENCY,
  })
})

app.post('/api/orders/:id/receipt', auth, async (req, res) => {
  const current = load().orders.find((item) => item.id === req.params.id)
  if (!current) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  if (req.user.role !== 'admin' && current.userId !== req.user.id) {
    return res.status(403).json({ message: 'دسترسی ندارید.' })
  }

  const parsed = parseDataUrl(req.body.dataUrl)
  const receiptUrl = parsed ? saveReceipt(req.body.dataUrl) : current.receiptUrl
  let buffer = parsed?.buffer
  if (!buffer && current.receiptUrl) {
    const disk = receiptPath(current.receiptUrl)
    if (disk && fs.existsSync(disk)) buffer = fs.readFileSync(disk)
  }
  if (!buffer) return res.status(400).json({ message: 'تصویر رسید به سرور نرسید.' })

  const botResult = await inspectReceipt({
    buffer,
    fileName: req.body.name || current.receiptName || '',
    fileSize: buffer.length,
    mime: parsed?.mime || '',
    declaredAmount: current.total,
    last4: req.body.last4,
    order: current,
  })
  if (botResult.decision === 'approved') botResult.decision = 'needs_review'

  const next = update((db) => {
    const order = db.orders.find((item) => item.id === req.params.id)
    if (!order) return null
    order.receiptUrl = receiptUrl || order.receiptUrl
    order.receiptName = req.body.name || order.receiptName
    order.receiptFingerprint = botResult.fingerprint
    order.botResult = botResult
    order.status = botResult.decision === 'rejected' ? ORDER_STATUS.REJECTED : ORDER_STATUS.AWAITING_REVIEW
    return order
  })
  if (!next) return res.status(404).json({ message: 'سفارش پیدا نشد.' })

  if (botResult.decision === 'rejected') {
    rememberReceipt({
      phash: botResult.phash,
      sha256: botResult.sha256,
      verdict: 'fake',
      orderId: next.id,
      notes: botResult.visualKind || 'auto-reject',
    })
    notifyOrder('receipt_rejected', withDelivery(next)).catch(() => {})
  } else {
    notifyOrder('receipt_review', withDelivery(next)).catch(() => {})
    notifyAdmin('admin_receipt', withDelivery(next)).catch(() => {})
  }
  res.json(next)
})

app.get('/api/orders/:id/receipt/file', auth, (req, res) => {
  const order = load().orders.find((item) => item.id === req.params.id)
  if (!order) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ message: 'دسترسی ندارید.' })
  }
  const disk = receiptPath(order.receiptUrl)
  if (!disk || !fs.existsSync(disk)) {
    return res.status(404).json({ message: 'فایل رسید پیدا نشد.' })
  }
  const ext = path.extname(disk).toLowerCase()
  const type =
    ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg'
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('Content-Type', type)
  res.sendFile(path.resolve(disk))
})

app.post('/api/orders/:id/receipt/recheck', auth, admin, async (req, res) => {
  const current = load().orders.find((item) => item.id === req.params.id)
  if (!current) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  const disk = receiptPath(current.receiptUrl)
  if (!disk || !fs.existsSync(disk)) {
    return res.status(400).json({ message: 'فایل رسید روی سرور نیست.' })
  }
  const buffer = fs.readFileSync(disk)
  const botResult = await inspectReceipt({
    buffer,
    fileName: current.receiptName || '',
    fileSize: buffer.length,
    declaredAmount: req.body.declaredAmount || current.botResult?.declaredAmount || current.total,
    last4: req.body.last4 || current.botResult?.last4 || '',
    order: current,
  })
  if (botResult.decision === 'approved') botResult.decision = 'needs_review'
  const next = update((db) => {
    const order = db.orders.find((item) => item.id === req.params.id)
    if (!order) return null
    order.botResult = botResult
    order.receiptFingerprint = botResult.fingerprint
    if (botResult.decision === 'rejected' && order.status === ORDER_STATUS.AWAITING_REVIEW) {
      order.status = ORDER_STATUS.REJECTED
    }
    return order
  })
  if (botResult.decision === 'rejected') {
    rememberReceipt({
      phash: botResult.phash,
      sha256: botResult.sha256,
      verdict: 'fake',
      orderId: next.id,
      notes: 'recheck',
    })
    notifyOrder('receipt_rejected', withDelivery(next)).catch(() => {})
  }
  res.json(next)
})

app.post('/api/orders/:id/review', auth, admin, async (req, res) => {
  const next = update((db) => {
    const order = db.orders.find((item) => item.id === req.params.id)
    if (!order) return null
    order.adminNote = req.body.adminNote || ''
    order.status = req.body.approved ? ORDER_STATUS.PREPARING : ORDER_STATUS.REJECTED
    return order
  })
  if (!next) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  rememberReceipt({
    phash: next.botResult?.phash,
    sha256: next.botResult?.sha256,
    verdict: req.body.approved ? 'genuine' : 'fake',
    orderId: next.id,
    notes: req.body.adminNote || (req.body.approved ? 'admin-approved' : 'admin-rejected'),
  })
  notifyOrder(next.status === ORDER_STATUS.PREPARING ? 'receipt_approved' : 'receipt_rejected', withDelivery(next)).catch(
    () => {},
  )
  res.json(next)
})

app.patch('/api/orders/:id/status', auth, admin, async (req, res) => {
  const status = req.body.status
  if (!Object.values(ORDER_STATUS).includes(status)) {
    return res.status(400).json({ message: 'وضعیت نامعتبر است.' })
  }
  const next = update((db) => {
    const order = db.orders.find((item) => item.id === req.params.id)
    if (!order) return null
    order.status = status
    return order
  })
  if (!next) return res.status(404).json({ message: 'سفارش پیدا نشد.' })
  if (status === ORDER_STATUS.PREPARING) notifyOrder('receipt_approved', withDelivery(next)).catch(() => {})
  if (status === ORDER_STATUS.REJECTED) notifyOrder('receipt_rejected', withDelivery(next)).catch(() => {})
  if (status === ORDER_STATUS.SHIPPED) notifyOrder('shipped', withDelivery(next)).catch(() => {})
  if (status === ORDER_STATUS.DELIVERED) notifyOrder('delivered', withDelivery(next)).catch(() => {})
  res.json(next)
})

app.get('/api/products', (_req, res) => {
  const db = load()
  const removed = new Set((db.meta?.removedProductIds || []).map(String))
  const products = (db.products || []).filter((item) => item?.id && !removed.has(String(item.id)))
  res.json(products)
})

app.put('/api/products/:id', auth, admin, (req, res) => {
  const id = String(req.params.id || '')
  if (!id) return res.status(400).json({ message: 'شناسه محصول لازم است.' })
  const product = update((db) => {
    if (!Array.isArray(db.products)) db.products = []
    const body = req.body && typeof req.body === 'object' ? materializeProductImages({ ...req.body, id }) : { id }
    const idx = db.products.findIndex((item) => String(item?.id) === id)
    if (idx >= 0) db.products[idx] = { ...db.products[idx], ...body, id }
    else db.products.unshift(body)
    const prevRemoved = Array.isArray(db.meta?.removedProductIds) ? db.meta.removedProductIds.map(String) : []
    db.meta = {
      ...(db.meta && typeof db.meta === 'object' ? db.meta : {}),
      productsSeeded: true,
      // ثبت مجدد محصول یعنی از لیست حذف‌شده‌ها خارج شود
      removedProductIds: prevRemoved.filter((item) => item !== id),
    }
    const nextIdx = db.products.findIndex((item) => String(item?.id) === id)
    return db.products[nextIdx >= 0 ? nextIdx : 0]
  })
  res.json(product)
})

app.delete('/api/products/:id', auth, admin, (req, res) => {
  const id = String(req.params.id || '')
  if (!id) return res.status(400).json({ message: 'شناسه محصول لازم است.' })
  update((db) => {
    db.products = (db.products || []).filter((item) => String(item?.id) !== id)
    const prevRemoved = Array.isArray(db.meta?.removedProductIds) ? db.meta.removedProductIds : []
    const removedProductIds = [...new Set([...prevRemoved.map(String), id])]
    db.meta = {
      ...(db.meta && typeof db.meta === 'object' ? db.meta : {}),
      productsSeeded: true,
      removedProductIds,
    }
    return db.products
  })
  res.json({ ok: true })
})

app.put('/api/products', auth, admin, (req, res) => {
  const products = update((db) => {
    const prevRemoved = Array.isArray(db.meta?.removedProductIds) ? db.meta.removedProductIds.map(String) : []
    const removed = new Set(prevRemoved)
    const incoming = Array.isArray(req.body) ? req.body : db.products
    // محصولات حذف‌شده را از هر همگام‌سازی کامل دوباره زنده نکن
    const list = (incoming || [])
      .filter((item) => item?.id && !removed.has(String(item.id)))
      .map((item) => materializeProductImages(item))
    db.products = list
    const keep = new Set(list.map((item) => String(item?.id || '')).filter(Boolean))
    const catalogIds = (catalogProducts || []).map((item) => String(item.id))
    const newlyRemoved = catalogIds.filter((id) => !keep.has(id))
    db.meta = {
      ...(db.meta && typeof db.meta === 'object' ? db.meta : {}),
      productsSeeded: true,
      removedProductIds: [...new Set([...prevRemoved, ...newlyRemoved])],
    }
    return db.products
  })
  res.json(products)
})

app.get('/api/reviews', (_req, res) => {
  res.json(load().reviews || [])
})

app.post('/api/reviews', auth, (req, res) => {
  try {
    const review = update((db) => {
      if (db.reviews.some((item) => item.orderId === req.body.orderId)) {
        throw new Error('برای این سفارش قبلاً نظر ثبت شده است.')
      }
      const created = {
        id: uniqueId('rev'),
        userId: req.user.id,
        name: req.user.name || 'خریدار',
        city: req.body.city || '',
        product: req.body.product || 'سفارش فروشگاه',
        orderId: req.body.orderId,
        rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
        text: String(req.body.text || '').trim(),
        date: new Date().toLocaleDateString('fa-IR'),
        createdAt: new Date().toISOString(),
        status: 'pending',
      }
      db.reviews.unshift(created)
      return created
    })
    res.status(201).json(review)
  } catch (err) {
    res.status(409).json({ message: err.message })
  }
})

app.patch('/api/reviews/:id', auth, admin, (req, res) => {
  const review = update((db) => {
    const current = db.reviews.find((item) => item.id === req.params.id)
    if (!current) return null
    if (req.body.status) current.status = req.body.status
    return current
  })
  if (!review) return res.status(404).json({ message: 'نظر پیدا نشد.' })
  res.json(review)
})

app.delete('/api/reviews/:id', auth, admin, (req, res) => {
  update((db) => {
    db.reviews = db.reviews.filter((item) => item.id !== req.params.id)
  })
  res.json({ ok: true })
})

app.get('/api/leads', auth, admin, (_req, res) => {
  res.json(load().leads || [])
})

app.post('/api/leads', async (req, res) => {
  const phone = String(req.body.phone || '').replace(/\D/g, '')
  const clean = phone.startsWith('98') ? `0${phone.slice(2)}` : phone.startsWith('9') && phone.length === 10 ? `0${phone}` : phone
  if (!/^09\d{9}$/.test(clean)) return res.status(400).json({ message: 'شماره موبایل معتبر نیست.' })
  const lead = update((db) => {
    const created = {
      id: uniqueId('lead'),
      phone: clean,
      source: req.body.source || 'footer',
      createdAt: new Date().toISOString(),
      duplicate: db.leads.some((item) => item.phone === clean),
    }
    db.leads.unshift(created)
    return created
  })
  notifyAdmin('admin_lead', lead).catch(() => {})
  res.status(201).json(lead)
})

app.delete('/api/leads/:id', auth, admin, (req, res) => {
  update((db) => {
    db.leads = db.leads.filter((item) => item.id !== req.params.id)
  })
  res.json({ ok: true })
})

app.get('/api/content', (_req, res) => {
  const db = load()
  res.json({
    heroSlides: db.heroSlides || [],
    guarantee: db.guarantee,
    shipping: { ...defaultShippingSettings, ...(db.shipping || {}) },
  })
})

app.put('/api/content/hero', auth, admin, (req, res) => {
  const heroSlides = update((db) => {
    db.heroSlides = Array.isArray(req.body) ? req.body : db.heroSlides
    return db.heroSlides
  })
  res.json(heroSlides)
})

app.put('/api/content/guarantee', auth, admin, (req, res) => {
  const guarantee = update((db) => {
    db.guarantee = req.body
    return db.guarantee
  })
  res.json(guarantee)
})

app.put('/api/content/shipping', auth, admin, (req, res) => {
  const shipping = update((db) => {
    const slots = Array.isArray(req.body.tehranSlots)
      ? req.body.tehranSlots
          .map((slot, index) => {
            const label = String(slot?.label || '').trim()
            if (!label) return null
            const id = String(slot?.id || '')
              .trim()
              .replace(/\s+/g, '-')
            return { id: id || `slot-${index + 1}`, label }
          })
          .filter(Boolean)
      : null
    db.shipping = {
      tehranCourierPrice: Math.max(0, Number(req.body.tehranCourierPrice) || 0),
      tehranExpressPrice: Math.max(0, Number(req.body.tehranExpressPrice) || 0),
      tehranSlots: slots?.length ? slots : defaultShippingSettings.tehranSlots,
    }
    return db.shipping
  })
  res.json(shipping)
})

app.get('/api/admin/sms', auth, admin, (_req, res) => {
  res.json(load().smsLog || [])
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Imen Mahdi API on http://127.0.0.1:${PORT} (also reachable on LAN)`)
  console.log(
    process.env.KAVENEGAR_API_KEY
      ? 'SMS: sending via Kavenegar'
      : 'SMS: no Kavenegar key. OTP is printed in this terminal.',
  )
  console.log('Keep this window open. Stop with Ctrl+C.')
})
server.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
