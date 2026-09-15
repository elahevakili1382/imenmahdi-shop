<template>
  <section>
    <h1 class="text-2xl font-bold mb-2">نظر خریداران</h1>
    <p class="text-sm text-slate-400 mb-6">فقط نظرهایی که تایید کنید روی صفحه اصلی دیده می‌شود.</p>
    <div v-if="!store.reviews.length" class="dash-card text-center text-[#98989D]">
      هنوز نظری از خریدار ثبت نشده است.
    </div>
    <div v-else class="space-y-4">
      <article
        v-for="review in store.reviews"
        :key="review.id"
        class="dash-card"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-bold">{{ review.name }}</p>
            <p class="text-xs text-slate-400 mt-1">
              {{ review.product }} · {{ review.city }} · {{ review.date }} ·
              {{ review.status === 'approved' ? 'نمایش در سایت' : review.status === 'rejected' ? 'رد شده' : 'در انتظار تایید' }}
            </p>
          </div>
          <p class="text-ember text-sm">{{ '★'.repeat(review.rating) }}</p>
        </div>
        <p class="text-sm leading-7 text-slate-300 mt-3">{{ review.text }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <button class="btn btn-primary min-h-10 text-sm" @click="store.setStatus(review.id, 'approved')">تایید</button>
          <button class="btn btn-ghost min-h-10 text-sm border-white/15" @click="store.setStatus(review.id, 'rejected')">
            رد
          </button>
          <button class="btn btn-ghost min-h-10 text-sm border-red-400/40 text-red-300" @click="store.remove(review.id)">
            حذف
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useReviewStore } from '@/stores/reviewStore'

const store = useReviewStore()
</script>
