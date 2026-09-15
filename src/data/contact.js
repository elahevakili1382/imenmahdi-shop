export const shopContact = {
  brand: 'ایمن یاب',
  address: 'تهران، بلوار فردوس غرب، سازمان برنامه جنوبی، پلاک ۴',
  hours: '۸:۳۰ الی ۱۹:۰۰',
  phones: [{ label: 'تماس', display: '۰۹۱۰۶۴۱۹۶۷۸', raw: '09106419678' }],
  whatsapp: '989368305628',
  baleId: 'imenmahdi',
}

export function productInquiryText(productTitle = '') {
  if (productTitle) {
    return `سلام، درباره محصول «${productTitle}» از فروشگاه ایمن یاب راهنمایی می‌خواهم.`
  }
  return 'سلام، برای خرید تجهیزات ایمنی از فروشگاه ایمن یاب راهنمایی می‌خواهم.'
}

export function whatsappLink(text) {
  return `https://wa.me/${shopContact.whatsapp}?text=${encodeURIComponent(text)}`
}

function shopPhonePlus() {
  const digits = String(shopContact.phones[0]?.raw || '').replace(/\D/g, '')
  const national = digits.startsWith('98') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits
  return `+98${national}`
}

export function baleLink() {
  return `https://ble.ir/${shopPhonePlus()}`
}

export function rubikaLink() {
  return `https://rubika.ir/${shopPhonePlus()}`
}

export function telLink(raw) {
  return `tel:${raw}`
}
