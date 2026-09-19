<template>
  <section>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">نوع ارسال</h1>
      <p class="text-sm text-slate-400 mt-1">
        بازه‌های ساعت تحویل تهران را اینجا مدیریت کنید. هزینه پیک فروشگاه و ارسال فوری در تسویه از
        مبلغ سفارش کسر نمی‌شود و در زمان تحویل کالا محاسبه می‌گردد.
      </p>
    </div>

    <article class="dash-card space-y-2 max-w-xl">
      <h2 class="font-semibold">پیک فروشگاه و ارسال فوری</h2>
      <p class="text-sm text-slate-400 leading-7">
        هزینه این دو روش در زمان تحویل کالا محاسبه و از گیرنده دریافت می‌گردد و به مبلغ قابل واریز
        تسویه اضافه نمی‌شود.
      </p>
    </article>

    <article class="dash-card mt-4 max-w-xl space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-semibold">بازه‌های ساعت تهران</h2>
        <button class="btn btn-ghost min-h-10 px-3 text-sm" type="button" @click="shipping.addSlot()">
          افزودن بازه
        </button>
      </div>
      <p class="text-sm text-slate-400">
        این بازه‌ها در صفحه تسویه برای خریداران تهرانی نمایش داده می‌شوند.
      </p>
      <div v-for="(slot, index) in shipping.slots" :key="slot.id" class="flex items-end gap-2">
        <label class="block flex-1 text-sm">
          عنوان بازه
          <input
            :value="slot.label"
            class="admin-field mt-1"
            type="text"
            placeholder="مثلاً ۹ تا ۱۲"
            @change="shipping.updateSlot(index, { label: $event.target.value })"
          />
        </label>
        <button
          class="btn btn-ghost min-h-10 px-3 text-sm shrink-0"
          type="button"
          :disabled="shipping.slots.length <= 1"
          @click="shipping.removeSlot(index)"
        >
          حذف
        </button>
      </div>
    </article>
  </section>
</template>

<script setup>
import { useShippingStore } from '@/stores/shippingStore'

const shipping = useShippingStore()
</script>
