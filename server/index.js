import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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
import { isStrongPassword, PASSWORD_HINT } from '../src/utils/password.js'

const root = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET = process.env.JWT_SECRET || 'imenmahdi-dev-secret'
const SESSION_MS = 8 * 60 * 60 * 1000
const locks = new Map()
const otps = new Map()
const OTP_TTL_MS = 2 * 60 * 1000
const OTP_RESEND_MS = 60 * 1000

ensureDirs()
seedUsers()

const app = express()
app.use(cors())
app.use(express.json({ limit: '8mb' }))
app.use('/uploads', express.static(uploadDir))

function uniqueId(prefix) {
  const n = String(Math.floor(1e7 + Math.random() * 9e7))
  if (prefix === 'IM') return n
  return `${prefix}-${n.slice(0, 6)}`
}

function seedUsers() {
  update((db) => {
    if (db.users.some((item) => item.role === 'admin')) return
    db.users.push({
      id: 'admin-demo',
      name: 'مدیر فروشگاه',
      title: 'آقا',
      phone: '09121111111',
      passwordHash: bcrypt.hashSync('admin', 10),
      role: 'admin',
      company: 'ایمنی مهدی',
      city: 'تهران',
      address: 'میدان حسن‌آباد، خیابان امام خمینی',
    })
  })
}

function publicUser(user) {
  if (!user) return null
  const { passwordHash, ...safe } = user
  return safe
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
  const settings = { ...defaultShippingSettings, ...(load().shipping || {}) }
  if (id === 'tehran-courier') return { ...base, price: Number(settings.tehranCourierPrice) || 0 }
  if (id === 'tehran-express') return { ...base, price: Number(settings.tehranExpressPrice) || 0 }
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

function saveReceipt(dataUrl) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return ''
  const ext = parsed.mime.includes('png') ? 'png' : parsed.mime.includes('webp') ? 'webp' : 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  fs.writeFileSync(path.join(uploadDir, filename), parsed.buffer)
  return `/uploads/${filename}`
}

function receiptPath(receiptUrl) {
  const name = path.basename(String(receiptUrl || ''))
  if (!name) return ''
  return path.join(uploadDir, name)
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'imenmahdi-api' })
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
  const phone = String(req.body.phone || '').trim()
  const password = String(req.body.password || '')
  const expectedRole = req.body.expectedRole
  const lock = locks.get(phone)
  if (lock?.until > Date.now()) {
    return res.status(429).json({ message: 'ورود موقتاً قفل است.' })
  }
  const db = load()
  const found = db.users.find((item) => item.phone === phone)
  const ok = found && bcrypt.compareSync(password, found.passwordHash)
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
  const phone = String(req.body.phone || '').trim()
  const password = req.body.password ? String(req.body.password) : ''
  const currentPassword = String(req.body.currentPassword || '')

  if (!/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ message: 'شماره موبایل معتبر نیست.' })
  }
  if (password && !isStrongPassword(password)) {
    return res.status(400).json({ message: PASSWORD_HINT })
  }

  try {
    const user = update((db) => {
      const current = db.users.find((item) => item.id === req.user.id)
      if (!current) throw new Error('کاربر پیدا نشد.')
      if (!bcrypt.compareSync(currentPassword, current.passwordHash)) {
        throw new Error('رمز فعلی نادرست است.')
      }
      if (db.users.some((item) => item.phone === phone && item.id !== current.id)) {
        throw new Error('این شماره قبلاً ثبت شده است.')
      }
      current.phone = phone
      if (password) current.passwordHash = bcrypt.hashSync(password, 10)
      return current
    })
    res.json({ token: sign(user), user: publicUser(user) })
  } catch (err) {
    const status = err.message.includes('نادرست') ? 401 : err.message.includes('قبلاً') ? 409 : 400
    res.status(status).json({ message: err.message })
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
  const items = Array.isArray(req.body.items) ? req.body.items : []
  if (!items.length) return res.status(400).json({ message: 'سبد خالی است.' })
  const shipping = resolveShipping(req.body.shippingId)
  const subtotal = Number(req.body.subtotal || 0)
  const order = update((db) => {
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
      status: ORDER_STATUS.AWAITING_RECEIPT,
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
  notifyOrder('order_created', withDelivery(order)).catch(() => {})
  res.status(201).json(order)
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
    declaredAmount: req.body.declaredAmount,
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
  res.json(load().products || [])
})

app.put('/api/products', auth, admin, (req, res) => {
  const products = update((db) => {
    db.products = Array.isArray(req.body) ? req.body : db.products
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

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Imen Mahdi API on http://127.0.0.1:${PORT}`)
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
