<template>
  <nav class="checkout-steps" aria-label="مراحل خرید">
    <ol>
      <li v-for="(step, index) in steps" :key="step.id" :class="stepClass(index)">
        <router-link
          v-if="canGo(index)"
          :to="step.to"
          class="checkout-steps__hit"
        >
          <span class="checkout-steps__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="checkout-steps__label">{{ step.label }}</span>
        </router-link>
        <span v-else class="checkout-steps__hit is-static" :aria-current="index === currentIndex ? 'step' : undefined">
          <span class="checkout-steps__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="checkout-steps__label">{{ step.label }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: String,
    required: true,
    validator: (value) => ['cart', 'checkout', 'pay'].includes(value),
  },
})

const steps = [
  { id: 'cart', label: 'سبد', to: '/cart' },
  { id: 'checkout', label: 'تسویه', to: '/checkout' },
  { id: 'pay', label: 'پرداخت و رسید', to: null },
]

const currentIndex = computed(() => steps.findIndex((step) => step.id === props.current))

function stepClass(index) {
  if (index < currentIndex.value) return 'is-done'
  if (index === currentIndex.value) return 'is-current'
  return 'is-todo'
}

/** فقط مراحل قبلی قابل برگشت‌اند؛ آینده و فعلی نه */
function canGo(index) {
  return index < currentIndex.value && Boolean(steps[index].to)
}
</script>

<style scoped>
.checkout-steps {
  margin-bottom: 1.5rem;
}

.checkout-steps ol {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checkout-steps li {
  flex: 1;
  min-width: 0;
  border-radius: 999px;
  border: 1px solid var(--color-line, #d9d0c3);
  background: var(--color-bone, #fbfaf7);
  color: var(--color-ash, #6b6560);
  font-size: 0.78rem;
  font-weight: 600;
  overflow: hidden;
}

.checkout-steps__hit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.55rem 0.7rem;
  color: inherit;
  text-decoration: none;
}

.checkout-steps__hit.is-static {
  cursor: default;
  pointer-events: none;
}

.checkout-steps__index {
  display: grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: #eee8de;
  color: inherit;
  font-size: 0.7rem;
}

.checkout-steps li.is-current {
  border-color: var(--color-ember, #c45c26);
  background: color-mix(in srgb, var(--color-ember, #c45c26) 10%, #fff);
  color: var(--color-ink, #1c1916);
}

.checkout-steps li.is-current .checkout-steps__index,
.checkout-steps li.is-done .checkout-steps__index {
  background: var(--color-ember, #c45c26);
  color: #fff;
}

.checkout-steps li.is-done {
  border-color: color-mix(in srgb, var(--color-ember, #c45c26) 35%, #d9d0c3);
  color: var(--color-ink, #1c1916);
}

.checkout-steps li.is-done .checkout-steps__hit:hover {
  background: color-mix(in srgb, var(--color-ember, #c45c26) 8%, #fff);
}

.checkout-steps li.is-todo {
  opacity: 0.72;
}

@media (max-width: 480px) {
  .checkout-steps__label {
    font-size: 0.7rem;
  }
}
</style>
