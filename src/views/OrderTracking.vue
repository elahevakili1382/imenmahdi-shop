<template>
  <section v-if="!order" class="container-shop py-20 text-center">سفارش پیدا نشد.</section>
  <section v-else-if="denied" class="container-shop py-20 text-center">به این سفارش دسترسی ندارید.</section>
  <section v-else class="container-shop py-8 sm:py-10">
    <nav class="text-sm text-steel mb-5" aria-label="مسیر">
      <router-link to="/account/orders" class="hover:text-ember">سفارش‌های من</router-link>
      <span aria-hidden="true"> / </span>
      <span>{{ order.id }}</span>
    </nav>

    <header class="mb-8 max-w-3xl">
      <p class="kicker mb-2" v-fade-up>پیگیری سفارش</p>
      <h1 class="section-title" v-fade-up>وضعیت ارسال و آماده‌سازی</h1>
      <p class="mt-3 text-sm leading-7 text-steel" v-fade-up>
        مسیر سفارش از ثبت تا تحویل. برای پرداخت یا ارسال رسید از دکمه جداگانه استفاده کنید.
      </p>
    </header>

    <div class="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] gap-6 items-start">
      <article class="surface-card p-5 sm:p-7">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <p class="text-xs text-steel">شماره سفارش</p>
            <p class="mt-1 font-extrabold text-lg tracking-wide">{{ order.id }}</p>
            <p class="mt-2 text-sm text-steel leading-7">{{ deliverySummary }}</p>
          </div>
          <span class="status-pill" :class="statusTone" role="status" aria-atomic="true">
            {{ statusLabel[order.status] }}
          </span>
        </div>

        <ol class="track-timeline" aria-label="مراحل سفارش">
          <li
            v-for="step in timeline"
            :key="step.id"
            class="track-step"
            :class="step.state"
            :aria-current="step.state === 'current' ? 'step' : undefined"
          >
            <span class="track-step__dot" aria-hidden="true">
              <i v-if="step.state === 'done'" class="fa-solid fa-check"></i>
              <i v-else-if="step.state === 'failed'" class="fa-solid fa-xmark"></i>
              <span v-else class="track-step__pulse" />
            </span>
            <div class="track-step__body">
              <p class="track-step__title">{{ step.label }}</p>
              <p class="track-step__text">{{ step.hint }}</p>
            </div>
          </li>
        </ol>

        <p v-if="order.adminNote" class="mt-6 text-sm leading-7 text-steel border-t border-[#eee8de] pt-4">
          توضیح فروشگاه: {{ order.adminNote }}
        </p>
      </article>

      <aside class="space-y-4">
        <article class="surface-card p-5 sm:p-6">
          <h2 class="font-bold mb-3">خلاصه</h2>
          <p class="flex justify-between text-sm mb-2 gap-3">
            <span class="text-steel">مبلغ</span>
            <span class="font-semibold">{{ formatPrice(order.total) }} تومان</span>
          </p>
          <p class="flex justify-between text-sm mb-2 gap-3">
            <span class="text-steel">ارسال</span>
            <span class="font-semibold text-left">{{ order.shipping?.name || '—' }}</span>
          </p>
          <p class="flex justify-between text-sm gap-3">
            <span class="text-steel">مقصد</span>
            <span class="font-semibold text-left">{{ order.city || '—' }}</span>
          </p>
        </article>

        <article class="surface-card p-5 sm:p-6">
          <h2 class="font-bold mb-3">اقلام</h2>
          <ul class="space-y-2 text-sm">
            <li
              v-for="item in order.items"
              :key="item.id + (item.size || '')"
              class="flex justify-between gap-3 border-b border-[#eee8de] py-2 last:border-0"
            >
              <span class="leading-6">{{ item.title }} × {{ item.quantity || item.qty || 1 }}</span>
              <span class="shrink-0">{{ formatPrice(item.price * (item.quantity || item.qty || 1)) }}</span>
            </li>
          </ul>
        </article>

        <div class="flex flex-col gap-2">
          <router-link
            v-if="needsPayment"
            :to="`/orders/${order.id}/pay`"
            class="btn btn-primary min-h-11 w-full"
          >
            پرداخت و ارسال رسید
          </router-link>
          <router-link
            v-else-if="order.status === ORDER_STATUS.AWAITING_REVIEW"
            :to="`/orders/${order.id}/pay`"
            class="btn btn-ghost min-h-11 w-full"
          >
            مشاهده وضعیت رسید
          </router-link>
          <router-link :to="`/invoice/${order.id}`" class="btn btn-dark min-h-11 w-full">
            چاپ فاکتور
          </router-link>
          <router-link to="/account/orders" class="btn btn-ghost min-h-11 w-full">
            بازگشت به سفارش‌ها
          </router-link>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useShippingStore } from '@/stores/shippingStore'
import { ORDER_STATUS, statusLabel } from '@/data/orderStatus'
import { deliveryLine } from '@/utils/honorific'
import { formatPrice } from '@/utils/money'

const route = useRoute()
const auth = useAuthStore()
const orders = useOrderStore()
const shipping = useShippingStore()

const order = computed(() => orders.byId(route.params.id))
const denied = computed(() => order.value && !auth.canAccessOrder(order.value))

const needsPayment = computed(
  () =>
    order.value?.status === ORDER_STATUS.AWAITING_RECEIPT ||
    order.value?.status === ORDER_STATUS.REJECTED,
)

const deliverySummary = computed(() => {
  if (!order.value) return ''
  const withLabel = {
    ...order.value,
    deliverySlotLabel: shipping.slotLabel(order.value.deliverySlot) || order.value.deliverySlot,
  }
  return deliveryLine(withLabel)
})

