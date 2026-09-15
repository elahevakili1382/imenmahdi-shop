<template>
  <section class="account-panel">
    <header class="mb-5">
      <h1 class="text-2xl font-extrabold">اطلاعات حساب</h1>
      <p class="mt-2 text-sm leading-7 text-steel">
        نام، شرکت و آدرس ارسال برای فاکتور و پیک همین‌جا ذخیره می‌شود.
      </p>
    </header>

    <form class="surface-card max-w-xl space-y-4 p-5 sm:p-6" @submit.prevent="save">
      <div class="flex gap-4 text-sm">
        <label class="inline-flex items-center gap-2">
          <input v-model="form.title" type="radio" value="خانم" />
          خانم
        </label>
        <label class="inline-flex items-center gap-2">
          <input v-model="form.title" type="radio" value="آقا" />
          آقا
        </label>
      </div>
      <label class="block text-sm font-semibold">
        نام و نام خانوادگی
        <input v-model="form.name" class="field mt-1 font-normal" required />
      </label>
      <label class="block text-sm font-semibold">
        شماره موبایل
        <input :value="auth.user?.phone" class="field mt-1 bg-sand/40 font-normal" readonly />
      </label>
      <label class="block text-sm font-semibold">
        شرکت (اختیاری)
        <input v-model="form.company" class="field mt-1 font-normal" />
      </label>
      <label class="block text-sm font-semibold">
        شهر
        <input v-model="form.city" class="field mt-1 font-normal" required />
      </label>
      <label class="block text-sm font-semibold">
        آدرس ارسال
        <textarea v-model="form.address" class="field mt-1 min-h-28 font-normal" required />
      </label>
      <button class="btn btn-primary w-full" type="submit">ذخیره اطلاعات</button>
    </form>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const toast = useToast()
const form = reactive({
  title: auth.user?.title === 'خانم' ? 'خانم' : 'آقا',
  name: auth.user?.name || '',
  company: auth.user?.company || '',
  city: auth.user?.city || '',
  address: auth.user?.address || '',
})

async function save() {
  await auth.updateProfile(form)
  toast.success('اطلاعات حساب ذخیره شد')
}
</script>
