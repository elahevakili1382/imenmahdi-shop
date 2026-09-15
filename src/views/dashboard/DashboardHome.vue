<template>
  <div>
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[#98989D] text-sm">سلام {{ auth.user?.name }}</p>
        <h1 class="mt-1">{{ auth.isAdmin ? 'نمای کلی فروشگاه' : 'وضعیت حساب' }}</h1>
      </div>
      <p class="dash-live">{{ auth.isAdmin ? 'مانیتورینگ زنده' : 'حساب فعال' }}</p>
    </header>

    <div class="dash-grid">
      <article v-for="kpi in kpis" :key="kpi.label" class="dash-card dash-kpi dash-span-4">
        <p class="dash-kpi-label">
          <i :class="['fa-solid', kpi.icon]" aria-hidden="true"></i>
          {{ kpi.label }}
        </p>
        <p class="dash-kpi-value">{{ kpi.value }}</p>
        <p class="dash-kpi-meta">{{ kpi.meta }}</p>
      </article>

      <template v-if="auth.isAdmin">
        <article class="dash-card dash-span-8">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2>مصرف فروش ۷ روز اخیر</h2>
            <p class="text-sm text-[#98989D]">{{ formatPrice(weekSalesTotal) }} تومان</p>
          </div>
          <DashChart type="line" :data="weekChart" />
        </article>

        <aside class="dash-span-4 space-y-4">
          <article v-if="!alerts.length" class="dash-ok">
            <p class="font-semibold">وضعیت عادی</p>
            <p class="mt-1 text-sm opacity-90">رسید معوق و موجودی بحرانی ثبت نشده است.</p>
          </article>
          <article v-for="alert in alerts" :key="alert.id" class="dash-alert">
            <p class="font-semibold">{{ alert.title }}</p>
            <p class="mt-1 text-sm opacity-90">{{ alert.text }}</p>
            <router-link v-if="alert.to" :to="alert.to" class="mt-3 inline-block text-sm underline underline-offset-4">
              {{ alert.cta }}
            </router-link>
          </article>
        </aside>
      </template>

      <template v-else>
        <article class="dash-card dash-span-8">
          <p class="dash-kpi-label mb-3">پیشرفت راه‌اندازی حساب</p>
          <div class="dash-progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
            <span :style="{ width: `${progress}%` }" />
          </div>
          <p class="dash-kpi-meta mt-3">{{ doneCount }} از {{ cards.length }} مرحله انجام شده</p>
        </article>
        <aside class="dash-span-4">
          <article v-if="hasPendingReceipt" class="dash-alert">
            <p class="font-semibold">رسید در انتظار بررسی</p>
            <p class="mt-1 text-sm opacity-90">یکی از سفارش‌ها هنوز تایید نشده است.</p>
            <router-link to="/account/orders" class="mt-3 inline-block text-sm underline underline-offset-4">
              پیگیری سفارش
            </router-link>
          </article>
          <article v-else class="dash-ok">
            <p class="font-semibold">حساب در وضعیت عادی</p>
            <p class="mt-1 text-sm opacity-90">برای تهران پیک و برای شهرستان تیپاکس، ماهکس یا پست در دسترس است.</p>
          </article>
        </aside>
      </template>
    </div>

    <section v-if="!auth.isAdmin" class="dash-grid mt-4">
      <article v-for="card in cards" :key="card.id" class="dash-card dash-span-6 flex flex-col min-h-[180px]">
        <p class="text-xs text-[#98989D] mb-2">{{ card.done ? 'انجام شده' : 'باقی‌مانده' }}</p>
        <h2 class="mb-2">{{ card.title }}</h2>
        <p class="text-sm text-[#98989D] flex-1 leading-7">{{ card.text }}</p>
        <component
          :is="card.to ? 'router-link' : 'button'"
          :to="card.to"
          class="btn mt-4 min-h-10 text-sm"
          :class="card.done ? 'btn-ghost' : 'btn-primary'"
          @click="card.action && card.action()"
        >
          {{ card.cta }}
        </component>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useProductStore } from '@/stores/productStore'
import { ORDER_STATUS } from '@/data/orderStatus'
import { formatPrice } from '@/utils/money'
import DashChart from '@/components/dashboard/DashChart.vue'

const auth = useAuthStore()
const orders = useOrderStore()
const onboarding = useOnboardingStore()
const products = useProductStore()

const mine = computed(() => (auth.user ? orders.byUser(auth.user.id) : []))
const hasOrder = computed(() => mine.value.length > 0)
const hasReceipt = computed(() =>
  mine.value.some((order) => order.receiptDataUrl || order.botResult),
)
const hasPendingReceipt = computed(() =>
  mine.value.some(
    (order) =>
      order.status === ORDER_STATUS.AWAITING_RECEIPT || order.status === ORDER_STATUS.AWAITING_REVIEW,
  ),
)
const salesTotal = computed(() => orders.orders.reduce((sum, order) => sum + (order.total || 0), 0))
const lastOrderTotal = computed(() => mine.value[0]?.total || 0)

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  }),
)

