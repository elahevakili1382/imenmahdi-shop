<template>
  <section>
    <h1 class="text-2xl font-bold mb-6">سفارش‌های من</h1>
    <div v-if="!list.length" class="dash-card text-center">
      سفارشی ندارید.
      <router-link to="/products" class="btn btn-primary mt-4">خرید</router-link>
    </div>
    <div v-else class="space-y-4">
      <article
        v-for="order in list"
        :key="order.id"
        class="dash-card"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-bold">{{ order.id }}</p>
            <p class="text-sm text-slate-400">
              {{ statusLabel[order.status] }} · {{ order.shipping?.name }} ·
              {{ formatPrice(order.total) }} تومان
            </p>
          </div>
          <div class="flex gap-2">
            <router-link :to="`/orders/${order.id}`" class="btn btn-ghost min-h-10 text-sm">
              پیگیری
            </router-link>
            <router-link :to="`/orders/${order.id}/pay`" class="btn btn-ghost min-h-10 text-sm">
              رسید
            </router-link>
            <router-link :to="`/invoice/${order.id}`" class="btn btn-primary min-h-10 text-sm">
              چاپ فاکتور
            </router-link>
          </div>
        </div>

        <div v-if="canReview(order)" class="mt-4 border-t border-[#2C2C2E] pt-4">
          <p class="text-sm font-semibold mb-2">نظر درباره این خرید</p>
          <p v-if="reviews.hasForOrder(order.id)" class="text-sm text-slate-400">
            نظرتان ثبت شد و بعد از تایید مدیر روی صفحه اصلی می‌آید.
          </p>
          <form v-else class="grid gap-3" @submit.prevent="submitReview(order)">
            <label class="text-xs text-slate-400">
              امتیاز
              <select v-model.number="draftOf(order.id).rating" class="mt-1 w-full rounded-xl bg-night border border-white/10 px-3 py-2 text-sm">
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
              class="w-full rounded-xl bg-night border border-white/10 px-3 py-2 text-sm"
              placeholder="کیفیت کالا و ارسال را بنویسید"
            />
            <button class="btn btn-primary min-h-10 text-sm w-fit" type="submit">ارسال نظر</button>
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
  toast.success('نظر ثبت شد و منتظر تایید مدیر است')
}
</script>
