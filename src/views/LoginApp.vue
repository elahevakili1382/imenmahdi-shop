<template>
  <AuthShell title="ورود خریدار">
    <form class="auth-form surface-card" @submit.prevent="submit">
      <input
        v-model="phone"
        class="field field-phone"
        inputmode="numeric"
        maxlength="11"
        placeholder="شماره موبایل"
        required
      />
      <input v-model="password" class="field" type="password" placeholder="رمز عبور" required />
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="btn btn-primary w-full auth-submit" type="submit">ورود</button>
    </form>
    <template #footer>
      حساب ندارید؟
      <router-link to="/register" class="text-ember">ثبت‌نام</router-link>
    </template>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
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
.auth-form {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.field {
  width: 100%;
  border: 1px solid #ddd4c8;
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  font-size: 0.875rem;
}

.field-phone {
  direction: rtl;
  text-align: right;
}

.auth-error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.8125rem;
}

.auth-submit {
  min-height: 42px;
  font-size: 0.875rem;
}
</style>
