<template>
  <section class="container-shop py-16 max-w-md">
    <h1 class="text-3xl font-bold mb-2">ثبت‌نام</h1>
    <p class="text-steel mb-6">شماره موبایل خودتان را وارد کنید و یک رمز بسازید. پیامک لازم نیست.</p>
    <form class="surface-card p-6 space-y-4" @submit.prevent="submit">
      <div class="flex gap-4 text-sm">
        <label class="inline-flex items-center gap-2">
          <input v-model="title" type="radio" value="خانم" />
          خانم
        </label>
        <label class="inline-flex items-center gap-2">
          <input v-model="title" type="radio" value="آقا" />
          آقا
        </label>
      </div>
      <input v-model="name" class="field" placeholder="نام و نام خانوادگی" required />
      <input
        v-model="phone"
        class="field"
        dir="ltr"
        inputmode="numeric"
        maxlength="11"
        placeholder="شماره موبایل"
        required
      />
      <input
        v-model="password"
        class="field"
        type="password"
        placeholder="رمز عبور"
        minlength="8"
        required
      />
      <p class="text-xs text-steel leading-6">{{ PASSWORD_HINT }}</p>
      <ul v-if="password" class="text-xs space-y-1">
        <li v-for="item in checks" :key="item.label" :class="item.ok ? 'text-green-700' : 'text-steel'">
          {{ item.ok ? '✓' : '○' }} {{ item.label }}
        </li>
      </ul>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="btn btn-primary w-full" type="submit">ساخت حساب</button>
    </form>
    <p class="text-sm mt-4">
      قبلاً ثبت‌نام کرده‌اید؟
      <router-link to="/login" class="text-ember">ورود</router-link>
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { PASSWORD_HINT } from '@/utils/password'

const auth = useAuthStore()
const router = useRouter()
const title = ref('خانم')
const name = ref('')
const phone = ref('')
const password = ref('')
const error = ref('')
const checks = computed(() => {
  const value = password.value || ''
  return [
    { label: 'حداقل ۸ کاراکتر', ok: value.length >= 8 },
    { label: 'حرف کوچک انگلیسی', ok: /[a-z]/.test(value) },
    { label: 'حرف بزرگ انگلیسی', ok: /[A-Z]/.test(value) },
    { label: 'عدد', ok: /\d/.test(value) },
    { label: 'علامت خاص', ok: /[^A-Za-z0-9]/.test(value) },
  ]
})

function digits(value) {
  return String(value || '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

async function submit() {
  error.value = ''
  try {
    await auth.register({
      name: name.value,
      phone: digits(phone.value),
      password: password.value,
      title: title.value,
    })
    const { refreshPrivateData } = await import('@/services/boot')
    await refreshPrivateData()
    router.push('/account')
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
