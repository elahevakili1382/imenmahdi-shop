<script setup>
import { computed } from 'vue'
import { asset } from '@/utils/asset'
import { formatPrice } from '@/utils/money'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from 'vue-toastification'
import { useContactStore } from '@/stores/contactStore'

const props = defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()
const toast = useToast()
const contact = useContactStore()
const outOfStock = computed(() => Number(props.product.stock) <= 0)
const addLabel = computed(() => (outOfStock.value ? 'ناموجود' : 'افزودن به سبد'))

function add() {
  if (outOfStock.value) {
    toast.error('این کالا فعلاً موجود نیست')
    return
  }
  cart.addToCart({ ...props.product, size: props.product.sizes?.[0] })
  toast.success('به سبد اضافه شد')
}

function ask() {
  contact.openWidget(props.product)
}
</script>

<template>
  <article class="surface-card overflow-hidden flex flex-col h-full">
    <router-link :to="`/products/${product.slug}`" class="group flex flex-col flex-1 min-h-0">
      <div class="product-well relative aspect-square overflow-hidden">
        <img
          :src="asset(product.image)"
          :alt="product.title"
          class="h-full w-full object-contain p-3 sm:p-4 transition duration-200 group-hover:scale-105"
        />
        <span
          v-if="product.badge"
          class="absolute top-2 right-2 status-pill bg-ink text-white text-[10px]"
        >
          {{ product.badge }}
        </span>
      </div>
      <div class="p-2.5 sm:p-3 flex flex-col gap-1 flex-1">
        <p class="text-[11px] text-steel">{{ product.subcategory }}</p>
        <h3 class="font-semibold text-xs sm:text-sm leading-5 line-clamp-2">{{ product.title }}</h3>
        <strong class="mt-auto pt-2 text-xs sm:text-sm">{{ formatPrice(product.price) }} تومان</strong>
      </div>
    </router-link>
    <div class="flex gap-1.5 px-2.5 pb-2.5 sm:px-3 sm:pb-3">
      <button class="card-action card-action-ghost flex-1" type="button" @click="ask">مشاوره</button>
      <button
        class="card-action card-action-dark"
        :class="outOfStock ? 'px-3' : 'card-action-icon'"
        type="button"
        :disabled="outOfStock"
        :aria-label="addLabel"
        @click="add"
      >
        <span v-if="outOfStock">ناموجود</span>
        <i v-else class="fa-solid fa-plus" aria-hidden="true"></i>
      </button>
    </div>
  </article>
</template>

<style scoped>
.card-action {
  min-height: 44px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.card-action:hover:not(:disabled),
.card-action:focus-visible:not(:disabled) {
  transform: scale(1.06);
}

.card-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.card-action-ghost {
  border-color: var(--color-line);
  background: transparent;
  color: var(--color-ink);
}

.card-action-ghost:hover:not(:disabled),
.card-action-ghost:focus-visible:not(:disabled) {
  border-color: var(--color-ember);
  color: var(--color-ember);
  background: color-mix(in srgb, var(--color-ember) 8%, #fff);
  box-shadow: 0 8px 18px rgba(196, 92, 38, 0.16);
}

.card-action-dark {
  background: #0c0e12;
  color: #f4efe7;
}

.card-action-dark:hover:not(:disabled),
.card-action-dark:focus-visible:not(:disabled) {
  background: var(--color-ember);
  box-shadow: 0 10px 20px rgba(196, 92, 38, 0.28);
}

.card-action-icon {
  width: 44px;
  padding: 0;
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .card-action,
  .card-action:hover:not(:disabled),
  .card-action:focus-visible:not(:disabled) {
    transition: none;
    transform: none;
  }
}
</style>
