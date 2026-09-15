<template>
  <section class="container-shop py-10 max-w-5xl">
    <h1 class="text-3xl font-bold mb-2">تسویه حساب</h1>
    <p class="text-steel mb-8">پرداخت کارت‌به‌کارت است. ارسال بعد از تایید رسید انجام می‌شود.</p>

    <form class="grid lg:grid-cols-[1.2fr_0.8fr] gap-6" @submit.prevent="submit">
      <div class="space-y-6">
        <div class="surface-card p-6 space-y-4">
          <h2 class="font-bold">اطلاعات گیرنده</h2>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-sm font-semibold"
              :class="form.zone === 'tehran' ? 'border-ember bg-sand' : 'border-[#ddd4c8] bg-white'"
              @click="setZone('tehran')"
            >
              ارسال به تهران
            </button>
            <button
              type="button"
              class="rounded-2xl border px-3 py-3 text-sm font-semibold"
              :class="form.zone === 'county' ? 'border-ember bg-sand' : 'border-[#ddd4c8] bg-white'"
              @click="setZone('county')"
            >
              ارسال به شهرستان
            </button>
          </div>
          <input
            v-if="form.zone === 'county'"
            v-model="form.city"
            class="field"
            placeholder="شهر"
            required
          />
          <p v-else class="text-sm text-steel">مقصد: تهران</p>
          <textarea v-model="form.address" class="field min-h-28" placeholder="آدرس کامل" required />
          <textarea v-model="form.note" class="field min-h-20" placeholder="توضیح سفارش (اختیاری)" />
        </div>

        <div class="surface-card p-6">
          <h2 class="font-bold mb-1">روش ارسال</h2>
          <p v-if="zoneHint" class="text-sm text-steel mb-4">{{ zoneHint }}</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <label
              v-for="method in visibleMethods"
              :key="method.id"
              class="border rounded-2xl p-4 cursor-pointer"
              :class="form.shippingId === method.id ? 'border-ember bg-sand' : 'border-[#ddd4c8]'"
            >
              <input v-model="form.shippingId" type="radio" :value="method.id" class="sr-only" />
              <div class="font-semibold">{{ method.name }}</div>
              <div class="text-sm text-steel mt-1">{{ method.eta }}</div>
              <div class="text-sm mt-2">
                {{ method.price ? `${formatPrice(method.price)} تومان` : 'کرایه پس از هماهنگی' }}
              </div>
              <p class="text-xs text-steel mt-2">{{ method.note }}</p>
            </label>
          </div>

          <div v-if="form.zone === 'tehran'" class="mt-6 space-y-4">
            <div>
              <p class="text-sm font-semibold mb-2">روز دریافت</p>
              <div class="flex gap-2 overflow-x-auto pb-1">
                <button
                  v-for="day in days"
                  :key="day.iso"
                  type="button"
                  class="min-w-[72px] rounded-2xl border px-2 py-2.5 text-center"
                  :class="form.deliveryDate === day.iso ? 'border-ember bg-sand' : 'border-[#ddd4c8] bg-white'"
                  @click="form.deliveryDate = day.iso"
                >
                  <span class="block text-[11px] text-steel">{{ day.weekday }}</span>
                  <span class="block text-sm font-bold">{{ day.day }}</span>
                  <span class="block text-[11px] text-steel">{{ day.month }}</span>
                </button>
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold mb-2">بازه ساعت</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  v-for="slot in tehranSlots"
                  :key="slot.id"
                  type="button"
                  class="rounded-2xl border px-2 py-2.5 text-sm font-semibold"
                  :class="form.deliverySlot === slot.id ? 'border-ember bg-sand' : 'border-[#ddd4c8] bg-white'"
                  @click="form.deliverySlot = slot.id"
                >
                  {{ slot.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="surface-card p-6 h-fit">
        <h2 class="font-bold mb-4">مبلغ قابل واریز</h2>
        <p class="flex justify-between text-sm mb-2">
          <span>کالا</span><span>{{ formatPrice(cart.totalPrice) }} تومان</span>
        </p>
        <p class="flex justify-between text-sm mb-2">
          <span>ارسال</span>
          <span>{{ shipping.price ? `${formatPrice(shipping.price)} تومان` : 'بعداً' }}</span>
        </p>
        <p v-if="scheduleText" class="text-xs text-steel mb-4 leading-6">{{ scheduleText }}</p>
        <p class="flex justify-between font-bold text-lg mb-6">
          <span>جمع</span><span>{{ formatPrice(payable) }} تومان</span>
        </p>
        <button class="btn btn-primary w-full" type="submit">ثبت سفارش و نمایش کارت</button>
      </aside>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { nextWorkingDays } from '@/data/shipping'
import { useShippingStore } from '@/stores/shippingStore'
import { formatPrice } from '@/utils/money'

const cart = useCartStore()
const auth = useAuthStore()
const orders = useOrderStore()
const shippingStore = useShippingStore()
const tehranSlots = computed(() => shippingStore.slots)
const router = useRouter()
const toast = useToast()
const days = nextWorkingDays(7)

const initialTehran = /تهران/.test(auth.user?.city || '')

const form = reactive({
  zone: initialTehran ? 'tehran' : 'county',
  city: initialTehran ? 'تهران' : auth.user?.city || '',
  address: auth.user?.address || '',
  note: '',
  shippingId: initialTehran ? 'tehran-courier' : 'tipax',
  deliveryDate: days[0]?.iso || '',
  deliverySlot: '09-12',
})

const visibleMethods = computed(() => shippingStore.methodsFor(form.zone))
const shipping = computed(() => shippingStore.getShipping(form.shippingId))
const payable = computed(() => cart.totalPrice + (shipping.value.price || 0))
const zoneHint = computed(() =>
  form.zone === 'county' ? 'ارسال شهرستان بین ۳ تا ۷ روز کاری زمان می‌برد.' : '',
)
const scheduleText = computed(() => {
  if (form.zone !== 'tehran' || !form.deliveryDate) return ''
  const day = days.find((item) => item.iso === form.deliveryDate)
  return `${day?.label || ''} · ${shippingStore.slotLabel(form.deliverySlot)}`
})

onMounted(() => {
  if (!cart.items.length) router.push('/cart')
})

function setZone(zone) {
  form.zone = zone
  form.shippingId = zone === 'tehran' ? 'tehran-courier' : 'tipax'
  form.city = zone === 'tehran' ? 'تهران' : form.city === 'تهران' ? '' : form.city
}

async function submit() {
  if (!cart.items.length) return
  if (form.zone === 'tehran' && (!form.deliveryDate || !form.deliverySlot)) {
    toast.error('روز و بازه ساعت تهران را انتخاب کنید')
    return
  }
  if (form.zone === 'county' && !form.city.trim()) {
    toast.error('شهر را وارد کنید')
    return
  }
  await auth.updateProfile({ city: form.city, address: form.address })
  const order = await orders.createOrder({
    user: auth.user,
    items: cart.items.map((item) => ({ ...item })),
    subtotal: cart.totalPrice,
    shippingId: form.shippingId,
    city: form.city,
    address: form.address,
    note: form.note,
    destination: form.zone,
    deliveryDate: form.zone === 'tehran' ? form.deliveryDate : '',
    deliverySlot: form.zone === 'tehran' ? form.deliverySlot : '',
  })
  cart.clearCart()
  router.push({ name: 'OrderStatus', params: { id: order.id } })
}
</script>
