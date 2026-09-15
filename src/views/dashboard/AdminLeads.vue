<template>
  <section>
    <h1 class="text-2xl font-bold mb-2">شماره‌های ثبت‌شده</h1>
    <p class="text-sm text-slate-400 mb-6 leading-7">
      شماره‌هایی که مشتری در فوتر برای اطلاع موجودی می‌فرستد اینجا می‌آید.
      تا وقتی بک‌اند وصل نشده، این لیست فقط در همین مرورگر (localStorage با کلید
      <code class="text-copper">imenmahdi-leads</code>) ذخیره می‌شود و کارفرما باید از همین داشبورد روی همان دستگاه ببیند.
      بعد از دیپلوی با API، شماره‌های همه بازدیدکننده‌ها اینجا جمع می‌شود.
    </p>
    <div v-if="!leads.newest.length" class="dash-card text-center text-[#98989D]">
      هنوز شماره‌ای ثبت نشده است.
    </div>
    <div v-else class="dash-card overflow-x-auto !p-0">
      <table class="dash-table">
        <thead>
          <tr>
            <th>شماره</th>
            <th>زمان</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads.newest" :key="lead.id">
            <td class="dash-mono font-semibold">{{ lead.phone }}</td>
            <td>
              {{ new Date(lead.createdAt).toLocaleString('fa-IR') }}
              <span v-if="lead.duplicate"> · تکراری</span>
            </td>
            <td>
              <div class="flex gap-2 justify-end">
                <a :href="`tel:${lead.phone}`" class="btn btn-ghost min-h-10 text-sm">تماس</a>
                <button class="btn btn-ghost min-h-10 text-sm border-red-400/40 text-red-300" @click="leads.remove(lead.id)">
                  حذف
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { useLeadStore } from '@/stores/leadStore'

const leads = useLeadStore()
</script>
