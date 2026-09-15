import { toNumber } from '@/utils/money'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fingerprint({ name, size, declaredAmount, last4 }) {
  return `${name || ''}-${size || 0}-${declaredAmount}-${last4}`
}

export async function runReceiptBot({
  file,
  dataUrl,
  declaredAmount,
  orderTotal,
  last4,
  existingOrders = [],
  orderId,
}) {
  await wait(800)

  const issues = []
  const amount = toNumber(declaredAmount)
  const total = toNumber(orderTotal)
  const cardLast4 = String(last4 || '').replace(/\D/g, '')

  if (!dataUrl) issues.push('تصویر رسید دریافت نشد')
  if (file && file.size > 8 * 1024 * 1024) issues.push('حجم فایل بیش از ۸ مگابایت است')
  if (file && file.type && !file.type.startsWith('image/')) issues.push('فقط تصویر رسید پذیرفته می‌شود')
  if (!amount) issues.push('مبلغ واریزی وارد نشده است')
  if (!/^\d{4}$/.test(cardLast4)) issues.push('چهار رقم آخر کارت مبدأ باید ۴ رقم باشد')

  const diff = Math.abs(amount - total)
  if (amount && total && diff > 0 && diff <= Math.max(10000, total * 0.02)) {
    issues.push('مبلغ رسید نزدیک به سفارش است ولی دقیق نیست')
  }
  if (amount && total && diff > Math.max(10000, total * 0.02)) {
    issues.push('مبلغ رسید با مبلغ سفارش هم‌خوانی ندارد')
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
  if (duplicated) issues.push('این رسید قبلاً برای سفارش دیگری ثبت شده است')

  let decision = 'needs_review'
  let confidence = 0.55
  const blocking = issues.some((item) => item.includes('هم‌خوانی ندارد') || item.includes('تصویر رسید'))

  if (!issues.length && diff === 0) {
    decision = 'approved'
    confidence = 0.93
  } else if (blocking || duplicated) {
    decision = 'rejected'
    confidence = 0.9
  }

  return {
    bot: 'بات بررسی رسید ایمنی مهدی',
    decision,
    confidence,
    issues,
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
