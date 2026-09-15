<template>
  <div v-if="denied" class="p-10 text-center">به این فاکتور دسترسی ندارید.</div>
  <div v-else-if="order" class="invoice">
    <div class="toolbar print:hidden">
      <button class="btn btn-primary" @click="print">چاپ / ذخیره PDF</button>
      <router-link to="/account/orders" class="btn btn-ghost">بازگشت</router-link>
    </div>

    <article class="sheet">
      <header class="flex justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <h1 class="text-2xl font-extrabold">فاکتور فروش</h1>
          <p class="text-ember text-sm mt-1">ایمنی مهدی</p>
        </div>
        <div class="text-left">
          <p>شماره: {{ order.id }}</p>
          <p>تاریخ: {{ date }}</p>
        </div>
      </header>

      <section class="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <h2 class="font-bold mb-1">خریدار</h2>
          <p>{{ order.customerName }}</p>
          <p v-if="order.company">{{ order.company }}</p>
          <p>{{ order.phone }}</p>
          <p>{{ order.city }} · {{ order.address }}</p>
        </div>
        <div>
          <h2 class="font-bold mb-1">ارسال</h2>
          <p>{{ order.shipping?.name }}</p>
          <p v-if="order.deliveryDate">
            {{ new Date(order.deliveryDate).toLocaleDateString('fa-IR') }} · {{ slotLabel(order.deliverySlot) }}
          </p>
          <p v-else-if="order.destination === 'county'">۳ تا ۷ روز کاری</p>
          <p>{{ statusLabel[order.status] }}</p>
          <p>پرداخت: کارت‌به‌کارت</p>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>شرح</th>
            <th>سایز</th>
            <th>تعداد</th>
            <th>مبلغ واحد</th>
            <th>جمع</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id + item.size">
            <td>{{ item.title }}</td>
            <td>{{ item.size }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td>{{ formatPrice(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="mt-6 text-sm">
        <p>جمع کالا: {{ formatPrice(order.subtotal || order.total) }} تومان</p>
        <p>هزینه ارسال: {{ order.shippingPrice ? formatPrice(order.shippingPrice) + ' تومان' : 'پس از هماهنگی' }}</p>
        <p class="text-lg font-bold mt-2">مبلغ کل: {{ formatPrice(order.total) }} تومان</p>
        <p class="mt-6 text-steel">این فاکتور پس از تایید رسید توسط سیستم/ادمین معتبر است.</p>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { statusLabel } from '@/data/orderStatus'
import { slotLabel } from '@/data/shipping'
import { formatPrice } from '@/utils/money'

const route = useRoute()
const auth = useAuthStore()
const orders = useOrderStore()
const order = computed(() => orders.byId(route.params.id))
const denied = computed(() => !order.value || !auth.canAccessOrder(order.value))
const date = computed(() => new Date(order.value?.createdAt || Date.now()).toLocaleDateString('fa-IR'))

function print() {
  window.print()
}
</script>

<style scoped>
.invoice {
  min-height: 100vh;
  background: #f4efe7;
  padding: 24px;
}
.toolbar {
  width: min(900px, 100%);
  margin: 0 auto 16px;
  display: flex;
  gap: 8px;
}
.sheet {
  width: min(900px, 100%);
  margin: 0 auto;
  background: #fff;
  padding: 32px;
  color: #111;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th,
td {
  border: 1px solid #ddd4c8;
  padding: 8px;
  text-align: right;
}
@media print {
  .invoice {
    background: #fff;
    padding: 0;
  }
  .sheet {
    width: 100%;
    box-shadow: none;
  }
}
</style>