const statusTone = computed(() => {
  const status = order.value?.status
  if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.APPROVED) return 'is-ok'
  if (status === ORDER_STATUS.REJECTED) return 'is-bad'
  if (status === ORDER_STATUS.SHIPPED || status === ORDER_STATUS.PREPARING) return 'is-move'
  return 'is-wait'
})

/** Rank for progress (rejected handled separately). */
const RANK = {
  [ORDER_STATUS.AWAITING_RECEIPT]: 1,
  [ORDER_STATUS.AWAITING_REVIEW]: 2,
  [ORDER_STATUS.APPROVED]: 3,
  [ORDER_STATUS.PREPARING]: 3,
  [ORDER_STATUS.SHIPPED]: 4,
  [ORDER_STATUS.DELIVERED]: 5,
  [ORDER_STATUS.REJECTED]: 2,
}

const STEPS = [
  {
    id: 'placed',
    rank: 0,
    label: 'ثبت سفارش',
    hint: 'سفارش ثبت شد و در صف پردازش فروشگاه است.',
  },
  {
    id: 'pay',
    rank: 1,
    label: 'پرداخت و ارسال رسید',
    hint: 'واریز کارت‌به‌کارت و بارگذاری تصویر رسید.',
  },
  {
    id: 'review',
    rank: 2,
    label: 'بررسی رسید',
    hint: 'بات مبلغ را چک می‌کند؛ تایید نهایی با ادمین است.',
  },
  {
    id: 'prep',
    rank: 3,
    label: 'آماده‌سازی',
    hint: 'پس از تایید رسید، کالا بسته‌بندی می‌شود.',
  },
  {
    id: 'ship',
    rank: 4,
    label: 'ارسال',
    hint: 'مرسوله تحویل پیک یا شرکت حمل شده است.',
  },
  {
    id: 'done',
    rank: 5,
    label: 'تحویل',
    hint: 'سفارش به گیرنده رسیده است.',
  },
]

const timeline = computed(() => {
  const status = order.value?.status
  const currentRank = RANK[status] ?? 0
  const rejected = status === ORDER_STATUS.REJECTED

  return STEPS.map((step) => {
    let state = 'todo'
    let hint = step.hint

    if (rejected && step.id === 'review') {
      state = 'failed'
      hint = 'رسید رد شد. می‌توانید دوباره از صفحه پرداخت رسید بفرستید.'
    } else if (rejected && step.rank > 2) {
      state = 'todo'
    } else if (rejected && step.rank < 2) {
      state = 'done'
    } else if (step.rank < currentRank) {
      state = 'done'
    } else if (step.rank === currentRank) {
      state = 'current'
      if (status === ORDER_STATUS.AWAITING_RECEIPT && step.id === 'pay') {
        hint = 'هنوز رسید تایید نشده؛ برای ادامه به صفحه پرداخت بروید.'
      }
      if (status === ORDER_STATUS.AWAITING_REVIEW && step.id === 'review') {
        hint = 'رسید دریافت شد و منتظر تایید ادمین است.'
      }
      if (status === ORDER_STATUS.PREPARING && step.id === 'prep') {
        hint = 'رسید تایید شده و سفارش در حال آماده‌سازی است.'
      }
    } else if (step.rank === 0) {
      state = 'done'
    }

    return { ...step, state, hint }
  })
})
</script>

<style scoped>
.status-pill.is-ok {
  background: color-mix(in srgb, var(--color-signal) 14%, var(--color-bone));
  color: var(--color-signal);
}

.status-pill.is-bad {
  background: color-mix(in srgb, var(--color-danger) 12%, var(--color-bone));
  color: var(--color-danger);
}

.status-pill.is-move {
  background: color-mix(in srgb, var(--color-ember) 14%, var(--color-bone));
  color: var(--color-ember);
}

.status-pill.is-wait {
  background: var(--color-sand);
  color: var(--color-ash);
}

.track-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0;
}

.track-step {
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.85rem;
  position: relative;
  padding-bottom: 1.35rem;
}

.track-step:last-child {
  padding-bottom: 0;
}

.track-step:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 1.55rem;
  right: 0.9rem;
  width: 2px;
  bottom: 0.15rem;
  background: var(--color-line, #d9d0c3);
}

.track-step.is-done:not(:last-child)::before,
.track-step.is-current:not(:last-child)::before {
  background: color-mix(in srgb, var(--color-ember, #c45c26) 55%, #d9d0c3);
}

.track-step__dot {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--color-sand, #e8e0d4);
  color: var(--color-ash, #6b6560);
  font-size: 0.75rem;
  z-index: 1;
}

.track-step.is-done .track-step__dot {
  background: var(--color-ember, #c45c26);
  color: #fff;
}

.track-step.is-current .track-step__dot {
  background: #fff;
  border: 2px solid var(--color-ember, #c45c26);
  color: var(--color-ember, #c45c26);
}

.track-step.is-failed .track-step__dot {
  background: var(--color-danger, #b42318);
  color: #fff;
}

.track-step__pulse {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: currentColor;
}

.track-step.is-current .track-step__pulse {
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-ember, #c45c26) 18%, transparent);
}

.track-step__title {
  margin: 0;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--color-ink, #1c1916);
}

.track-step.is-todo .track-step__title {
  color: var(--color-ash, #6b6560);
  font-weight: 600;
}

.track-step__text {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--color-ash, #6b6560);
}

@media (prefers-reduced-motion: reduce) {
  .track-step.is-current .track-step__pulse {
    box-shadow: none;
  }
}
</style>
