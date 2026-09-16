<template>
  <section class="max-w-xl">
    <h1 class="text-2xl font-bold mb-2">تنظیمات و اطلاعات ورود</h1>
    <p class="text-sm text-[#98989D] mb-6 leading-7">
      شماره موبایل و رمز ورود ادمین را اینجا تغییر دهید. بعد از ذخیره، با همین اطلاعات وارد داشبورد می‌شوید.
    </p>

    <form class="dash-card space-y-4" @submit.prevent="save">
      <div>
        <label class="field-label" for="admin-phone">شماره موبایل ورود</label>
        <input
          id="admin-phone"
          v-model="form.phone"
          class="field field-phone"
          inputmode="numeric"
          maxlength="11"
          placeholder="09xxxxxxxxx"
          required
        />
      </div>

      <div>
        <label class="field-label" for="admin-current-password">رمز فعلی</label>
        <input
          id="admin-current-password"
          v-model="form.currentPassword"
          class="field"
          type="password"
          placeholder="رمز فعلی"
          required
        />
      </div>

      <div>
        <label class="field-label" for="admin-new-password">رمز جدید (اختیاری)</label>
        <input
          id="admin-new-password"
          v-model="form.password"
          class="field"
          type="password"
          placeholder="اگر خالی بماند، رمز قبلی می‌ماند"
        />
        <p class="hint">{{ PASSWORD_HINT }}</p>
      </div>

      <div>
        <label class="field-label" for="admin-confirm-password">تکرار رمز جدید</label>
        <input
          id="admin-confirm-password"
          v-model="form.confirmPassword"
          class="field"
          type="password"
          placeholder="تکرار رمز جدید"
        />
      </div>

      <p v-if="error" class="text-sm text-[#ff6b6b]">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات ورود' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { PASSWORD_HINT } from '@/utils/password'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const toast = useToast()
const error = ref('')
const saving = ref(false)
const form = reactive({
  phone: auth.user?.phone || '',
  currentPassword: '',
  password: '',
  confirmPassword: '',
})

async function save() {
  error.value = ''
  if (form.password && form.password !== form.confirmPassword) {
    error.value = 'رمز جدید و تکرار آن یکی نیست.'
    return
  }

  saving.value = true
  try {
    await auth.updateCredentials({
      phone: form.phone,
      password: form.password || undefined,
      currentPassword: form.currentPassword,
    })
    form.currentPassword = ''
    form.password = ''
    form.confirmPassword = ''
    toast.success('اطلاعات ورود ذخیره شد')
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field-label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.8125rem;
  color: #98989d;
}

.field {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 12px;
  padding: 12px 14px;
}

.field-phone {
  direction: rtl;
  text-align: right;
}

.hint {
  margin: 0.45rem 0 0;
  font-size: 0.75rem;
  line-height: 1.6;
  color: #98989d;
}
</style>
