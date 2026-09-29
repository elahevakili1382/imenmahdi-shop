<template>
  <section class="checkout-page">
    <div class="container-shop checkout-page__inner">
      <header class="checkout-top">
        <div>
          <h1>مشخصات و ارسال</h1>
          <p>آدرس گیرنده و روش ارسال را تکمیل کنید؛ سپس به درگاه امن زرین‌پال هدایت می‌شوید.</p>
        </div>
        <CheckoutSteps current="checkout" />
      </header>

      <form class="checkout-layout" @submit.prevent="submit">
        <div class="checkout-main">
          <section class="checkout-card">
            <div class="checkout-card__head">
              <span class="checkout-card__icon" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>
              <div>
                <h2>اطلاعات گیرنده</h2>
                <p>منطقه ارسال و آدرس تحویل را مشخص کنید</p>
              </div>
            </div>

            <div class="zone-grid">
              <button
                type="button"
                class="zone-btn"
                :class="{ 'is-active': form.zone === 'tehran' }"
                :aria-pressed="form.zone === 'tehran'"
                @click="setZone('tehran')"
              >
                <i class="fa-solid fa-city" aria-hidden="true"></i>
                ارسال به تهران
              </button>
              <button
                type="button"
                class="zone-btn"
                :class="{ 'is-active': form.zone === 'county' }"
                :aria-pressed="form.zone === 'county'"
                @click="setZone('county')"
              >
                <i class="fa-solid fa-map" aria-hidden="true"></i>
                ارسال به شهرستان
              </button>
            </div>

            <div class="checkout-fields">
              <label v-if="form.zone === 'county'" class="field-block">
                <span class="field-label">شهر <em>*</em></span>
                <input v-model="form.city" class="field-input" autocomplete="address-level2" required />
              </label>
              <p v-else class="zone-note">مقصد ارسال: تهران</p>

              <label class="field-block field-block--address">
                <span class="field-label">آدرس کامل <em>*</em></span>
                <textarea
                  v-model="form.address"
                  class="field-input field-input--area"
                  autocomplete="street-address"
                  required
                  rows="3"
                />
              </label>

              <label class="field-block field-block--note">
                <span class="field-label">توضیح سفارش (اختیاری)</span>
                <textarea v-model="form.note" class="field-input field-input--area field-input--short" rows="2" />
              </label>
            </div>
          </section>

          <section class="checkout-card">
            <div class="checkout-card__head">
              <span class="checkout-card__icon" aria-hidden="true"><i class="fa-solid fa-truck-fast"></i></span>
              <div>
                <h2>روش ارسال</h2>
                <p>{{ zoneHint || 'روش مناسب تحویل را انتخاب کنید' }}</p>
              </div>
            </div>

            <div class="ship-grid">
              <label
                v-for="method in visibleMethods"
                :key="method.id"
                class="ship-card"
                :class="{ 'is-active': form.shippingId === method.id }"
              >
                <input v-model="form.shippingId" type="radio" :value="method.id" class="sr-only" />
                <div class="ship-card__top">
                  <strong>{{ method.name }}</strong>
                  <span>
                    {{ shippingFeeShort(method) || `${formatPrice(method.price)} تومان` }}
                  </span>
                </div>
                <p>{{ method.eta }}</p>
                <small>{{ method.note }}</small>
              </label>
            </div>

            <div v-if="form.zone === 'tehran'" class="schedule">
              <div class="schedule__block">
                <p class="schedule__label">روز دریافت</p>
                <div class="day-row" role="listbox" aria-label="روز دریافت">
                  <button
                    v-for="day in days"
                    :key="day.iso"
                    type="button"
                    class="day-btn"
                    role="option"
                    :class="{ 'is-active': form.deliveryDate === day.iso }"
                    :aria-selected="form.deliveryDate === day.iso"
                    @click="form.deliveryDate = day.iso"
                  >
                    <span>{{ day.weekday }}</span>
                    <strong>{{ day.day }}</strong>
                    <em>{{ day.month }}</em>
                  </button>
                </div>
              </div>
              <div class="schedule__block">
                <p class="schedule__label">بازه ساعت</p>
                <div class="slot-grid">
                  <button
                    v-for="slot in tehranSlots"
                    :key="slot.id"
                    type="button"
                    class="slot-btn"
                    :class="{ 'is-active': form.deliverySlot === slot.id }"
                    :aria-pressed="form.deliverySlot === slot.id"
                    @click="form.deliverySlot = slot.id"
                  >
                    {{ slot.label }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="checkout-card checkout-items checkout-items--mobile">
            <div class="checkout-card__head">
              <span class="checkout-card__icon" aria-hidden="true"><i class="fa-solid fa-box"></i></span>
              <div>
                <h2>اقلام سفارش</h2>
                <p>{{ cart.totalCount }} قلم در سبد</p>
              </div>
            </div>
            <ul>
              <li v-for="item in cart.items" :key="item.id + item.size">
                <img :src="asset(item.image)" :alt="item.title" loading="lazy" decoding="async" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>سایز {{ item.size }} · {{ item.quantity }} عدد</span>
                </div>
                <em>{{ formatPrice(toNumber(item.price) * item.quantity) }} تومان</em>
              </li>
            </ul>
          </section>
        </div>

        <aside class="checkout-summary">
          <div class="checkout-summary__head">
            <h2>خلاصه سفارش</h2>
            <span>{{ cart.totalCount }} قلم کالا</span>
          </div>

          <ul class="checkout-summary__items">
            <li v-for="item in cart.items" :key="'s-' + item.id + item.size">
              <img :src="asset(item.image)" :alt="item.title" loading="lazy" decoding="async" />
              <div>
                <strong>{{ item.title }}</strong>
                <span>سایز {{ item.size }} · {{ item.quantity }} عدد</span>
              </div>
              <em>{{ formatPrice(toNumber(item.price) * item.quantity) }}</em>
            </li>
          </ul>

          <div class="checkout-summary__rows">
            <p>
              <span>جمع ارزش اقلام</span>
              <strong>{{ formatPrice(cart.totalPrice) }} تومان</strong>
            </p>
            <p>
              <span>هزینه حمل و ترخیص</span>
              <em>{{
                shippingFeeShort(shipping) || `${formatPrice(shipping.price)} تومان`
              }}</em>
            </p>
            <p v-if="scheduleText" class="checkout-summary__schedule">{{ scheduleText }}</p>
          </div>

          <div class="checkout-summary__total">
            <span>مبلغ نهایی پرداختی</span>
            <strong>{{ formatPrice(payable) }} تومان</strong>
          </div>

          <button class="checkout-summary__primary" type="submit" :disabled="pending">
            {{ pending ? 'در حال انتقال به درگاه...' : 'پرداخت آنلاین با زرین‌پال' }}
            <i v-if="!pending" class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
          <router-link to="/cart/invoice" class="checkout-summary__secondary">
            <i class="fa-solid fa-print" aria-hidden="true"></i>
            دریافت پیش‌فاکتور معتبر و چاپ
          </router-link>
          <router-link to="/cart" class="checkout-summary__back">
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            بازگشت به سبد
          </router-link>
        </aside>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import CheckoutSteps from '@/components/CheckoutSteps.vue'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { nextWorkingDays, shippingFeeShort } from '@/data/shipping'
import { useShippingStore } from '@/stores/shippingStore'
import { asset } from '@/utils/asset'
import { formatPrice, toNumber } from '@/utils/money'

const cart = useCartStore()
const auth = useAuthStore()
const orders = useOrderStore()
const shippingStore = useShippingStore()
const tehranSlots = computed(() => shippingStore.slots)
const router = useRouter()
const toast = useToast()
const days = nextWorkingDays(7)
const pending = ref(false)

const initialTehran = /تهران/.test(auth.user?.city || '')

const form = reactive({
  zone: initialTehran ? 'tehran' : 'county',
  city: initialTehran ? 'تهران' : auth.user?.city || '',
  address: auth.user?.address || '',
  note: '',
  shippingId: initialTehran ? 'tehran-courier' : 'tipax',
  deliveryDate: days[0]?.iso || '',
  deliverySlot: tehranSlots.value[0]?.id || '09-12',
})

watch(
  tehranSlots,
  (slots) => {
    if (!slots.some((slot) => slot.id === form.deliverySlot)) {
      form.deliverySlot = slots[0]?.id || ''
    }
  },
  { immediate: true },
)

const visibleMethods = computed(() => shippingStore.methodsFor(form.zone))
const shipping = computed(() => shippingStore.getShipping(form.shippingId))
const payable = computed(() => {
  if (shippingFeeShort(shipping.value)) return cart.totalPrice
  return cart.totalPrice + (shipping.value.price || 0)
})
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
  if (!cart.items.length || pending.value) return
  if (form.zone === 'tehran' && (!form.deliveryDate || !form.deliverySlot)) {
    toast.error('روز و بازه ساعت تهران را انتخاب کنید')
    return
  }
  if (form.zone === 'county' && !form.city.trim()) {
    toast.error('شهر را وارد کنید')
    return
  }
  pending.value = true
  try {
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
      paymentMethod: 'zarinpal',
    })
    cart.clearCart()
    if (order.paymentMethod === 'zarinpal') {
      try {
        const pay = await orders.startZarinpalPay(order.id)
        window.location.href = pay.paymentUrl
        return
      } catch (payErr) {
        toast.error(payErr.message || 'انتقال به درگاه انجام نشد. می‌توانید از صفحه سفارش دوباره تلاش کنید.')
        router.push({ name: 'OrderStatus', params: { id: order.id } })
        return
      }
    }
    router.push({ name: 'OrderStatus', params: { id: order.id } })
  } catch (err) {
    toast.error(err.message || 'ثبت سفارش انجام نشد. دوباره تلاش کنید.')
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  background: transparent;
  padding-block: 1rem 2rem;
  min-height: 60vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.checkout-page__inner {
  display: grid;
  gap: 1rem;
  width: 100%;
  max-width: 980px;
  min-width: 0;
  margin-inline: auto;
}

.checkout-top {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
  max-width: 100%;
}

.checkout-top h1 {
  margin: 0;
  font-size: clamp(1.2rem, 4.5vw, 1.65rem);
  font-weight: 900;
  color: #0f172a;
}

.checkout-top > div > p {
  margin: 0.35rem 0 0;
  max-width: 36rem;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.7;
}

.checkout-layout {
  display: grid;
  gap: 1rem;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.checkout-main {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
  max-width: 100%;
}

.checkout-card {
  padding: 0.85rem;
  border-radius: 1.1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

.checkout-card__head {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.checkout-card__icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: #fff7ed;
  color: #ea580c;
}

.checkout-card__head h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
  color: #0f172a;
}

.checkout-card__head p {
  margin: 0.2rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
}

.zone-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.zone-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 3rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
}

.zone-btn.is-active {
  border-color: #ea580c;
  background: #fff7ed;
  color: #9a3412;
}

.zone-note {
  margin: 0 0 0.85rem;
  color: #64748b;
  font-size: 0.84rem;
}

.field-block {
  display: grid;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.field-label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}

.field-label em {
  color: #ea580c;
  font-style: normal;
}

.field-input {
  width: 100%;
  min-height: 2.85rem;
  padding: 0.7rem 0.85rem;
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.9rem;
}

.field-input:focus {
  outline: 2px solid color-mix(in srgb, #ea580c 35%, transparent);
  border-color: #fdba74;
  background: #fff;
}

.field-input--area {
  min-height: 4.5rem;
  resize: vertical;
}

.field-input--short {
  min-height: 3.25rem;
}

.ship-grid {
  display: grid;
  gap: 0.65rem;
}

.ship-card {
  display: grid;
  gap: 0.35rem;
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
}

.ship-card.is-active {
  border-color: #ea580c;
  background: #fff7ed;
}

.ship-card__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.75rem;
}

.ship-card__top strong {
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 800;
  min-width: 0;
}

.ship-card__top span {
  color: #ea580c;
  font-size: 0.8rem;
  font-weight: 800;
}

.ship-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
}

