export function familyName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  return parts.at(-1) || name || 'خریدار'
}

export function honorific(title, name) {
  const family = familyName(name)
  return title === 'خانم' ? `سرکار خانم ${family}` : `جناب آقای ${family}`
}

export function deliveryLine(order = {}) {
  const shipping = order.shipping?.name || 'پیک فروشگاه'
  if (order.destination === 'tehran') {
    const day = order.deliveryDate
      ? new Date(order.deliveryDate).toLocaleDateString('fa-IR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : 'روز هماهنگ‌شده'
    const slot = order.deliverySlotLabel || order.deliverySlot || 'بازه انتخابی'
    return `ارسال با ${shipping} در ${day}، بازه ساعت ${slot}.`
  }
  const eta = order.shipping?.eta || '۳ تا ۷ روز کاری'
  return `ارسال شهرستان با ${shipping}؛ ${eta}.`
}
