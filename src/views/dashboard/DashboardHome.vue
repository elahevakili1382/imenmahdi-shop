<template>
  <div>
    <header class="dash-topbar">
      <div>
        <p class="text-sm text-[var(--dash-muted)]">سلام {{ auth.user?.name || 'کاربر' }}</p>
        <h1 class="mt-1">{{ auth.isAdmin ? 'داشبورد' : 'وضعیت حساب' }}</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label v-if="auth.isAdmin" class="dash-search">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input v-model="query" type="search" placeholder="جستجوی سفارش، محصول یا مخاطب..." />
        </label>
        <p class="dash-live">{{ auth.isAdmin ? 'مانیتورینگ زنده' : 'حساب فعال' }}</p>
      </div>
    </header>

    <div class="dash-grid">
      <article v-for="kpi in kpis" :key="kpi.label" class="dash-card dash-kpi dash-span-4">
        <div class="flex items-start justify-between gap-3">
          <p class="dash-kpi-label">
            <i :class="['fa-solid', kpi.icon]" aria-hidden="true"></i>
            {{ kpi.label }}
          </p>
          <span v-if="kpi.trend" class="dash-kpi-trend" :class="kpi.trendUp ? 'is-up' : 'is-down'">
            <i :class="kpi.trendUp ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'" aria-hidden="true"></i>
            {{ kpi.trend }}
          </span>
        </div>
        <p class="dash-kpi-value">{{ kpi.value }}</p>
        <div class="mt-auto flex items-end justify-between gap-3">
          <p class="dash-kpi-meta">{{ kpi.meta }}</p>
          <router-link v-if="kpi.to" :to="kpi.to" class="dash-soft-btn">جزئیات</router-link>
        </div>
      </article>

      <template v-if="auth.isAdmin">
        <article class="dash-card dash-span-12">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2>گزارش فروش این هفته</h2>
              <p class="text-sm text-[var(--dash-muted)] mt-1">
                مجموع هفته: {{ formatPrice(weekSalesTotal) }} تومان
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="dash-soft-btn"
                :class="{ 'is-active': range === 'this' }"
                @click="range = 'this'"
              >
                این هفته
              </button>
              <button
                type="button"
                class="dash-soft-btn"
                :class="{ 'is-active': range === 'last' }"
                @click="range = 'last'"
              >
                هفته قبل
              </button>
            </div>
          </div>

          <div class="dash-stat-strip">
            <div v-for="stat in weekStats" :key="stat.label" class="dash-stat-pill">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </div>
          </div>

          <DashChart type="line" :data="weekChart" />
        </article>

        <article class="dash-card dash-span-6 dash-side-card">
          <h2 class="mb-1">وضعیت لحظه‌ای</h2>
          <p class="text-sm text-[var(--dash-muted)] mb-4">هشدارهای فروشگاه</p>
          <article v-if="!alerts.length" class="dash-ok">
            <span class="dash-banner__icon" aria-hidden="true">
              <i class="fa-solid fa-circle-check"></i>
            </span>
            <div>
              <p class="font-semibold">وضعیت عادی</p>
              <p class="mt-1 text-sm opacity-90">رسید معوق و موجودی بحرانی نیست.</p>
            </div>
          </article>
          <div v-else class="space-y-3">
            <article v-for="alert in alerts" :key="alert.id" class="dash-alert">
              <span class="dash-banner__icon" aria-hidden="true">
                <i :class="alert.icon"></i>
              </span>
              <div>
                <p class="font-semibold">{{ alert.title }}</p>
                <p class="mt-1 text-sm opacity-90">{{ alert.text }}</p>
                <router-link
                  v-if="alert.to"
                  :to="alert.to"
                  class="mt-3 inline-block text-sm font-bold underline underline-offset-4"
                >
                  {{ alert.cta }}
                </router-link>
              </div>
            </article>
          </div>
        </article>

        <article class="dash-card dash-span-6 dash-side-card">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2>فروش بر اساس مقصد</h2>
            <router-link to="/dashboard/admin/orders" class="dash-soft-btn">بینش</router-link>
          </div>
          <div class="dash-bar-list">
            <div v-for="row in destinationRows" :key="row.label" class="dash-bar-row">
              <div class="dash-bar-row__meta">
                <span class="font-semibold">{{ row.label }}</span>
                <span class="text-[var(--dash-muted)]">{{ formatPrice(row.count) }} سفارش</span>
              </div>
              <div class="dash-bar-row__track">
                <div class="dash-bar-row__fill" :style="{ width: `${row.pct}%` }" />
              </div>
            </div>
          </div>
        </article>

        <article class="dash-card dash-span-12 lg-dash-span-8">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2>آخرین سفارش‌ها</h2>
            <router-link to="/dashboard/admin/orders" class="dash-soft-btn">همه سفارش‌ها</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="dash-table">
              <thead>
                <tr>
                  <th>شماره</th>
                  <th>خریدار</th>
                  <th>وضعیت</th>
                  <th>مبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id">
                  <td class="dash-mono">{{ order.id }}</td>
                  <td>{{ order.customerName || '—' }}</td>
                  <td>{{ statusLabel[order.status] || order.status }}</td>
                  <td>{{ formatPrice(order.total) }} تومان</td>
                </tr>
                <tr v-if="!filteredOrders.length">
                  <td colspan="4" class="text-[var(--dash-muted)]">سفارشی پیدا نشد.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="dash-card dash-span-12 lg-dash-span-4">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2>محصولات کم‌موجود</h2>
            <router-link to="/dashboard/admin/products" class="dash-soft-btn">همه محصولات</router-link>
          </div>
          <ul class="space-y-3">
            <li
              v-for="item in lowStockList"
              :key="item.id"
              class="flex items-start justify-between gap-3 border-b border-[var(--dash-line)] pb-3 last:border-0"
            >
              <div class="min-w-0">
                <p class="font-semibold leading-6">{{ item.title }}</p>
                <p class="text-xs text-[var(--dash-muted)] mt-1">{{ item.subcategory }}</p>
              </div>
              <span class="dash-mono text-[var(--dash-alert)] shrink-0">{{ item.stock }}</span>
            </li>
            <li v-if="!lowStockList.length" class="text-sm text-[var(--dash-muted)]">موجودی بحرانی نیست.</li>
          </ul>
        </article>
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
            <span class="dash-banner__icon" aria-hidden="true">
              <i class="fa-solid fa-receipt"></i>
            </span>
            <div>
              <p class="font-semibold">رسید در انتظار بررسی</p>
              <p class="mt-1 text-sm opacity-90">یکی از سفارش‌ها هنوز تایید نشده است.</p>
              <router-link to="/account/orders" class="mt-3 inline-block text-sm font-bold underline underline-offset-4">
                پیگیری سفارش
              </router-link>
            </div>
          </article>
          <article v-else class="dash-ok">
            <span class="dash-banner__icon" aria-hidden="true">
              <i class="fa-solid fa-circle-check"></i>
            </span>
            <div>
              <p class="font-semibold">حساب در وضعیت عادی</p>
              <p class="mt-1 text-sm opacity-90">تهران پیک دارد؛ شهرستان با تیپاکس، ماهکس یا پست.</p>
            </div>
          </article>
        </aside>
      </template>
    </div>

    <section v-if="!auth.isAdmin" class="dash-grid mt-4">
      <article v-for="card in cards" :key="card.id" class="dash-card dash-span-6 flex flex-col min-h-[180px]">
        <p class="text-xs text-[var(--dash-muted)] mb-2">{{ card.done ? 'انجام شده' : 'باقی‌مانده' }}</p>
        <h2 class="mb-2">{{ card.title }}</h2>
        <p class="text-sm text-[var(--dash-muted)] flex-1 leading-7">{{ card.text }}</p>
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
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useProductStore } from '@/stores/productStore'
import { useLeadStore } from '@/stores/leadStore'
import { useReviewStore } from '@/stores/reviewStore'
import { ORDER_STATUS, statusLabel } from '@/data/orderStatus'
import { formatPrice } from '@/utils/money'
import { isOutOfStock, stockQuantity } from '@/utils/stock'
import DashChart from '@/components/dashboard/DashChart.vue'

