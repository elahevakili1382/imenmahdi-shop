<template>
  <section class="container-shop py-16 max-w-md">
    <h1 class="text-3xl font-bold mb-2">ورود کارکنان</h1>
    <p class="text-steel mb-6">این صفحه مخصوص ادمین فروشگاه است و از منوی عمومی لینک نشده.</p>
    <form class="surface-card p-6 space-y-4" @submit.prevent="submit">
      <input v-model="phone" class="field" placeholder="شماره داخلی" required />
      <input v-model="password" class="field" type="password" placeholder="رمز عبور" required />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="btn btn-dark w-full" type="submit">ورود به داشبورد</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const phone = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await auth.login({ phone: phone.value, password: password.value, expectedRole: 'admin' })
    const { refreshPrivateData } = await import('@/services/boot')
    await refreshPrivateData()
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border: 1px solid #ddd4c8;
  border-radius: 12px;
  padding: 12px 14px;
}
</style>
