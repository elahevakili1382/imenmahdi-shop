import { defineStore } from 'pinia'
import { defaultHeroSlides } from '@/data/hero'
import { defaultGuarantee } from '@/data/guarantee'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

const STORAGE_KEY = 'imenmahdi-hero'
const GUARANTEE_KEY = 'imenmahdi-guarantee'

function readSlides() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(saved) && saved.length) return saved
  } catch {
    /* keep default */
  }
  return defaultHeroSlides.map((slide) => ({ ...slide }))
}

function migrateGuaranteeImage(image) {
  if (image === 'images/hero/fire-crew.jpg') return defaultGuarantee.image
  return image || defaultGuarantee.image
}

function readGuarantee() {
  try {
    const saved = JSON.parse(localStorage.getItem(GUARANTEE_KEY) || 'null')
    if (saved && typeof saved === 'object') {
      return {
        ...defaultGuarantee,
        ...saved,
        image: migrateGuaranteeImage(saved.image),
        points: Array.isArray(saved.points) && saved.points.length ? saved.points : defaultGuarantee.points,
      }
    }
  } catch {
    /* keep default */
  }
  return {
    ...defaultGuarantee,
    points: defaultGuarantee.points.map((item) => ({ ...item })),
  }
}

export const useContentStore = defineStore('content', {
  state: () => ({
    heroSlides: readSlides(),
    guarantee: readGuarantee(),
  }),
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.heroSlides))
      const auth = useAuthStore()
      if (auth.online && auth.isAdmin) api.put('/content/hero', this.heroSlides).catch(() => {})
    },
    persistGuarantee() {
      localStorage.setItem(GUARANTEE_KEY, JSON.stringify(this.guarantee))
      const auth = useAuthStore()
      if (auth.online && auth.isAdmin) api.put('/content/guarantee', this.guarantee).catch(() => {})
    },
    async hydrate() {
      try {
        const { data } = await api.get('/content')
        if (Array.isArray(data?.heroSlides) && data.heroSlides.length) this.heroSlides = data.heroSlides
        if (data?.guarantee) {
          this.guarantee = {
            ...defaultGuarantee,
            ...data.guarantee,
            image: migrateGuaranteeImage(data.guarantee.image),
            points:
              Array.isArray(data.guarantee.points) && data.guarantee.points.length
                ? data.guarantee.points
                : defaultGuarantee.points,
          }
        }
      } catch {
        /* keep local */
      }
    },
    updateSlide(index, payload) {
      if (!this.heroSlides[index]) return
      this.heroSlides[index] = { ...this.heroSlides[index], ...payload }
      this.persist()
    },
    addSlide(slide) {
      this.heroSlides.push({ ...defaultHeroSlides[0], ...slide })
      this.persist()
    },
    removeSlide(index) {
      if (this.heroSlides.length <= 1) return
      this.heroSlides.splice(index, 1)
      this.persist()
    },
    resetHero() {
      this.heroSlides = defaultHeroSlides.map((slide) => ({ ...slide }))
      this.persist()
    },
    updateGuarantee(payload) {
      this.guarantee = { ...this.guarantee, ...payload }
      this.persistGuarantee()
    },
    updateGuaranteePoint(index, payload) {
      if (!this.guarantee.points[index]) return
      this.guarantee.points[index] = { ...this.guarantee.points[index], ...payload }
      this.persistGuarantee()
    },
    resetGuarantee() {
      this.guarantee = {
        ...defaultGuarantee,
        points: defaultGuarantee.points.map((item) => ({ ...item })),
      }
      this.persistGuarantee()
    },
  },
})