.ship-card small {
  color: #94a3b8;
  font-size: 0.72rem;
  line-height: 1.6;
}

.schedule {
  display: grid;
  gap: 1rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
  min-width: 0;
  max-width: 100%;
}

.schedule__block {
  min-width: 0;
  max-width: 100%;
}

.schedule__label {
  margin: 0 0 0.55rem;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 800;
}

.day-row {
  display: flex;
  gap: 0.45rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
  padding-bottom: 0.35rem;
  scrollbar-width: thin;
}

.day-btn {
  flex: 0 0 auto;
  width: 4.1rem;
  min-width: 4.1rem;
  min-height: 4.4rem;
  padding: 0.4rem 0.25rem;
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  scroll-snap-align: start;
}

.day-btn span,
.day-btn em {
  display: block;
  color: #94a3b8;
  font-size: 0.65rem;
  font-style: normal;
  line-height: 1.3;
}

.day-btn strong {
  display: block;
  margin: 0.15rem 0;
  color: #0f172a;
  font-size: 0.92rem;
}

.day-btn.is-active {
  border-color: #ea580c;
  background: #fff7ed;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  min-width: 0;
  max-width: 100%;
}

.slot-btn {
  min-height: 2.75rem;
  min-width: 0;
  padding: 0.45rem 0.35rem;
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-btn.is-active {
  border-color: #ea580c;
  background: #fff7ed;
  color: #9a3412;
}

.checkout-items ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
}

