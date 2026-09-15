<template>
  <div class="account-panel space-y-5">
    <header class="surface-card p-5 sm:p-6">
      <p class="text-sm text-steel">حساب کاربری</p>
      <h1 class="mt-1 text-2xl font-extrabold sm:text-[1.75rem]">{{ greeting }}</h1>
      <p class="mt-2 text-sm leading-7 text-steel">
        سفارش‌ها، آدرس ارسال و اطلاعات حساب از همین‌جا در دسترس است.
      </p>
    </header>

    <div class="grid gap-3 sm:grid-cols-3">
      <router-link
        v-for="tile in tiles"
        :key="tile.to"
        :to="tile.to"
        class="account-tile surface-card"
      >
        <span class="account-tile-icon" aria-hidden="true">
          <i :class="['fa-solid', tile.icon]"></i>
        </span>
        <span class="font-extrabold">{{ tile.label }}</span>
        <span class="text-xs leading-6 text-steel">{{ tile.hint }}</span>
      </router-link>
    </div>

    <section class="surface-card p-5 sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="font-extrabold">آخرین سفارش‌ها</h2>
        <router-link v-if="recent.length" to="/account/orders" class="text-sm font-semibold text-ember">
          همه سفارش‌ها
        </router-link>
      </div>

      <div v-if="!recent.length" class="rounded-2xl bg-stone px-4 py-8 text-center">
        <p class="font-semibold">هنوز سفارشی ثبت نشده است.</p>
        <p class="mt-1 text-sm text-steel">از کاتالوگ انتخاب کنید و خرید را شروع کنید.</p>
        <router-link to="/products" class="btn btn-primary mt-5">مشاهده محصولات</router-link>
      </div>

      <ul v-else class="divide-y divide-sand">
        <li v-for="order in recent" :key="order.id" class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
          <div>
            <p class="font-bold">{{ order.id }}</p>
            <p class="mt-1 text-xs text-steel">
              {{ statusLabel[order.status] }} · {{ formatPrice(order.total) }} تومان
            </p>
          </div>
          <router-link :to="`/orders/${order.id}`" class="text-sm font-semibold text-ember">
            پیگیری
          </router-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { statusLabel } from '@/data/orderStatus'
import { formatPrice } from '@/utils/money'

const auth = useAuthStore()
const orders = useOrderStore()

const firstName = computed(() => {
  const parts = String(auth.user?.name || '').trim().split(/\s+/).filter(Boolean)
  return parts[0] || 'خریدار'
})

const greeting = computed(() => `سلام ${firstName.value}`)

const recent = computed(() => (auth.user ? orders.byUser(auth.user.id).slice(0, 3) : []))

const tiles = computed(() => [
  {
    to: '/account/orders',
    label: 'سفارش‌ها',
    hint: recent.value.length ? `${recent.value.length} سفارش اخیر` : 'پیگیری خریدها',
    icon: 'fa-bag-shopping',
  },
  {
    to: '/account/profile',
    label: 'اطلاعات حساب',
    hint: auth.user?.name || 'نام و شماره موبایل',
    icon: 'fa-id-card',
  },
  {
    to: '/account/profile',
    label: 'آدرس ارسال',
    hint: auth.user?.city || 'برای فاکتور و ارسال',
    icon: 'fa-location-dot',
  },
])
</script>

<style scoped>
.account-tile {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 132px;
  padding: 1.15rem 1.1rem;
  transition: border-color 180ms ease, transform 180ms ease;
}

.account-tile:hover {
  border-color: color-mix(in srgb, var(--color-ember) 35%, var(--color-line));
  transform: translateY(-2px);
}

.account-tile-icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  margin-bottom: 0.35rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-ember) 12%, var(--color-sand));
  color: var(--color-ember);
}
</style>
