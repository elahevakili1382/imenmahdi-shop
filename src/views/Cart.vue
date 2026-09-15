<template>
  <section class="container-shop py-8 sm:py-10">
    <div class="flex flex-wrap items-end justify-between gap-3 mb-8">
      <div>
        <h1 class="text-3xl font-bold">سبد خرید</h1>
        <p class="text-sm text-steel mt-2">
          {{ cart.totalCount }} قلم · جمع کالا {{ formatPrice(cart.totalPrice) }} تومان
        </p>
      </div>
      <router-link to="/products" class="btn btn-ghost">ادامه خرید</router-link>
    </div>

    <div v-if="!cart.items.length" class="surface-card p-10 text-center">
      <p class="mb-4">سبد خالی است.</p>
      <router-link to="/products" class="btn btn-primary">شروع خرید از کاتالوگ</router-link>
    </div>

    <div v-else class="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] gap-6">
      <div class="space-y-4">
        <article
          v-for="item in cart.items"
          :key="item.id + item.size"
          class="surface-card p-4 grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)_auto] gap-4 items-start"
        >
          <router-link :to="item.slug ? `/products/${item.slug}` : '/products'" class="product-well w-full aspect-square rounded-xl p-2">
            <img :src="asset(item.image)" :alt="item.title" class="w-full h-full object-contain" />
          </router-link>

          <div class="min-w-0">
            <router-link :to="item.slug ? `/products/${item.slug}` : '/products'" class="font-semibold leading-7 hover:underline">
              {{ item.title }}
            </router-link>
            <p class="text-sm text-steel mt-1">سایز {{ item.size }}</p>
            <p class="text-sm mt-2">واحد: {{ formatPrice(item.price) }} تومان</p>
            <p class="font-semibold mt-1 sm:hidden">جمع: {{ formatPrice(lineTotal(item)) }} تومان</p>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <div class="qty-stepper" role="group" :aria-label="`تعداد ${item.title}`">
                <button type="button" aria-label="کاهش تعداد" @click="cart.changeQuantity(item.id, item.size, -1)">−</button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :aria-label="`تعداد ${item.title}`"
                  @change="cart.updateQuantity(item.id, item.size, Number($event.target.value))"
                />
                <button type="button" aria-label="افزایش تعداد" @click="cart.changeQuantity(item.id, item.size, 1)">+</button>
              </div>
              <button class="text-sm text-red-700 cursor-pointer" type="button" @click="cart.removeFromCart(item.id, item.size)">
                حذف
              </button>
            </div>
          </div>

          <p class="hidden sm:block text-left font-semibold whitespace-nowrap">
            {{ formatPrice(lineTotal(item)) }} تومان
          </p>
        </article>
      </div>

      <aside class="surface-card p-6 h-fit lg:sticky lg:top-24">
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
          <p class="mt-2">شرکت‌ها می‌توانند قبل از واریز، پیش‌فاکتور را ببینند و PDF بگیرند.</p>
        </div>
        <router-link to="/cart/invoice" class="btn btn-dark w-full mb-3">پیش‌فاکتور و چاپ</router-link>
        <router-link to="/checkout" class="btn btn-primary w-full mb-3">ادامه و پرداخت کارت‌به‌کارت</router-link>
        <router-link to="/products" class="btn btn-ghost w-full">ادامه خرید</router-link>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'
import { useShippingStore } from '@/stores/shippingStore'
import { asset } from '@/utils/asset'
import { formatPrice, toNumber } from '@/utils/money'

const cart = useCartStore()
const shipping = useShippingStore()

function lineTotal(item) {
  return toNumber(item.price) * item.quantity
}
</script>

<style scoped>
.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ddd4c8;
  border-radius: 999px;
  overflow: hidden;
  min-height: 40px;
}

.qty-stepper button,
.qty-stepper input {
  border: 0;
  background: transparent;
  min-height: 40px;
  text-align: center;
}

.qty-stepper button {
  width: 40px;
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
</style>
