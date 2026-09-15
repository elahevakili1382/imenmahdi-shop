import { defineStore } from 'pinia'
import { api, apiError, apiReady } from '@/services/api'
import { isStrongPassword, PASSWORD_HINT } from '@/utils/password'

const STORAGE_KEY = 'imenmahdi-auth'
const USERS_KEY = 'imenmahdi-users'
const TOKEN_KEY = 'imenmahdi-token'
const LOCK_KEY = 'imenmahdi-login-lock'
const SESSION_MS = 8 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5
const LOCK_MS = 10 * 60 * 1000

const demoUsers = [
  {
    id: 'admin-demo',
    name: 'مدیر فروشگاه',
    title: 'آقا',
    phone: '09121111111',
    password: 'admin',
    role: 'admin',
    company: 'ایمنی مهدی',
    city: 'تهران',
    address: 'میدان حسن‌آباد، خیابان امام خمینی',
  },
]

function readUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const merged = [...demoUsers]
    saved.forEach((user) => {
      if (!merged.some((item) => item.phone === user.phone)) merged.push(user)
    })
    return merged
  } catch {
    return [...demoUsers]
  }
}

function persistUsers(users) {
  const custom = users.filter((user) => !demoUsers.some((demo) => demo.id === user.id))
  localStorage.setItem(USERS_KEY, JSON.stringify(custom))
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

function readLock() {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || '{"attempts":0,"until":0}')
  } catch {
    return { attempts: 0, until: 0 }
  }
}

function safeUser(user) {
  if (!user) return null
  const { password, passwordHash, ...rest } = user
  return { title: rest.title === 'خانم' ? 'خانم' : 'آقا', ...rest }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: readSession(),
    users: readUsers(),
    lock: readLock(),
    online: false,
    ready: false,
  }),
  getters: {
    user: (state) => state.session?.user || null,
    isLoggedIn: (state) => Boolean(state.session?.user),
    isAdmin: (state) => state.session?.user?.role === 'admin',
    isExpired: (state) => {
      if (!state.session?.startedAt) return false
      return Date.now() - state.session.startedAt > SESSION_MS
    },
    profileComplete: (state) =>
      Boolean(state.session?.user?.name && state.session?.user?.phone && state.session?.user?.address),
    lockRemainingMs: (state) => Math.max(0, (state.lock?.until || 0) - Date.now()),
  },
  actions: {
    persistSession() {
      if (this.session) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.session))
      else localStorage.removeItem(STORAGE_KEY)
    },
    persistLock() {
      localStorage.setItem(LOCK_KEY, JSON.stringify(this.lock))
    },
    setSession(user, startedAt = Date.now(), token) {
      this.session = { user: safeUser(user), startedAt }
      if (token) localStorage.setItem(TOKEN_KEY, token)
      this.persistSession()
    },
    ensureFreshSession() {
      if (this.isExpired) this.logout()
    },
    async hydrate() {
      if (this.ready) return
      this.online = await apiReady()
      const token = localStorage.getItem(TOKEN_KEY)
      if (this.online && !token) {
        this.session = null
        this.persistSession()
      }
      if (this.online && token) {
        try {
          const { data } = await api.get('/auth/me')
          this.setSession(data.user, this.session?.startedAt || Date.now(), token)
        } catch {
          this.logout()
        }
      }
      this.ready = true
    },
    async requestOtp(phone) {
      this.online = await apiReady()
      if (!this.online) throw new Error('سرور در دسترس نیست. API را روشن کنید.')
      try {
        const { data } = await api.post('/auth/otp/request', { phone })
        return data
      } catch (err) {
        throw new Error(apiError(err, 'ارسال کد انجام نشد.'))
      }
    },
    async verifyOtp({ phone, code, name, title } = {}) {
      this.online = await apiReady()
      if (!this.online) throw new Error('سرور در دسترس نیست. API را روشن کنید.')
      try {
        const { data } = await api.post('/auth/otp/verify', { phone, code, name, title })
        if (data.needsProfile) return data
        this.setSession(data.user, data.startedAt || Date.now(), data.token)
        this.lock = { attempts: 0, until: 0 }
        this.persistLock()
        return data
      } catch (err) {
        throw new Error(apiError(err, 'کد تایید نادرست است.'))
      }
    },
    async login({ phone, password, expectedRole } = {}) {
      this.online = await apiReady()
      if (this.online) {
        try {
          const { data } = await api.post('/auth/login', { phone, password, expectedRole })
          this.setSession(data.user, data.startedAt || Date.now(), data.token)
          this.lock = { attempts: 0, until: 0 }
          this.persistLock()
          return this.user
        } catch (err) {
          throw new Error(apiError(err, 'شماره یا رمز عبور نادرست است.'))
        }
      }

      if (this.lockRemainingMs > 0) {
        const minutes = Math.ceil(this.lockRemainingMs / 60000)
        throw new Error(`ورود موقتاً قفل است. ${minutes} دقیقه دیگر تلاش کنید.`)
      }
      const found = this.users.find((user) => user.phone === phone && user.password === password)
      if (!found || (expectedRole && found.role !== expectedRole)) {
        const attempts = (this.lock.attempts || 0) + 1
        this.lock = { attempts, until: attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 }
        this.persistLock()
        throw new Error('شماره یا رمز عبور نادرست است.')
      }
      this.setSession(found)
      this.lock = { attempts: 0, until: 0 }
      this.persistLock()
      return this.user
    },
    async register({ name, phone, password, title = 'آقا' }) {
      if (!isStrongPassword(password)) throw new Error(PASSWORD_HINT)
      this.online = await apiReady()
      if (this.online) {
        try {
          const { data } = await api.post('/auth/register', { name, phone, password, title })
          this.setSession(data.user, data.startedAt || Date.now(), data.token)
          return this.user
        } catch (err) {
          throw new Error(apiError(err, 'ثبت‌نام انجام نشد.'))
        }
      }
      if (this.users.some((user) => user.phone === phone)) {
        throw new Error('این شماره قبلاً ثبت شده است.')
      }
      const created = {
        id: `user-${Date.now()}`,
        name,
        title: title === 'خانم' ? 'خانم' : 'آقا',
        phone,
        password,
        role: 'customer',
        company: '',
        city: '',
        address: '',
      }
      this.users.push(created)
      persistUsers(this.users)
      this.setSession(created)
      return this.user
    },
    async updateProfile(payload) {
      if (!this.user) return
      if (this.online) {
        try {
          const { data } = await api.put('/auth/profile', payload)
          this.setSession(data.user, this.session.startedAt, localStorage.getItem(TOKEN_KEY))
          return this.user
        } catch (err) {
          throw new Error(apiError(err, 'ذخیره پروفایل انجام نشد.'))
        }
      }
      const nextUser = { ...this.user, ...payload }
      this.setSession(nextUser, this.session.startedAt)
      this.users = this.users.map((user) => (user.id === nextUser.id ? { ...user, ...payload } : user))
      persistUsers(this.users)
      return this.user
    },
    canAccessOrder(order) {
      if (!this.user || !order) return false
      if (this.isAdmin) return true
      return order.userId === this.user.id
    },
    logout() {
      this.session = null
      localStorage.removeItem(TOKEN_KEY)
      this.persistSession()
    },
  },
})
