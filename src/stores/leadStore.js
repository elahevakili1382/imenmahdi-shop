import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

const STORAGE_KEY = 'imenmahdi-leads'

function readLeads() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('98') && digits.length === 12) return `0${digits.slice(2)}`
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`
  return digits
}

export function isIranMobile(value) {
  return /^09\d{9}$/.test(normalizePhone(value))
}

export const useLeadStore = defineStore('leads', {
  state: () => ({
    leads: readLeads(),
  }),
  getters: {
    newest: (state) => [...state.leads].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leads))
    },
    async hydrate() {
      const auth = useAuthStore()
      if (!auth.online || !auth.isAdmin) return
      try {
        const { data } = await api.get('/leads')
        if (Array.isArray(data)) {
          this.leads = data
          this.persist()
        }
      } catch {
        /* keep local */
      }
    },
    async add({ phone, source = 'footer' }) {
      const clean = normalizePhone(phone)
      if (!isIranMobile(clean)) return null
      try {
        const { data } = await api.post('/leads', { phone: clean, source })
        this.leads.unshift(data)
        this.persist()
        return data
      } catch {
        const exists = this.leads.some((lead) => lead.phone === clean)
        const lead = {
          id: `lead-${Date.now()}`,
          phone: clean,
          source,
          createdAt: new Date().toISOString(),
          duplicate: exists,
        }
        this.leads.unshift(lead)
        this.persist()
        return lead
      }
    },
    async remove(id) {
      this.leads = this.leads.filter((lead) => lead.id !== id)
      this.persist()
      const auth = useAuthStore()
      if (auth.online) await api.delete(`/leads/${id}`).catch(() => {})
    },
  },
})
