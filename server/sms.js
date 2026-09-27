import { deliveryLine, honorific } from '../src/utils/honorific.js'
import { update } from './db.js'

const TEMPLATES = {
  order_created: (order) =>
    order.paymentMethod === 'zarinpal'
      ? `${honorific(order.title, order.customerName)}\nسفارش ${order.id} ثبت شد. برای پرداخت آنلاین وارد صفحه سفارش شوید.\nایمنی مهدی`
      : `${honorific(order.title, order.customerName)}\nسفارش ${order.id} ثبت شد. مبلغ را کارت‌به‌کارت واریز و رسید را در پنل بارگذاری کنید.\nایمنی مهدی`,
  payment_paid: (order) =>
    `${honorific(order.title, order.customerName)}\nپرداخت سفارش ${order.id} با موفقیت تایید شد${order.payment?.refId ? ` (رسید ${order.payment.refId})` : ''}. سفارش در حال آماده‌سازی است.\nایمنی مهدی`,
  receipt_review: (order) =>
    `${honorific(order.title, order.customerName)}\nرسید سفارش ${order.id} دریافت شد و در حال بررسی است.\nایمنی مهدی`,
  receipt_approved: (order) =>
    `${honorific(order.title, order.customerName)}\nرسید سفارش ${order.id} تایید شد و فاکتور شما در حال آماده‌سازی است.\n${deliveryLine(order)}\nایمنی مهدی`,
  receipt_rejected: (order) =>
    `${honorific(order.title, order.customerName)}\nرسید سفارش ${order.id} تایید نشد. لطفاً رسید صحیح را دوباره ارسال کنید.\nایمنی مهدی`,
  shipped: (order) =>
    `${honorific(order.title, order.customerName)}\nسفارش ${order.id} ارسال شد (${order.shipping?.name || 'پیک'}).\n${deliveryLine(order)}\nایمنی مهدی`,
  delivered: (order) =>
    `${honorific(order.title, order.customerName)}\nسفارش ${order.id} تحویل شد. از خرید شما سپاسگزاریم.\nایمنی مهدی`,
  admin_receipt: (order) => {
    const bot = order.botResult
    const decision = bot?.decision === 'rejected' ? 'رد بات' : 'نیاز به بررسی'
    const summary = bot?.adminSummary || 'فیدبک بات موجود نیست'
    const conf = bot?.confidence ? ` · اطمینان ${Math.round(bot.confidence * 100)}٪` : ''
    return `رسید سفارش ${order.id} از ${honorific(order.title, order.customerName)}\nوضعیت بات: ${decision}${conf}\n${summary}`
  },
  admin_lead: (lead) => `شماره جدید از فوتر: ${lead.phone}`,
  otp_login: (payload) =>
    `کد ورود ایمنی مهدی: ${payload.code}\nاین کد تا ۲ دقیقه معتبر است.`,
}

export function normalizePhone(value) {
  const digits = String(value || '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
  if (digits.startsWith('98') && digits.length === 12) return `0${digits.slice(2)}`
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`
  return digits
}

export function renderSms(event, payload) {
  const build = TEMPLATES[event]
  return build ? build(payload) : ''
}

export async function sendSms({ event, phone, payload }) {
  const message = renderSms(event, payload)
  const receptor = normalizePhone(phone)
  const row = {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    event,
    phone: receptor,
    message,
    status: 'queued',
    error: '',
    createdAt: new Date().toISOString(),
  }

  if (!message || !/^09\d{9}$/.test(receptor)) {
    row.status = 'skipped'
    row.error = 'شماره یا متن نامعتبر'
    persistLog(row)
    return row
  }

  const apiKey = process.env.KAVENEGAR_API_KEY
  if (!apiKey) {
    row.status = 'logged'
    persistLog(row)
    console.log(`[sms:${event}] ${receptor}\n${message}\n`)
    return row
  }

  try {
    const url = new URL(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json`)
    url.searchParams.set('receptor', receptor)
    url.searchParams.set('message', message)
    if (process.env.KAVENEGAR_SENDER) url.searchParams.set('sender', process.env.KAVENEGAR_SENDER)
    const res = await fetch(url)
    const body = await res.json().catch(() => ({}))
    row.status = res.ok ? 'sent' : 'failed'
    row.error = res.ok ? '' : JSON.stringify(body).slice(0, 300)
  } catch (err) {
    row.status = 'failed'
    row.error = err.message
  }
  persistLog(row)
  return row
}

function persistLog(row) {
  update((db) => {
    db.smsLog = [row, ...(db.smsLog || [])].slice(0, 300)
  })
}

export async function notifyOrder(event, order) {
  return sendSms({ event, phone: order.phone, payload: order })
}

export async function notifyAdmin(event, payload) {
  const phone = process.env.ADMIN_NOTIFY_PHONE
  if (!phone) return null
  return sendSms({ event, phone, payload })
}
