<template>
  <section class="container-shop py-8 sm:py-10">
    <CheckoutSteps current="cart" />

    <div class="flex flex-wrap items-end justify-between gap-3 mb-8">
      <div>
        <h1 class="text-3xl font-bold">سبد خرید</h1>
        <p class="text-sm text-steel mt-2">
          {{ cart.totalCount }} قلم · جمع کالا {{ formatPrice(cart.totalPrice) }} تومان
        </p>
      </div>
      <router-link to="/products" class="btn btn-ghost min-h-11">ادامه خرید</router-link>
    </div>

    <div v-if="!cart.items.length" class="surface-card p-10 text-center max-w-md mx-auto">
      <p class="font-bold mb-2">سبد خرید خالی است</p>
      <p class="text-sm text-steel leading-7 mb-5">
        کالای ایمنی را از کاتالوگ انتخاب کنید تا تعداد، سایز و پیش‌فاکتور اینجا جمع شود.
      </p>
      <router-link to="/products" class="btn btn-primary min-h-11">شروع خرید از کاتالوگ</router-link>
    </div>

    <div v-else class="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] gap-6">
      <div class="space-y-4">
        <article
          v-for="item in cart.items"
          :key="item.id + item.size"
          class="surface-card p-4 grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)_auto] gap-4 items-start"
        >
          <router-link
            :to="item.slug ? `/products/${item.slug}` : '/products'"
            class="product-well w-full aspect-square rounded-xl p-2 border border-[#eee8de]"
          >
            <img :src="asset(item.image)" :alt="item.title" class="w-full h-full object-contain" loading="lazy" decoding="async" />
          </router-link>

          <div class="min-w-0">
            <router-link
              :to="item.slug ? `/products/${item.slug}` : '/products'"
              class="font-semibold leading-7 hover:underline"
            >
              {{ item.title }}
            </router-link>
            <p class="text-sm text-steel mt-1">سایز {{ item.size }}</p>
            <p class="text-sm mt-2">واحد: {{ formatPrice(item.price) }} تومان</p>
            <p class="font-semibold mt-1 sm:hidden">جمع: {{ formatPrice(lineTotal(item)) }} تومان</p>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <div class="qty-stepper" role="group" :aria-label="`تعداد ${item.title}`">
                <button type="button" aria-label="کاهش تعداد" @click="cart.changeQuantity(item.id, item.size, -1)">
                  −
                </button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :aria-label="`تعداد ${item.title}`"
                  @change="cart.updateQuantity(item.id, item.size, Number($event.target.value))"
                />
                <button type="button" aria-label="افزایش تعداد" @click="cart.changeQuantity(item.id, item.size, 1)">
                  +
                </button>
              </div>
              <button
                class="remove-btn"
                type="button"
                aria-label="حذف از سبد"
                @click="cart.removeFromCart(item.id, item.size)"
              >
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <p class="hidden sm:block text-left font-semibold whitespace-nowrap">
            {{ formatPrice(lineTotal(item)) }} تومان
          </p>
        </article>
      </div>

      <aside class="surface-card p-6 h-fit lg:sticky lg:top-24 cart-summary">
        <h2 class="font-bold mb-4">خلاصه سفارش</h2>
        <p class="flex justify-between mb-2 text-sm">
          <span>تعداد اقلام</span><span>{{ cart.totalCount }}</span>
        </p>
        <p class="flex justify-between mb-2 text-sm">
          <span>جمع کالا</span><span>{{ formatPrice(cart.totalPrice) }} تومان</span>
        </p>
        <p class="flex justify-between font-bold text-lg mb-4">
          <span>قابل پرداخت کالا</span><span>{{ formatPrice(cart.totalPrice) }} تومان</span>
        </p>
        <div class="text-xs text-steel leading-7 border-t border-[#ddd4c8] pt-3 mb-5">
          <p>هزینه ارسال در مرحله تسویه مشخص می‌شود.</p>
          <p>تهران: پیک از {{ formatPrice(shipping.settings.tehranCourierPrice) }} تومان</p>
          <p>شهرستان: پست، تیپاکس، ماهکس یا باربری از {{ formatPrice(65000) }} تومان</p>
          <p v-if="!auth.isLoggedIn" class="mt-2 text-ember">
            برای پیش‌فاکتور و پرداخت، ابتدا وارد حساب شوید یا ثبت‌نام کنید.
          </p>
        </div>
        <button class="btn btn-dark w-full mb-3 min-h-11" type="button" @click="goSecure('/cart/invoice')">
          پیش‌فاکتور و چاپ
        </button>
        <button class="btn btn-primary w-full mb-3 min-h-11" type="button" @click="goSecure('/checkout')">
          ادامه به تسویه
        </button>
        <router-link to="/products" class="btn btn-ghost w-full min-h-11 hidden lg:inline-flex">
          ادامه خرید
        </router-link>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CheckoutSteps from '@/components/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useShippingStore } from '@/stores/shippingStore'
import { asset } from '@/utils/asset'
import { formatPrice, toNumber } from '@/utils/money'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const cart = useCartStore()
const shipping = useShippingStore()
const router = useRouter()
const toast = useToast()

function lineTotal(item) {
  return toNumber(item.price) * item.quantity
}

function goSecure(path) {
  if (!auth.isLoggedIn) {
    toast.info('برای ادامه، ابتدا وارد شوید یا ثبت‌نام کنید.')
    router.push({ name: 'Login', query: { redirect: path } })
    return
  }
  if ((path === '/cart/invoice' || path === '/checkout') && !auth.profileComplete) {
    toast.info('برای پیش‌فاکتور و پرداخت، ابتدا اطلاعات حساب را تکمیل کنید.')
    router.push({ name: 'AccountProfile', query: { redirect: path } })
    return
  }
  router.push(path)
}
</script>

<style scoped>
.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ddd4c8;
  border-radius: 999px;
  overflow: hidden;
  min-height: 44px;
}

.qty-stepper button,
.qty-stepper input {
  border: 0;
  background: transparent;
  min-height: 44px;
  text-align: center;
}

.qty-stepper button {
  width: 44px;
  cursor: pointer;
  font-size: 18px;
}

.qty-stepper input {
  width: 48px;
  border-inline: 1px solid #ddd4c8;
  font-weight: 600;
}

.qty-stepper input::-webkit-outer-spin-button,
.qty-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-stepper input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.remove-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgba(180, 35, 24, 0.08);
  color: var(--color-danger);
  cursor: pointer;
  font-size: 0.95rem;
}

.remove-btn:hover,
.remove-btn:focus-visible {
  background: rgba(180, 35, 24, 0.14);
}
</style>
