// src/utils/slugify.js

const persianToEnglishMap = {
  ا: 'a',
  ب: 'b',
  پ: 'p',
  ت: 't',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'gh',
  ک: 'k',
  ك: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  و: 'v',
  ه: 'h',
  ی: 'y',
  ي: 'y',
  ء: '',
  ئ: 'y',
  ة: 'h',
  آ: 'a',
  '‌': '-', // نیم‌فاصله
  ' ': '-', // فاصله
}

export function slugify(text) {
  if (!text) return ''

  // Normalize and convert Persian to Latin
  const slug = text
    .trim()
    .split('')
    .map((char) => persianToEnglishMap[char] || char) // نگاشت فارسی به لاتین
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, '') // حذف هر چیز غیرمجاز
    .replace(/\-+/g, '-') // حذف - تکراری
    .replace(/^-+|-+$/g, '') // حذف - از ابتدا و انتها

  return slug
}
