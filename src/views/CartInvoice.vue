<template>
  <div class="invoice">
    <div class="toolbar print:hidden">
      <button class="btn btn-primary" type="button" :disabled="busy || !cart.items.length" @click="downloadPdf">
        {{ busy ? 'در حال ساخت PDF…' : 'دانلود PDF' }}
      </button>
      <button class="btn btn-dark" type="button" @click="print">چاپ فاکتور</button>
      <router-link to="/cart" class="btn btn-ghost">بازگشت به سبد</router-link>
    </div>

    <div v-if="!cart.items.length" class="sheet text-center">
      <p class="mb-4">سبد خالی است و پیش‌فاکتوری برای چاپ نیست.</p>
      <router-link to="/products" class="btn btn-primary">کاتالوگ</router-link>
    </div>

    <article v-else ref="sheet" class="sheet">
      <header class="flex justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <p class="text-xs tracking-[0.2em] text-ember mb-1">IMEN MAHDI</p>
          <h1 class="text-2xl font-extrabold">پیش‌فاکتور</h1>
          <p class="text-sm mt-1">ایمنی مهدی · تجهیزات حفاظت فردی و آتش‌نشانی</p>
        </div>
        <div class="text-left text-sm">
          <p>شماره: {{ quoteId }}</p>
          <p>تاریخ: {{ date }}</p>
          <p>وضعیت: قبل از پرداخت</p>
        </div>
      </header>

      <section class="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <h2 class="font-bold mb-1">خریدار / شرکت</h2>
          <p>{{ buyer.name }}</p>
          <p v-if="buyer.company">{{ buyer.company }}</p>
          <p>{{ buyer.phone }}</p>
          <p>{{ [buyer.city, buyer.address].filter(Boolean).join(' · ') }}</p>
        </div>
        <div>
          <h2 class="font-bold mb-1">فروشنده</h2>
          <p>فروشگاه ایمنی مهدی</p>
          <p>۰۹۱۰۶۴۱۹۶۷۸</p>
          <p>پرداخت پس از تایید این پیش‌فاکتور، کارت‌به‌کارت</p>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>شرح کالا</th>
            <th>سایز</th>
            <th>تعداد</th>
            <th>مبلغ واحد</th>
            <th>جمع</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cart.items" :key="item.id + item.size">
            <td>{{ item.title }}</td>
            <td>{{ item.size }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatPrice(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="mt-6 text-sm">
        <p>تعداد اقلام: {{ cart.totalCount }}</p>
        <p class="text-lg font-bold mt-2">مبلغ کل کالا: {{ formatPrice(cart.totalPrice) }} تومان</p>
        <p class="mt-2 text-steel">هزینه ارسال بعد از انتخاب تهران یا شهرستان در تسویه مشخص می‌شود.</p>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/utils/money'
import { quoteIdForCart } from '@/utils/ids'
import { useToast } from 'vue-toastification'

const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()
const sheet = ref(null)
const busy = ref(false)
const date = new Date().toLocaleDateString('fa-IR')
const quoteId = quoteIdForCart(cart.items)

const buyer = computed(() => ({
  name: auth.user?.name || '—',
  company: auth.user?.company || '',
  phone: auth.user?.phone || '—',
  city: auth.user?.city || '',
  address: auth.user?.address || '',
}))

function print() {
  window.print()
}

async function downloadPdf() {
  if (!sheet.value) return
  busy.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(sheet.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
    const img = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pageW) / canvas.width
    let left = imgH
    let offset = 0
    pdf.addImage(img, 'JPEG', 0, 0, pageW, imgH)
    while (left > pageH) {
      offset -= pageH
      pdf.addPage()
      pdf.addImage(img, 'JPEG', 0, offset, pageW, imgH)
      left -= pageH
    }
    pdf.save(`pish-faktor-imen-mahdi-${quoteId}.pdf`)
  } catch {
    toast.error('ساخت PDF انجام نشد؛ از چاپ مرورگر استفاده کنید.')
    window.print()
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.invoice {
  min-height: 100vh;
  background: #f4efe7;
  padding: 24px;
}
.toolbar,
.sheet {
  width: min(900px, 100%);
  margin-inline: auto;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.sheet {
  background: #fff;
  padding: 32px;
  color: #111;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  border: 1px solid #ddd4c8;
  padding: 8px;
  text-align: right;
}
@media print {
  .invoice {
    background: #fff;
    padding: 0;
  }
  .sheet {
    width: 100%;
  }
}
</style>
