<template>
  <section class="container-shop py-16 max-w-md">
    <h1 class="text-3xl font-bold mb-2">ورود خریدار</h1>
    <p class="text-steel mb-6">با شماره موبایل و رمزی که خودتان ساخته‌اید وارد شوید.</p>
    <form class="surface-card p-6 space-y-4" @submit.prevent="submit">
      <input
        v-model="phone"
        class="field"
        dir="ltr"
        inputmode="numeric"
        maxlength="11"
        placeholder="شماره موبایل"
        required
      />
      <input v-model="password" class="field" type="password" placeholder="رمز عبور" required />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="btn btn-primary w-full" type="submit">ورود</button>
    </form>
    <p class="text-sm mt-4">
      حساب ندارید؟
      <router-link to="/register" class="text-ember">ثبت‌نام</router-link>
    </p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const phone = ref('')
const password = ref('')
const error = ref('')

function digits(value) {
  return String(value || '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

async function submit() {
  error.value = ''
  try {
    await auth.login({ phone: digits(phone.value), password: password.value })
    const { refreshPrivateData } = await import('@/services/boot')
    await refreshPrivateData()
    router.push(route.query.redirect || (auth.isAdmin ? '/dashboard' : '/account'))
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
