<template>
  <section>
    <h1 class="text-2xl font-bold mb-2">بررسی رسیدها</h1>
    <p class="text-slate-400 mb-6">فقط مواردی که بات نتوانسته قطعی تصمیم بگیرد اینجا می‌مانند.</p>
    <div v-if="!list.length" class="dash-ok">صف رسید خالی است.</div>
    <article
      v-for="order in list"
      :key="order.id"
      class="dash-card mb-4 grid lg:grid-cols-[1fr_220px] gap-4"
    >
      <div>
        <p class="font-bold">{{ order.id }} · {{ order.customerName }}</p>
        <p class="text-sm text-slate-400 mt-1">
          {{ formatPrice(order.total) }} تومان · {{ order.shipping?.name }} ·
          {{ botDecisionLabel[order.botResult?.decision] || 'بدون نتیجه بات' }}
        </p>
        <div v-if="order.botResult?.issues?.length" class="dash-alert mt-4">
          <ul class="text-sm list-disc pr-5">
            <li v-for="issue in order.botResult.issues" :key="issue">{{ issue }}</li>
          </ul>
        </div>
        <img
          v-if="order.receiptUrl || order.receiptDataUrl"
          :src="mediaUrl(order.receiptUrl || order.receiptDataUrl)"
          alt="رسید"
          class="mt-4 max-h-52 rounded-xl object-contain bg-black/30"
        />
      </div>
      <div class="flex flex-col gap-2">
        <button class="btn btn-primary min-h-10 text-sm" @click="orders.reviewOrder(order.id, { approved: true })">
          تایید و آماده‌سازی
        </button>
        <button
          class="btn btn-ghost min-h-10 text-sm text-white border-white/15"
          @click="orders.reviewOrder(order.id, { approved: false, adminNote: 'رسید رد شد' })"
        >
          رد رسید
        </button>
        <router-link :to="`/invoice/${order.id}`" class="btn btn-ghost min-h-10 text-sm text-white border-white/15">
          چاپ فاکتور
        </router-link>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatPrice } from '@/utils/money'
import { botDecisionLabel } from '@/services/receiptBot'
import { mediaUrl } from '@/services/api'

const orders = useOrderStore()
const list = computed(() => orders.pendingReview)
</script>