const auth = useAuthStore()
const orders = useOrderStore()
const onboarding = useOnboardingStore()
const products = useProductStore()
const leads = useLeadStore()
const reviews = useReviewStore()
const query = ref('')
const range = ref('this')

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
const rejectedCount = computed(
  () => orders.orders.filter((order) => order.status === ORDER_STATUS.REJECTED).length,
)
const preparingCount = computed(
  () => orders.orders.filter((order) => order.status === ORDER_STATUS.PREPARING).length,
)

function daysWindow(offsetWeeks = 0) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i) - offsetWeeks * 7)
    return date
  })
}

const activeDays = computed(() => daysWindow(range.value === 'last' ? 1 : 0))
const prevDays = computed(() => daysWindow(range.value === 'last' ? 2 : 1))

function salesForDays(days) {
  return days.map((date) => {
    const key = date.toISOString().slice(0, 10)
    return orders.orders
      .filter((order) => String(order.createdAt || '').slice(0, 10) === key)
      .reduce((sum, order) => sum + (order.total || 0), 0)
  })
}

const weekSales = computed(() => salesForDays(activeDays.value))
const prevWeekSales = computed(() => salesForDays(prevDays.value))
const weekSalesTotal = computed(() => weekSales.value.reduce((sum, value) => sum + value, 0))
const prevWeekSalesTotal = computed(() => prevWeekSales.value.reduce((sum, value) => sum + value, 0))

function trendPct(current, previous) {
  if (!previous && !current) return { text: '۰٪', up: true }
  if (!previous) return { text: '+۱۰۰٪', up: true }
  const pct = Math.round(((current - previous) / previous) * 100)
  return { text: `${pct > 0 ? '+' : ''}${pct}٪`, up: pct >= 0 }
}

