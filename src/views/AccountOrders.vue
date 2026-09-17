<template>
  <section class="account-panel">
    <header class="mb-5">
      <h1 class="text-2xl font-extrabold">سفارش‌های من</h1>
      <p class="mt-2 text-sm leading-7 text-steel">وضعیت ارسال، رسید و فاکتور هر خرید را از اینجا ببینید.</p>
    </header>

    <div v-if="!list.length" class="surface-card px-5 py-12 text-center">
      <p class="font-extrabold">هنوز سفارشی ثبت نشده است.</p>
      <p class="mt-2 text-sm text-steel">بعد از ثبت خرید، سفارش این‌جا ظاهر می‌شود.</p>
      <router-link to="/products" class="btn btn-primary mt-5">شروع خرید</router-link>
    </div>

    <div v-else class="space-y-4">
      <article v-for="order in list" :key="order.id" class="surface-card p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs text-steel">شماره سفارش</p>
            <p class="mt-1 font-extrabold">{{ order.id }}</p>
            <p class="mt-2 text-sm text-steel">
              {{ order.shipping?.name || 'ارسال فروشگاه' }} · {{ formatPrice(order.total) }} تومان
            </p>
          </div>
          <span class="status-pill" :class="statusTone(order.status)">
            {{ statusLabel[order.status] }}
          </span>
        </div>

        <ul v-if="order.items?.length" class="mt-4 space-y-1 text-sm text-steel">
          <li v-for="item in order.items.slice(0, 3)" :key="`${order.id}-${item.slug || item.title}`">
            {{ item.title }}
            <span v-if="item.qty"> × {{ item.qty }}</span>
          </li>
        </ul>

        <div class="mt-5 flex flex-wrap gap-2">
          <router-link :to="`/orders/${order.id}`" class="btn btn-dark min-h-10 text-sm">
            پیگیری سفارش
          </router-link>
          <router-link
            v-if="needsPay(order)"
            :to="`/orders/${order.id}/pay`"
            class="btn btn-primary min-h-10 text-sm"
          >
            پرداخت / رسید
          </router-link>
          <router-link :to="`/invoice/${order.id}`" class="btn btn-ghost min-h-10 text-sm">
            {{ needsPay(order) ? 'چاپ پیش‌فاکتور' : 'چاپ فاکتور' }}
          </router-link>
        </div>

        <div v-if="canReview(order)" class="mt-5 border-t border-sand pt-4">
          <p class="text-sm font-extrabold">نظر درباره این خرید</p>
          <p v-if="reviews.hasForOrder(order.id)" class="mt-2 text-sm leading-7 text-steel">
            نظرتان ثبت شد و بعد از تایید روی صفحه اصلی می‌آید.
          </p>
          <form v-else class="mt-3 grid gap-3" @submit.prevent="submitReview(order)">
            <label class="text-sm font-semibold">
              امتیاز
              <select v-model.number="draftOf(order.id).rating" class="field mt-1">
                <option :value="5">۵ ستاره</option>
                <option :value="4">۴ ستاره</option>
                <option :value="3">۳ ستاره</option>
                <option :value="2">۲ ستاره</option>
                <option :value="1">۱ ستاره</option>
              </select>
            </label>
            <textarea
              v-model="draftOf(order.id).text"
              rows="3"
              class="field"
              placeholder="کیفیت کالا و ارسال را بنویسید"
            />
            <button class="btn btn-primary min-h-10 w-fit text-sm" type="submit">ارسال نظر</button>
          </form>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useReviewStore } from '@/stores/reviewStore'
import { ORDER_STATUS, statusLabel } from '@/data/orderStatus'
import { formatPrice } from '@/utils/money'

const toast = useToast()
const auth = useAuthStore()
const orders = useOrderStore()
const reviews = useReviewStore()
const list = computed(() => (auth.user ? orders.byUser(auth.user.id) : []))
const drafts = reactive({})

const reviewable = new Set([
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
])

function draftOf(id) {
  if (!drafts[id]) drafts[id] = { rating: 5, text: '' }
  return drafts[id]
}

function canReview(order) {
  return reviewable.has(order.status)
}

function needsPay(order) {
  return (
    order.status === ORDER_STATUS.AWAITING_RECEIPT ||
    order.status === ORDER_STATUS.REJECTED ||
    order.status === ORDER_STATUS.AWAITING_REVIEW
  )
}

function statusTone(status) {
  if (status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.APPROVED) return 'is-ok'
  if (status === ORDER_STATUS.REJECTED) return 'is-bad'
  if (status === ORDER_STATUS.SHIPPED || status === ORDER_STATUS.PREPARING) return 'is-move'
  return 'is-wait'
}

async function submitReview(order) {
  const draft = draftOf(order.id)
  if (!String(draft.text).trim()) {
    toast.error('متن نظر را بنویسید')
    return
  }
  const saved = await reviews.submit({
    user: auth.user,
    order,
    rating: draft.rating,
    text: draft.text,
  })
  if (!saved) {
    toast.error('برای این سفارش قبلاً نظر ثبت شده است')
    return
  }
  toast.success('نظر ثبت شد')
}
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
</style>
