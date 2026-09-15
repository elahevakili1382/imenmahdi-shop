export const tehranMethods = [
  {
    id: 'tehran-courier',
    zone: 'tehran',
    name: 'پیک فروشگاه',
    eta: 'روز و بازه انتخابی شما',
    price: 75000,
    note: 'داخل محدوده تهران. بعد از تایید رسید در همان بازه هماهنگ می‌شود',
  },
  {
    id: 'tehran-express',
    zone: 'tehran',
    name: 'ارسال فوری تهران',
    eta: 'همان روز در بازه انتخابی',
    price: 125000,
    note: 'اگر رسید تا ظهر تایید شود، همان روز ارسال می‌شود',
  },
]

export const countyMethods = [
  {
    id: 'tipax',
    zone: 'county',
    name: 'تیپاکس',
    eta: '۳ تا ۷ روز کاری',
    price: 95000,
    note: 'پوشش بیشتر شهرستان‌ها، رهگیری مرسوله',
  },
  {
    id: 'mahex',
    zone: 'county',
    name: 'ماهکس',
    eta: '۳ تا ۷ روز کاری',
    price: 110000,
    note: 'ارسال به شهرهای تحت پوشش ماهکس',
  },
  {
    id: 'post',
    zone: 'county',
    name: 'پست پیشتاز',
    eta: '۳ تا ۷ روز کاری',
    price: 65000,
    note: 'مناسب مرسوله‌های سبک و مدارک همراه کالا',
  },
  {
    id: 'freight',
    zone: 'county',
    name: 'باربری',
    eta: '۳ تا ۷ روز کاری پس از هماهنگی',
    price: 0,
    note: 'برای سفارش حجیم و سازمانی. کرایه بعد از وزن اعلام می‌شود',
  },
]

export const shippingMethods = [...tehranMethods, ...countyMethods]

export const tehranSlots = [
  { id: '09-12', label: '۹ تا ۱۲' },
  { id: '12-15', label: '۱۲ تا ۱۵' },
  { id: '15-19', label: '۱۵ تا ۱۹' },
]

export const defaultShippingSettings = {
  tehranCourierPrice: 75000,
  tehranExpressPrice: 125000,
}

export function withShippingSettings(settings = defaultShippingSettings) {
  const courier = Number(settings.tehranCourierPrice ?? defaultShippingSettings.tehranCourierPrice)
  const express = Number(settings.tehranExpressPrice ?? defaultShippingSettings.tehranExpressPrice)
  return {
    tehran: tehranMethods.map((item) => {
      if (item.id === 'tehran-courier') return { ...item, price: courier }
      if (item.id === 'tehran-express') return { ...item, price: express }
      return { ...item }
    }),
    county: countyMethods.map((item) => ({ ...item })),
  }
}

export function getShipping(id) {
  return shippingMethods.find((item) => item.id === id) || countyMethods[0]
}

export function methodsFor(zone) {
  return zone === 'tehran' ? tehranMethods : countyMethods
}

export function nextWorkingDays(count = 7) {
  const days = []
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  cursor.setDate(cursor.getDate() + 1)
  while (days.length < count) {
    if (cursor.getDay() !== 5) {
      days.push({
        iso: cursor.toISOString().slice(0, 10),
        weekday: cursor.toLocaleDateString('fa-IR', { weekday: 'short' }),
        day: cursor.toLocaleDateString('fa-IR', { day: 'numeric' }),
        month: cursor.toLocaleDateString('fa-IR', { month: 'short' }),
        label: cursor.toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' }),
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function slotLabel(id) {
  return tehranSlots.find((item) => item.id === id)?.label || ''
}