.checkout-items li {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr);
  gap: 0.55rem 0.7rem;
  align-items: center;
  padding: 0.55rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  min-width: 0;
}

.checkout-items img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  border-radius: 0.65rem;
  background: #fff;
}

.checkout-items li > div {
  min-width: 0;
}

.checkout-items strong {
  display: block;
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.checkout-items span {
  display: block;
  margin-top: 0.15rem;
  color: #64748b;
  font-size: 0.72rem;
}

.checkout-items em {
  grid-column: 2;
  color: #ea580c;
  font-style: normal;
  font-size: 0.78rem;
  font-weight: 800;
}

.checkout-summary {
  padding: 1rem;
  border-radius: 1.15rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  height: fit-content;
  min-width: 0;
}

.checkout-summary__items {
  display: none;
}

.checkout-summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.checkout-summary__head h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
}

.checkout-summary__head span {
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  background: #eef4ff;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
}

.checkout-summary__rows {
  display: grid;
  gap: 0.7rem;
  padding-bottom: 0.95rem;
  border-bottom: 1px dashed #e2e8f0;
}

.checkout-summary__rows p {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.75rem;
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
}

.checkout-summary__rows strong {
  color: #0f172a;
  font-weight: 800;
}

.checkout-summary__rows em {
  font-style: normal;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
  text-align: left;
}