const salesTrend = computed(() => trendPct(weekSalesTotal.value, prevWeekSalesTotal.value))
const orderTrend = computed(() =>
  trendPct(
    orders.orders.filter((order) =>
      activeDays.value.some((d) => String(order.createdAt || '').slice(0, 10) === d.toISOString().slice(0, 10)),
    ).length,
    orders.orders.filter((order) =>
      prevDays.value.some((d) => String(order.createdAt || '').slice(0, 10) === d.toISOString().slice(0, 10)),
    ).length,
  ),
)

const outOfStock = computed(() => products.products.filter((item) => isOutOfStock(item)).length)
const inStock = computed(() => products.products.filter((item) => !isOutOfStock(item)).length)

const weekStats = computed(() => [
  { label: 'مخاطبین', value: formatPrice(leads.leads.length) },
  { label: 'کل محصولات', value: formatPrice(products.products.length) },
  { label: 'موجود', value: formatPrice(inStock.value) },
  { label: 'ناموجود', value: formatPrice(outOfStock.value) },
  { label: 'نظرات', value: formatPrice(reviews.reviews.length) },
])

const destinationRows = computed(() => {
  const tehran = orders.orders.filter((order) => order.destination === 'tehran').length
  const county = orders.orders.filter((order) => order.destination === 'county').length
  const total = Math.max(tehran + county, 1)
  return [
    { label: 'تهران (پیک)', count: tehran, pct: Math.round((tehran / total) * 100) },
    { label: 'شهرستان', count: county, pct: Math.round((county / total) * 100) },
  ]
})

const filteredOrders = computed(() => {
  const q = query.value.trim()
  return orders.orders
    .filter((order) => {
      if (!q) return true
      return [order.id, order.customerName, order.phone, order.city]
        .filter(Boolean)
        .join(' ')
        .includes(q)
    })
    .slice(0, 6)
})

const lowStockList = computed(() => products.lowStock.slice(0, 5))

const kpis = computed(() => {
  if (auth.isAdmin) {
    return [
      {
        label: 'فروش کل',
        value: `${formatPrice(salesTotal.value)}`,
        meta: `هفته جاری ${formatPrice(weekSalesTotal.value)} تومان`,
        icon: 'fa-chart-line',
        trend: salesTrend.value.text,
        trendUp: salesTrend.value.up,
        to: '/dashboard/admin/orders',
      },
      {
        label: 'کل سفارش‌ها',
        value: formatPrice(orders.orders.length),
        meta: `${formatPrice(preparingCount.value)} در حال آماده‌سازی`,
        icon: 'fa-bag-shopping',
        trend: orderTrend.value.text,
        trendUp: orderTrend.value.up,
        to: '/dashboard/admin/orders',
      },
      {
        label: 'رسید و رد شده',
        value: `${formatPrice(orders.pendingReview.length)} / ${formatPrice(rejectedCount.value)}`,
        meta: orders.pendingReview.length ? 'نیاز به تایید دستی' : 'صف رسید خالی است',
        icon: 'fa-receipt',
        trend: orders.pendingReview.length ? 'اقدام' : '۰',
        trendUp: !orders.pendingReview.length,
        to: '/dashboard/admin/receipts',
      },
    ]
  }

  return [
    {
      label: 'سفارش‌های من',
      value: formatPrice(mine.value.length),
      meta: hasOrder.value ? 'قابل پیگیری از حساب' : 'هنوز سفارشی ثبت نشده',
      icon: 'fa-bag-shopping',
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
      icon: 'fa-wallet',
    },
  ]
})

const weekChart = computed(() => ({
  labels: activeDays.value.map((date) => date.toLocaleDateString('fa-IR', { weekday: 'short' })),
  datasets: [
    {
      label: 'فروش (تومان)',
      data: weekSales.value,
      borderColor: '#1B8F5A',
      backgroundColor: 'rgba(27, 143, 90, 0.18)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#1B8F5A',
    },
  ],
}))

const alerts = computed(() => {
  const list = []
  if (orders.pendingReview.length) {
    list.push({
      id: 'receipts',
      title: 'رسید در صف بررسی',
      text: `${orders.pendingReview.length} سفارش منتظر تایید دستی است.`,
      to: '/dashboard/admin/receipts',
      cta: 'باز کردن صف رسید',
      icon: 'fa-solid fa-receipt',
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
      icon: 'fa-solid fa-boxes-stacked',
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
    text: 'بعد از واریز، رسید را بفرستید و فاکتور را چاپ کنید.',
    to: '/account/orders',
    cta: hasReceipt.value ? 'مشاهده سفارش‌ها' : 'پیگیری رسید',
    done: hasReceipt.value,
  },
])

const doneCount = computed(() => cards.value.filter((card) => card.done).length)
const progress = computed(() => Math.round((doneCount.value / cards.value.length) * 100) || 0)
</script>
