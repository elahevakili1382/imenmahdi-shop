<template>
  <AuthShell title="ورود" subtitle="با شماره موبایل و رمز وارد شوید. اگر ادمین هستید بعد از ورود به داشبورد می‌روید.">
    <form class="auth-form surface-card" @submit.prevent="submit">
      <div>
        <label class="field-label" for="login-phone">
          شماره موبایل <span class="field-required" aria-hidden="true">*</span>
        </label>
        <input
          id="login-phone"
          v-model="phone"
          class="field field-phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="username"
          required
        />
      </div>
      <div>
        <label class="field-label" for="login-password">
          رمز عبور <span class="field-required" aria-hidden="true">*</span>
        </label>
        <div class="field-wrap">
          <input
            id="login-password"
            v-model="password"
            class="field"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            class="field-toggle"
            type="button"
            :aria-label="showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <p v-if="error" id="login-error" class="auth-error" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-full auth-submit" type="submit" :disabled="pending">
        {{ pending ? 'در حال ورود...' : 'ورود' }}
      </button>
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
const pending = ref(false)
const showPassword = ref(false)

function digits(value) {
  return String(value || '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '')
}

async function submit() {
  if (pending.value) return
  error.value = ''
  pending.value = true
  try {
    await auth.login({ phone: digits(phone.value), password: password.value })
    const { refreshPrivateData } = await import('@/services/boot')
    await refreshPrivateData()
    router.push(route.query.redirect || (auth.isAdmin ? '/dashboard' : '/account'))
  } catch (err) {
    error.value = err.message
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.auth-form {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
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
  min-height: 44px;
  font-size: 0.875rem;
}

.auth-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