.checkout-summary__schedule {
  display: block !important;
  color: #64748b !important;
  font-size: 0.78rem !important;
  line-height: 1.6;
}

.checkout-summary__total {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem 0.75rem;
  margin: 1rem 0 1.15rem;
}

.checkout-summary__total span {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.checkout-summary__total strong {
  color: #ea580c;
  font-size: clamp(1.05rem, 4vw, 1.2rem);
  font-weight: 900;
}

.checkout-summary__primary,
.checkout-summary__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.9rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.9rem;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
}

.checkout-summary__primary {
  border: 0;
  background: #c2410c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(194, 65, 12, 0.28);
}

.checkout-summary__primary:hover:not(:disabled) {
  background: #9a3412;
}

.checkout-summary__primary:disabled {
  opacity: 0.65;
  cursor: wait;
}

.checkout-summary__secondary {
  margin-top: 0.65rem;
  border: 0;
  background: #e8f1ff;
  color: #1e3a5f;
}

.checkout-summary__secondary:hover {
  background: #dbe7f8;
}

.checkout-summary__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  margin-top: 0.65rem;
  min-height: 2.4rem;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.checkout-summary__back:hover {
  color: #ea580c;
}

@media (min-width: 480px) {
  .zone-grid {
    grid-template-columns: 1fr 1fr;
  }

  .checkout-items li {
    grid-template-columns: 3.25rem minmax(0, 1fr) auto;
  }

  .checkout-items em {
    grid-column: auto;
    white-space: nowrap;
  }
}

