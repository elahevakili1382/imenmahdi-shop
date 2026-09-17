<template>
  <AuthShell title="ثبت‌نام" subtitle="حساب برای پیش‌فاکتور و پیگیری سفارش لازم است.">
    <form class="auth-form surface-card" @submit.prevent="submit">
      <fieldset class="auth-radio-row">
        <legend class="sr-only">عنوان</legend>
        <label class="auth-radio">
          <input v-model="title" type="radio" value="خانم" />
          خانم
        </label>
        <label class="auth-radio">
          <input v-model="title" type="radio" value="آقا" />
          آقا
        </label>
      </fieldset>
      <div>
        <label class="field-label" for="register-name">
          نام و نام خانوادگی <span class="field-required" aria-hidden="true">*</span>
        </label>
        <input
          id="register-name"
          v-model="name"
          class="field"
          autocomplete="name"
          required
        />
      </div>
      <div>
        <label class="field-label" for="register-phone">
          شماره موبایل <span class="field-required" aria-hidden="true">*</span>
        </label>
        <input
          id="register-phone"
          v-model="phone"
          class="field field-phone"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          autocomplete="tel"
          required
        />
      </div>
      <div>
        <label class="field-label" for="register-password">
          رمز عبور <span class="field-required" aria-hidden="true">*</span>
        </label>
        <div class="field-wrap">
          <input
            id="register-password"
            v-model="password"
            class="field"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            aria-describedby="password-hint"
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
      <p id="password-hint" class="auth-hint">{{ PASSWORD_HINT }}</p>
      <ul v-if="password" class="auth-checks">
        <li v-for="item in checks" :key="item.label" :class="item.ok ? 'is-ok' : ''">
          {{ item.ok ? '✓' : '○' }} {{ item.label }}
        </li>
      </ul>
      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-full auth-submit" type="submit" :disabled="pending">
        {{ pending ? 'در حال ساخت حساب...' : 'ساخت حساب' }}
      </button>
    </form>
    <template #footer>
      قبلاً ثبت‌نام کرده‌اید؟
      <router-link to="/login" class="text-ember">ورود</router-link>
    </template>
  </AuthShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import { useAuthStore } from '@/stores/authStore'
import { PASSWORD_HINT } from '@/utils/password'

const auth = useAuthStore()
const router = useRouter()
const title = ref('خانم')
const name = ref('')
const phone = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)
const showPassword = ref(false)
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
  if (pending.value) return
  error.value = ''
  pending.value = true
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

.auth-radio-row {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 0.8125rem;
}

.auth-radio {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  gap: 0.35rem;
}

.auth-hint {
  margin: 0;
  color: var(--color-ash);
  font-size: 0.75rem;
  line-height: 1.6;
}

.auth-checks {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
  color: var(--color-ash);
}

.auth-checks .is-ok {
  color: #15803d;
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