const weekSales = computed(() =>
  weekDays.value.map((date) => {
    const key = date.toISOString().slice(0, 10)
    return orders.orders
      .filter((order) => String(order.createdAt || '').slice(0, 10) === key)
      .reduce((sum, order) => sum + (order.total || 0), 0)
  }),
)

const weekSalesTotal = computed(() => weekSales.value.reduce((sum, value) => sum + value, 0))

const kpis = computed(() => {
  if (auth.isAdmin) {
    return [
      {
        label: 'سفارش‌ها',
        value: formatPrice(orders.orders.length),
        meta: `${formatPrice(orders.pendingReview.length)} رسید در صف بررسی`,
        icon: 'fa-bolt',
      },
      {
        label: 'فروش ثبت‌شده',
        value: formatPrice(salesTotal.value),
        meta: `${formatPrice(salesTotal.value)} تومان`,
        icon: 'fa-gauge-high',
      },
      {
        label: 'رسید معوق',
        value: formatPrice(orders.pendingReview.length),
        meta: orders.pendingReview.length ? 'نیاز به تایید دستی' : 'صف خالی است',
        icon: 'fa-plug',
      },
    ]
  }

  return [
    {
      label: 'سفارش‌های من',
      value: formatPrice(mine.value.length),
      meta: hasOrder.value ? 'قابل پیگیری از همین داشبورد' : 'هنوز سفارشی ثبت نشده',
      icon: 'fa-bolt',
    },
    {
      label: 'پیشرفت حساب',
      value: `${formatPrice(progress.value)}٪`,
      meta: `${doneCount.value} از ${cards.value.length} مرحله`,
      icon: 'fa-gauge-high',
    },
    {
      label: 'آخرین مبلغ',
      value: formatPrice(lastOrderTotal.value),
      meta: `${formatPrice(lastOrderTotal.value)} تومان`,
      icon: 'fa-plug',
    },
  ]
})

const weekChart = computed(() => ({
  labels: weekDays.value.map((date) => date.toLocaleDateString('fa-IR', { weekday: 'short' })),
  datasets: [
    {
      label: 'فروش (تومان)',
      data: weekSales.value,
      borderColor: '#00E5FF',
      backgroundColor: 'rgba(48, 209, 88, 0.22)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#00E5FF',
    },
  ],
}))

const alerts = computed(() => {
  const list = []
  if (orders.pendingReview.length) {
    list.push({
      id: 'receipts',
      title: 'پیک بررسی رسید',
      text: `${orders.pendingReview.length} سفارش منتظر تایید دستی است.`,
      to: '/dashboard/admin/receipts',
      cta: 'باز کردن صف رسید',
    })
  }
  if (products.lowStock.length) {
    const first = products.lowStock[0]
    list.push({
      id: 'stock',
      title: 'هشدار موجودی',
      text: `${first.title} · ${first.stock} عدد. ${products.lowStock.length} کالا زیر حد ۸ عدد است.`,
      to: '/dashboard/admin/products',
      cta: 'مدیریت موجودی',
    })
  }
  return list
})

const cards = computed(() => [
  {
    id: 'profile',
    title: 'تکمیل پروفایل و آدرس',
    text: 'برای فاکتور و ارسال تهران یا شهرستان، نام و آدرس را کامل کنید.',
    to: '/account/profile',
    cta: auth.profileComplete ? 'ویرایش پروفایل' : 'تکمیل پروفایل',
    done: auth.profileComplete,
  },
  {
    id: 'payment',
    title: 'روش کارت‌به‌کارت',
    text: 'مبلغ را واریز کنید، رسید را بفرستید؛ بات مبلغ را چک می‌کند و موارد مبهم به ادمین می‌رود.',
    action: () => onboarding.mark('learnedPayment'),
    cta: onboarding.flags.learnedPayment ? 'مرور شد' : 'متوجه شدم',
    done: onboarding.flags.learnedPayment,
  },
  {
    id: 'order',
    title: 'اولین سفارش',
    text: 'از کاتالوگ انتخاب کنید. تهران پیک دارد و شهرستان با تیپاکس، ماهکس یا پست ارسال می‌شود.',
    to: hasOrder.value ? '/account/orders' : '/products',
    cta: hasOrder.value ? 'سفارش‌های من' : 'شروع خرید',
    done: hasOrder.value,
  },
  {
    id: 'receipt',
    title: 'رسید و فاکتور',
    text: 'بعد از واریز، رسید را بفرستید و از همین داشبورد فاکتور را چاپ کنید.',
    to: '/account/orders',
    cta: hasReceipt.value ? 'مشاهده سفارش‌ها' : 'پیگیری رسید',
    done: hasReceipt.value,
  },
])

const doneCount = computed(() => cards.value.filter((card) => card.done).length)
const progress = computed(() => Math.round((doneCount.value / cards.value.length) * 100) || 0)
</script>
