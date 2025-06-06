// Pinia یه کتابخونه‌ی مدیریت وضعیت (state management) تو Vue هست.
// وقتی پروژه‌ت بزرگ می‌شه و چندین کامپوننت باید به یک داده دسترسی داشته باشن (مثلاً لیست محصولات یا وضعیت لاگین کاربر)، استفاده از props و emit خیلی پیچیده و غیرقابل کنترل می‌شه.

// 🔧 اون‌وقته که یه "مرکز" برای داده‌هات لازم داری، و اون مرکز همون Store (مغازه داده‌ها) هست — با Pinia.

import mockProducts from '../mock/products'
import { defineStore } from 'pinia'
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
  }),
  actions: {
    setProducts(data) {
      this.products = data
    },
    loadMockProducts() {
      this.products = mockProducts
    },
  },
})
