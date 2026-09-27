import process from 'node:process'

function merchantId() {
  const id = String(process.env.ZARINPAL_MERCHANT_ID || '').trim()
  if (!id) throw new Error('ZARINPAL_MERCHANT_ID در فایل .env تنظیم نشده است.')
  return id
}

function isSandbox() {
  return String(process.env.ZARINPAL_SANDBOX || '').toLowerCase() === 'true'
}

/** پایه وب‌سرویس و StartPay طبق محیط */
export function zarinpalBaseUrl() {
  return isSandbox() ? 'https://sandbox.zarinpal.com' : 'https://payment.zarinpal.com'
}

export function zarinpalConfigured() {
  return Boolean(String(process.env.ZARINPAL_MERCHANT_ID || '').trim())
}

/**
 * مرحله ۱ — ارسال اطلاعات پرداخت
 * POST /pg/v4/payment/request.json
 */
export async function zarinpalRequest({
  amount,
  description,
  callbackUrl,
  mobile,
  email,
  orderId,
  currency = 'IRT',
}) {
  const body = {
    merchant_id: merchantId(),
    amount: Number(amount),
    callback_url: callbackUrl,
    description: String(description || '').slice(0, 500),
    currency,
    metadata: {},
  }
  if (mobile) body.metadata.mobile = String(mobile)
  if (email) body.metadata.email = String(email)
  if (orderId) body.metadata.order_id = String(orderId)

  const response = await fetch(`${zarinpalBaseUrl()}/pg/v4/payment/request.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await response.json()
  return json
}

/**
 * مرحله ۲ — آدرس انتقال خریدار به درگاه
 * https://payment.zarinpal.com/pg/StartPay/{authority}
 */
export function zarinpalStartPayUrl(authority) {
  return `${zarinpalBaseUrl()}/pg/StartPay/${encodeURIComponent(authority)}`
}

/**
 * مرحله ۳ — اعتبارسنجی بعد از بازگشت با Status=OK
 * POST /pg/v4/payment/verify.json
 * amount باید دقیقاً همان مبلغ request باشد.
 */
export async function zarinpalVerify({ amount, authority }) {
  const body = {
    merchant_id: merchantId(),
    amount: Number(amount),
    authority: String(authority),
  }

  const response = await fetch(`${zarinpalBaseUrl()}/pg/v4/payment/verify.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await response.json()
  return json
}

/** code موفق طبق داک: 100 اولین verify، 101 قبلاً verify شده */
export function zarinpalIsPaidCode(code) {
  return Number(code) === 100 || Number(code) === 101
}
