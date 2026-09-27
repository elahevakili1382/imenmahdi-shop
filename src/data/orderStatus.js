export const ORDER_STATUS = {
  AWAITING_PAYMENT: 'awaiting_payment',
  AWAITING_RECEIPT: 'awaiting_receipt',
  AWAITING_REVIEW: 'awaiting_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
}

export const statusLabel = {
  awaiting_payment: 'در انتظار پرداخت آنلاین',
  awaiting_receipt: 'در انتظار رسید',
  awaiting_review: 'در حال بررسی رسید',
  approved: 'تایید شده',
  rejected: 'رد شده',
  preparing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
}
