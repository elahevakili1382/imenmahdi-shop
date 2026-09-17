<template>
  <section v-if="!order" class="container-shop py-20 text-center">سفارش پیدا نشد.</section>
  <section v-else-if="denied" class="container-shop py-20 text-center">به این سفارش دسترسی ندارید.</section>
  <section v-else class="container-shop py-8 sm:py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
    <div class="space-y-6">
      <CheckoutSteps current="pay" />

      <nav class="text-sm text-steel mb-4" aria-label="مسیر">
        <router-link :to="`/orders/${order.id}`" class="hover:text-ember">پیگیری سفارش</router-link>
        <span aria-hidden="true"> / </span>
        <span>پرداخت و رسید</span>
      </nav>

      <div class="surface-card p-5 sm:p-6">
        <p class="text-sm text-steel">سفارش {{ order.id }}</p>
        <h1 class="text-3xl font-bold mt-1">پرداخت و ارسال رسید</h1>
        <p class="mt-3 status-pill bg-sand">{{ statusLabel[order.status] }}</p>
        <p class="text-sm text-steel mt-4 leading-7">
          ارسال با {{ order.shipping?.name }} به {{ order.city }}
          <span v-if="order.deliveryDate">
            ·
            {{
              new Date(order.deliveryDate).toLocaleDateString('fa-IR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            }}
            · {{ shipping.slotLabel(order.deliverySlot) }}
          </span>
          <span v-else-if="order.destination === 'county'"> · ۳ تا ۷ روز کاری</span>
        </p>
        <ol class="pay-steps mt-5">
          <li>مبلغ را به کارت زیر واریز کنید.</li>
          <li>مبلغ دقیق و ۴ رقم آخر کارت خود را وارد کنید.</li>
          <li>عکس رسید را بفرستید تا بات بررسی کند.</li>
        </ol>
      </div>

      <div class="surface-card p-5 sm:p-6">
        <h2 class="font-bold mb-3">۱. شماره کارت فروشگاه</h2>
        <p class="text-2xl font-extrabold tracking-wider dir-ltr text-left">
          {{ formatCardNumber(order.bank.cardNumber) }}
        </p>
        <p class="text-sm text-steel mt-2">{{ order.bank.accountHolder }} · {{ order.bank.bankName }}</p>
        <p v-if="order.bank.accountNumber" class="text-sm mt-1 dir-ltr text-left">
          شماره حساب: {{ order.bank.accountNumber }}
        </p>
        <p v-if="order.bank.sheba" class="text-sm mt-1 dir-ltr text-left tracking-wide">
          شبا: {{ order.bank.sheba }}
        </p>
        <p class="font-bold mt-4">مبلغ: {{ formatPrice(order.total) }} تومان</p>
        <button class="btn btn-ghost mt-4 min-h-11" type="button" @click="copyCard">کپی شماره کارت</button>
      </div>

      <div class="surface-card p-5 sm:p-6">
        <h2 class="font-bold mb-3">۲. بارگذاری رسید</h2>
        <p class="text-sm text-steel mb-4 leading-7">
          تصویر باید رسید بانکی باشد. سرور با OCR، مقایسه با عکس کالا و حافظه رسیدهای جعلی/اصل قبلی بررسی می‌کند؛ تایید نهایی با ادمین است.
        </p>
        <form class="space-y-3" @submit.prevent="upload">
          <input v-model="declaredAmount" class="field" placeholder="مبلغ واریزی به تومان" required />
          <input v-model="last4" class="field" maxlength="4" placeholder="چهار رقم آخر کارت شما" required />
          <input type="file" accept="image/*" class="field" required @change="onFile" />
          <button class="btn btn-primary w-full min-h-11" :disabled="busy" type="submit">
            {{ busy ? 'در حال بررسی در سرور...' : 'ارسال رسید برای بررسی' }}
          </button>
        </form>
        <p v-if="order.botResult" class="text-sm mt-4 font-semibold">
          نتیجه بات: {{ botDecisionLabel[order.botResult.decision] }}
        </p>
        <p v-if="order.botResult?.customerHint" class="text-sm text-steel mt-2 leading-7">
          {{ order.botResult.customerHint }}
        </p>
        <ul v-if="order.botResult?.issues?.length" class="text-sm text-steel mt-2 list-disc pr-5">
          <li v-for="issue in order.botResult.issues" :key="issue">{{ issue }}</li>
        </ul>
      </div>
    </div>

    <aside class="space-y-4">
      <div class="surface-card p-5 sm:p-6">
        <h2 class="font-bold mb-3">اقلام</h2>
        <div
          v-for="item in order.items"
          :key="item.id + item.size"
          class="flex justify-between text-sm py-2 border-b border-[#eee8de]"
        >
          <span>{{ item.title }} × {{ item.quantity }}</span>
          <span>{{ formatPrice(item.price * item.quantity) }}</span>
        </div>
        <router-link :to="`/invoice/${order.id}`" class="btn btn-dark w-full mt-6 min-h-11">
          چاپ پیش‌فاکتور
        </router-link>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckoutSteps from '@/components/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useShippingStore } from '@/stores/shippingStore'
import { statusLabel } from '@/data/orderStatus'
import { formatCardNumber, formatPrice } from '@/utils/money'
import { runReceiptBot, botDecisionLabel } from '@/services/receiptBot'
import { asset } from '@/utils/asset'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const orders = useOrderStore()
const shipping = useShippingStore()
const toast = useToast()

const order = computed(() => orders.byId(route.params.id))
const denied = computed(() => order.value && !auth.canAccessOrder(order.value))
const declaredAmount = ref('')
const last4 = ref('')
const file = ref(null)
const busy = ref(false)

function onFile(event) {
  file.value = event.target.files?.[0] || null
}

function copyCard() {
  navigator.clipboard.writeText(order.value.bank.cardNumber)
  toast.success('شماره کارت کپی شد')
}

function readFile(selected) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(selected)
  })
}

async function upload() {
  if (!file.value || !order.value) return
  busy.value = true
  try {
    const dataUrl = await readFile(file.value)
    const payload = {
      dataUrl,
      name: file.value.name,
      declaredAmount: declaredAmount.value || order.value.total,
      last4: last4.value,
    }
    if (!auth.online) {
      payload.botResult = await runReceiptBot({
        file: file.value,
        dataUrl,
        declaredAmount: payload.declaredAmount,
        orderTotal: order.value.total,
        last4: last4.value,
        existingOrders: orders.orders,
        orderId: order.value.id,
        productImages: (order.value.items || [])
          .flatMap((item) => [item.image, ...(item.gallery || [])])
          .filter(Boolean)
          .map((src) => asset(src)),
      })
    }
    const saved = await orders.applyReceipt(order.value.id, payload)
    toast.success(saved?.botResult?.customerHint || 'رسید برای بررسی ارسال شد')
    router.push({ name: 'OrderTracking', params: { id: order.value.id } })
  } catch {
    toast.error('بررسی رسید انجام نشد')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid #ddd4c8;
  border-radius: 12px;
  padding: 12px 14px;
  min-height: 48px;
  background: #fff;
}

.pay-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.pay-steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-ash, #6b6560);
}

.pay-steps li::before {
  content: counter(step);
  counter-increment: step;
  display: grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  margin-top: 0.15rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ember, #c45c26) 14%, #fff);
  color: var(--color-ember, #c45c26);
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.pay-steps {
  counter-reset: step;
}
</style>