@media (min-width: 640px) {
  .checkout-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem 1rem;
  }

  .checkout-card {
    padding: 1rem;
  }

  .checkout-card__head {
    margin-bottom: 0.75rem;
  }

  .ship-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .slot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .slot-btn {
    font-size: 0.82rem;
  }

  .zone-btn {
    min-height: 2.65rem;
  }

  .field-block {
    margin-bottom: 0.65rem;
  }
}

@media (min-width: 900px) {
  .checkout-page {
    padding-block: 1.15rem 2rem;
  }

  .checkout-page__inner {
    gap: 0.85rem;
  }

  .checkout-top h1 {
    font-size: 1.35rem;
  }

  .checkout-top > div > p {
    font-size: 0.8rem;
  }

  .checkout-layout {
    grid-template-columns: minmax(0, 1fr) 18.5rem;
    align-items: start;
    gap: 1rem;
  }

  .checkout-main {
    gap: 0.75rem;
  }

  .checkout-summary {
    position: sticky;
    top: 6.25rem;
    padding: 1rem;
  }

  .checkout-summary__items {
    display: grid;
    gap: 0.5rem;
    margin: 0 0 0.85rem;
    padding: 0 0 0.85rem;
    list-style: none;
    border-bottom: 1px dashed #e2e8f0;
    max-height: 12rem;
    overflow-y: auto;
  }

  .checkout-summary__items li {
    display: grid;
    grid-template-columns: 2.4rem minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: center;
  }

  .checkout-summary__items img {
    width: 2.4rem;
    height: 2.4rem;
    object-fit: contain;
    border-radius: 0.5rem;
    background: #f8fafc;
  }

  .checkout-summary__items strong {
    display: block;
    font-size: 0.72rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .checkout-summary__items span {
    display: block;
    margin-top: 0.1rem;
    font-size: 0.65rem;
    color: #94a3b8;
  }

  .checkout-summary__items em {
    font-style: normal;
    font-size: 0.7rem;
    font-weight: 800;
    color: #ea580c;
    white-space: nowrap;
  }

  .checkout-items--mobile {
    display: none;
  }

  .checkout-card {
    padding: 0.95rem 1.05rem;
  }

  .ship-card {
    padding: 0.75rem;
  }

  .ship-card small {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .day-btn {
    width: 3.75rem;
    min-width: 3.75rem;
    min-height: 3.9rem;
  }

  .checkout-summary__total {
    margin: 0.75rem 0 0.85rem;
  }

  .checkout-summary__total strong {
    font-size: 1.05rem;
  }

  .checkout-summary__primary,
  .checkout-summary__secondary {
    min-height: 2.65rem;
    font-size: 0.82rem;
  }

  .field-input--area {
    min-height: 3.75rem;
  }

  .field-input--short {
    min-height: 2.85rem;
  }
}
</style>
