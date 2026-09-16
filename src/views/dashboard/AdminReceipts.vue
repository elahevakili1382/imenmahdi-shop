<template>
  <section>
    <h1 class="text-2xl font-bold mb-2">بررسی رسیدها</h1>
    <p class="text-[var(--dash-muted)] mb-6 leading-7">
      بات سرور با OCR متن رسید، هش تصویر، مقایسه با عکس کالا و حافظه SQLite رسیدهای قبلی جعلی/اصل را جدا می‌کند.
      تایید نهایی هنوز با شماست؛ هر تایید یا رد، دیتابیس را برای دفعات بعد آموزش می‌دهد.
    </p>

    <div v-if="!list.length" class="dash-ok">
      <span class="dash-banner__icon" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>
      <div>
        <p class="font-semibold">صف رسید خالی است</p>
        <p class="mt-1 text-sm opacity-90">رسید جدیدی برای بررسی دستی نیست.</p>
      </div>
    </div>

    <article
      v-for="order in list"
      :key="order.id"
      class="dash-card mb-4 grid lg:grid-cols-[1.2fr_0.9fr_200px] gap-4"
    >
      <div>
        <p class="font-bold">{{ order.id }} · {{ order.customerName }}</p>
        <p class="text-sm text-[var(--dash-muted)] mt-1">
          {{ formatPrice(order.total) }} تومان · {{ order.shipping?.name || 'ارسال' }} ·
          {{ order.phone }}
        </p>
        <img
          v-if="order.receiptUrl || order.receiptDataUrl"
          :src="mediaUrl(order.receiptUrl || order.receiptDataUrl)"
          alt="رسید"
          class="mt-4 max-h-56 w-full rounded-xl object-contain bg-[var(--dash-hover)]"
        />
      </div>

      <div class="bot-report">
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="bot-pill" :class="decisionClass(order.botResult?.decision)">
            {{ botDecisionLabel[order.botResult?.decision] || 'بدون نتیجه بات' }}
          </span>
          <span v-if="order.botResult?.confidence" class="text-xs text-[var(--dash-muted)]">
            اطمینان بات: {{ Math.round(order.botResult.confidence * 100) }}٪
          </span>
        </div>
        <p class="text-sm leading-7 mb-3">
          {{ order.botResult?.adminSummary || 'فیدبک بات ثبت نشده است.' }}
        </p>
        <ul v-if="order.botResult?.checks?.length" class="space-y-2">
          <li
            v-for="check in order.botResult.checks"
            :key="check.id"
            class="bot-check"
            :class="check.ok ? 'is-ok' : 'is-bad'"
          >
            <i :class="check.ok ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" aria-hidden="true"></i>
            <div>
              <p class="font-semibold">{{ check.label }}</p>
              <p class="text-xs opacity-80 mt-0.5">{{ check.detail }}</p>
            </div>
          </li>
        </ul>
        <ul v-else-if="order.botResult?.issues?.length" class="text-sm list-disc pr-5 text-[var(--dash-alert)]">
          <li v-for="issue in order.botResult.issues" :key="issue">{{ issue }}</li>
        </ul>
        <p v-if="order.botResult?.ocrText" class="mt-3 text-xs text-[var(--dash-muted)] leading-6 whitespace-pre-wrap max-h-28 overflow-auto">
          متن OCR: {{ order.botResult.ocrText }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <button
          class="btn btn-primary min-h-10 text-sm"
          type="button"
          :disabled="busyId === order.id"
          @click="decide(order.id, true)"
        >
          تایید و آماده‌سازی
        </button>
        <button
          class="btn btn-ghost min-h-10 text-sm"
          type="button"
          :disabled="busyId === order.id"
          @click="decide(order.id, false)"
        >
          رد رسید
        </button>
        <router-link :to="`/invoice/${order.id}`" class="btn btn-ghost min-h-10 text-sm">
          چاپ فاکتور
        </router-link>
        <button
          class="btn btn-ghost min-h-10 text-sm"
          type="button"
          :disabled="busyId === order.id"
          @click="reinspect(order)"
        >
          بررسی مجدد سرور
        </button>
        <p class="text-[11px] text-[var(--dash-muted)] leading-5 mt-1">
          تایید یا رد شما در دیتابیس ذخیره می‌شود تا بات دفعه بعد جعلی‌های مشابه را بشناسد.
        </p>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useOrderStore } from '@/stores/orderStore'
import { formatPrice } from '@/utils/money'
import { botDecisionLabel } from '@/services/receiptBot'
import { mediaUrl } from '@/services/api'

const orders = useOrderStore()
const toast = useToast()
const busyId = ref('')
const list = computed(() => orders.pendingReview)

onMounted(() => {
  list.value.forEach((order) => {
    const engine = order.botResult?.engine
    if (engine !== 'ocr+phash+memory' && (order.receiptUrl || order.receiptDataUrl)) {
      reinspect(order)
    }
  })
})

async function reinspect(order) {
  busyId.value = order.id
  try {
    const data = await orders.recheckReceipt(order.id)
    if (data?.botResult?.decision === 'rejected') {
      toast.error(data.botResult.adminSummary || 'بات سرور تصویر را رسید ندانست')
    } else {
      toast.success(data?.botResult?.adminSummary || 'بررسی سرور انجام شد')
    }
  } catch (err) {
    toast.error(err?.message || 'بررسی مجدد انجام نشد')
  } finally {
    busyId.value = ''
  }
}

function decisionClass(decision) {
  if (decision === 'rejected') return 'is-rejected'
  if (decision === 'approved') return 'is-approved'
  return 'is-review'
}

async function decide(orderId, approved) {
  busyId.value = orderId
  try {
    await orders.reviewOrder(orderId, {
      approved,
      adminNote: approved ? 'رسید توسط ادمین تایید شد' : 'رسید رد شد',
    })
    toast.success(
      approved
        ? 'رسید تایید شد · وضعیت سفارش به آماده‌سازی تغییر کرد و به مشتری اطلاع داده می‌شود'
        : 'رسید رد شد · وضعیت به مشتری اطلاع داده می‌شود',
    )
  } catch (err) {
    toast.error(err?.message || 'ثبت تصمیم انجام نشد')
  } finally {
    busyId.value = ''
  }
}
</script>

<style scoped>
.bot-report {
  border: 1px solid var(--dash-line);
  border-radius: 16px;
  padding: 14px;
  background: var(--dash-hover);
}

.bot-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.bot-pill.is-review {
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
}

.bot-pill.is-rejected {
  background: var(--dash-alert-bg);
  color: var(--dash-alert);
}

.bot-pill.is-approved {
  background: var(--dash-primary-soft);
  color: var(--dash-primary);
}

.bot-check {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 8px 10px;
  border-radius: 12px;
  background: #fff;
  font-size: 13px;
}

.bot-check i {
  margin-top: 2px;
}

.bot-check.is-ok {
  color: var(--dash-primary);
}

.bot-check.is-bad {
  color: var(--dash-alert);
}
</style>
