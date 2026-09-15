import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imenmahdi-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function apiError(err, fallback) {
  const data = err?.response?.data
  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof data === 'string' && data.trim()) return data
  const status = err?.response?.status
  if (status === 404) return 'سرور فروشگاه قدیمی است. ترمینال API را ببندید و دوباره npm run dev:api بزنید.'
  return err?.message || fallback
}

export function mediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('data:') || /^https?:\/\//.test(path)) return path
  const base = import.meta.env.VITE_API_URL || ''
  if (base.startsWith('http')) {
    return new URL(path, base.replace(/\/api\/?$/, '/')).toString()
  }
  return path
}

export async function apiReady() {
  try {
    const { data } = await api.get('/health')
    return Boolean(data?.ok)
  } catch {
    return false
  }
}
