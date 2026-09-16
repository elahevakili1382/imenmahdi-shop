<template>
  <AuthShell title="ثبت‌نام">
    <form class="auth-form surface-card" @submit.prevent="submit">
      <div class="auth-radio-row">
        <label class="auth-radio">
          <input v-model="title" type="radio" value="خانم" />
          خانم
        </label>
        <label class="auth-radio">
          <input v-model="title" type="radio" value="آقا" />
          آقا
        </label>
      </div>
      <input v-model="name" class="field" placeholder="نام و نام خانوادگی" required />
      <input
        v-model="phone"
        class="field field-phone"
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
      <p class="auth-hint">{{ PASSWORD_HINT }}</p>
      <ul v-if="password" class="auth-checks">
        <li v-for="item in checks" :key="item.label" :class="item.ok ? 'is-ok' : ''">
          {{ item.ok ? '✓' : '○' }} {{ item.label }}
        </li>
      </ul>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="btn btn-primary w-full auth-submit" type="submit">ساخت حساب</button>
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

.auth-radio-row {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
}

.auth-radio {
  display: inline-flex;
  align-items: center;
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
  min-height: 42px;
  font-size: 0.875rem;
}
</style>
