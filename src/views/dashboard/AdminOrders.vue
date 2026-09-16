<template>
  <section>
    <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">لیست سفارش‌ها</h1>
        <p class="text-sm text-slate-400 mt-1">{{ filtered.length }} از {{ orders.orders.length }} سفارش</p>
      </div>
      <select v-model="status" class="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm">
        <option value="all">همه وضعیت‌ها</option>
        <option v-for="(label, key) in statusLabel" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    <input
      v-model="query"
      class="w-full mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      placeholder="جستجوی کد، مشتری، تلفن یا شهر"
    />

    <div v-if="!filtered.length" class="dash-card text-center text-sm text-slate-400">
      سفارشی با این فیلتر پیدا نشد.
    </div>

    <div v-else class="dash-card overflow-x-auto !p-0">
      <table class="dash-table">
        <thead>
          <tr>
            <th>کد</th>
            <th>مشتری</th>
            <th>وضعیت</th>
            <th>مبلغ</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in filtered" :key="order.id">
            <tr>
              <td class="dash-mono whitespace-nowrap text-[var(--dash-primary)]">{{ order.id }}</td>
              <td class="whitespace-nowrap">{{ order.customerName || '—' }}</td>
              <td>
                <select
                  :value="order.status"
                  class="min-w-[9.5rem] bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm"
                  @change="orders.updateStatus(order.id, $event.target.value)"
                >
                  <option v-for="(label, key) in statusLabel" :key="key" :value="key">{{ label }}</option>
                </select>
              </td>
              <td class="dash-mono whitespace-nowrap">{{ formatPrice(order.total) }}</td>
              <td class="whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="btn btn-ghost min-h-10 text-sm"
                    type="button"
                    :aria-expanded="openId === order.id"
                    @click="toggle(order.id)"
                  >
                    {{ openId === order.id ? 'بستن' : 'جزئیات' }}
                  </button>
                  <router-link :to="`/invoice/${order.id}`" class="btn btn-primary min-h-10 text-sm">فاکتور</router-link>
                </div>
              </td>
            </tr>
            <tr v-if="openId === order.id" class="order-detail-row">
              <td colspan="5">
                <div class="order-detail">
                  <div>
                    <p class="order-detail-label">خریدار</p>
                    <p>{{ order.customerName || '—' }}</p>
                    <p v-if="order.company">{{ order.company }}</p>
                    <p>{{ order.phone || '—' }}</p>
                    <p>{{ [order.city, order.address].filter(Boolean).join(' · ') || '—' }}</p>
                  </div>
                  <div>
                    <p class="order-detail-label">ارسال</p>
                    <p>{{ order.shipping?.name || '—' }}</p>
                    <p>{{ formatDate(order.createdAt) }}</p>
                    <p v-if="order.destination === 'tehran'">
                      تهران · {{ order.deliveryDate || 'روز نامشخص' }} · {{ slotLabel(order.deliverySlot) }}
                    </p>
                    <p v-if="order.note">{{ order.note }}</p>
                  </div>
                  <ul>
                    <li v-for="item in order.items" :key="item.id + item.size">
                      {{ item.title }} · {{ item.size }} · {{ item.quantity }} عدد
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useShippingStore } from '@/stores/shippingStore'
import { statusLabel } from '@/data/orderStatus'
import { formatPrice } from '@/utils/money'

const orders = useOrderStore()
const shipping = useShippingStore()
const query = ref('')
const status = ref('all')
const openId = ref('')

const filtered = computed(() => {
  const q = query.value.trim()
  return orders.orders.filter((order) => {
    const matchStatus = status.value === 'all' || order.status === status.value
    const haystack = [
      order.id,
      order.customerName,
      order.company,
      order.phone,
      order.city,
      order.address,
      order.note,
      ...(order.items || []).map((item) => item.title),
    ]
      .filter(Boolean)
      .join(' ')
    return matchStatus && (!q || haystack.includes(q))
  })
})

function toggle(id) {
  openId.value = openId.value === id ? '' : id
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fa-IR')
}

function slotLabel(id) {
  return shipping.slotLabel(id) || id || '—'
}
</script>

<style scoped>
.order-detail-row td {
  background: #161616;
  padding: 0 16px 16px;
  border-bottom: 1px solid #2c2c2e;
}

.order-detail {
  display: grid;
  gap: 16px;
  padding-top: 4px;
  font-size: 13px;
  line-height: 1.8;
  color: #d7d7da;
}

.order-detail-label {
  color: #98989d;
  font-size: 12px;
  margin-bottom: 2px;
}

@media (min-width: 768px) {
  .order-detail {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style>
