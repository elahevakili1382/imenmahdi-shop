import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useProductStore } from '@/stores/productStore'
import { useReviewStore } from '@/stores/reviewStore'
import { useLeadStore } from '@/stores/leadStore'
import { useContentStore } from '@/stores/contentStore'
import { useShippingStore } from '@/stores/shippingStore'

let booted = false

export async function bootApp() {
  if (booted) return
  const auth = useAuthStore()
  await auth.hydrate()
  await Promise.all([
    useProductStore().hydrate(),
    useContentStore().hydrate(),
    useShippingStore().hydrate(),
    useReviewStore().hydrate(),
  ])
  if (auth.isLoggedIn) {
    await Promise.all([useOrderStore().hydrate(), useLeadStore().hydrate()])
  }
  booted = true
}

export async function refreshPrivateData() {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return
  await Promise.all([useOrderStore().hydrate(), useLeadStore().hydrate()])
}
