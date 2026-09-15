<template>
  <section>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">ارسال تهران</h1>
      <p class="text-sm text-slate-400 mt-1">
        قیمت پیک فروشگاه و ارسال فوری تهران را هر وقت خواستید عوض کنید. بازه‌ها ثابت‌اند.
      </p>
    </div>

    <article class="dash-card space-y-4 max-w-xl">
      <label class="block text-sm">
        پیک فروشگاه (تومان)
        <input
          :value="shipping.settings.tehranCourierPrice"
          class="admin-field mt-1"
          type="number"
          min="0"
          @change="shipping.update({ tehranCourierPrice: Number($event.target.value) })"
        />
      </label>
      <label class="block text-sm">
        ارسال فوری تهران (تومان)
        <input
          :value="shipping.settings.tehranExpressPrice"
          class="admin-field mt-1"
          type="number"
          min="0"
          @change="shipping.update({ tehranExpressPrice: Number($event.target.value) })"
        />
      </label>
    </article>

    <article class="dash-card mt-4 max-w-xl">
      <h2 class="font-semibold mb-3">بازه‌های ساعت تهران</h2>
      <ul class="space-y-2 text-sm">
        <li v-for="slot in shipping.slots" :key="slot.id">{{ slot.label }}</li>
      </ul>
    </article>
  </section>
</template>

<script setup>
import { useShippingStore } from '@/stores/shippingStore'

const shipping = useShippingStore()
</script>
