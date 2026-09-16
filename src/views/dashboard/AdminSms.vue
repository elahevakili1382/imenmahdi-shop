<template>
  <section>
    <h1 class="text-2xl font-bold mb-2">پیامک‌های خودکار</h1>
    <p class="text-sm text-slate-400 mb-6">
      اگر کلید کاوه‌نگار در سرور باشد پیامک واقعاً ارسال می‌شود؛ وگرنه اینجا فقط ثبت می‌شود.
    </p>
    <div v-if="!rows.length" class="dash-card text-sm text-slate-400">هنوز پیامکی ثبت نشده است.</div>
    <article v-for="row in rows" :key="row.id" class="dash-card mb-3 text-sm">
      <div class="flex flex-wrap justify-between gap-2">
        <p class="dash-mono text-[var(--dash-primary)]">{{ row.phone }}</p>
        <p class="text-slate-400">{{ row.status }} · {{ row.event }}</p>
      </div>
      <pre class="mt-3 whitespace-pre-wrap text-slate-200 font-[inherit]">{{ row.message }}</pre>
    </article>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '@/services/api'

const rows = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/sms')
    rows.value = Array.isArray(data) ? data : []
  } catch {
    rows.value = []
  }
})
</script>
