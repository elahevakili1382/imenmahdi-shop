<template>
  <section class="max-w-xl">
    <h1 class="text-2xl font-bold mb-6">پروفایل و آدرس ارسال</h1>
    <form class="dash-card space-y-4" @submit.prevent="save">
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
      <input v-model="form.name" class="field" placeholder="نام و نام خانوادگی" required />
      <input v-model="form.company" class="field" placeholder="شرکت (اختیاری)" />
      <input v-model="form.city" class="field" placeholder="شهر" required />
      <textarea v-model="form.address" class="field min-h-28" placeholder="آدرس" required />
      <button class="btn btn-primary" type="submit">ذخیره</button>
    </form>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

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
  toast.success('پروفایل ذخیره شد')
}
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 12px;
  padding: 12px 14px;
}
</style>
