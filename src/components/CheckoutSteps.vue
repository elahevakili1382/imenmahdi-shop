<template>
  <nav class="checkout-steps" aria-label="مراحل خرید">
    <ol>
      <li v-for="(step, index) in steps" :key="step.id" :class="stepClass(index)">
        <router-link v-if="canGo(index)" :to="step.to" class="checkout-steps__hit">
          <span class="checkout-steps__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="checkout-steps__label">{{ step.label }}</span>
        </router-link>
        <span
          v-else
          class="checkout-steps__hit is-static"
          :aria-current="index === currentIndex ? 'step' : undefined"
        >
          <span class="checkout-steps__index" aria-hidden="true">{{ index + 1 }}</span>
          <span class="checkout-steps__label">{{ step.label }}</span>
        </span>
        <span v-if="index < steps.length - 1" class="checkout-steps__line" aria-hidden="true" />
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
  { id: 'cart', label: 'سبد خرید', to: '/cart' },
  { id: 'checkout', label: 'مشخصات و ارسال', to: '/checkout' },
  { id: 'pay', label: 'پرداخت و فاکتور', to: null },
]

const currentIndex = computed(() => steps.findIndex((step) => step.id === props.current))

function stepClass(index) {
  if (index < currentIndex.value) return 'is-done'
  if (index === currentIndex.value) return 'is-current'
  return 'is-todo'
}

function canGo(index) {
  return index < currentIndex.value && Boolean(steps[index].to)
}
</script>

<style scoped>
.checkout-steps {
  margin: 0;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.checkout-steps ol {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
  width: max-content;
  max-width: none;
}

.checkout-steps li {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-width: 0;
}

.checkout-steps__hit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.85rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
}

.checkout-steps__hit.is-static {
  cursor: default;
  pointer-events: none;
}

.checkout-steps__index {
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  background: #e8f1ff;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 800;
}

.checkout-steps__label {
  font-size: 0.72rem;
  font-weight: 700;
}

.checkout-steps__line {
  width: 1rem;
  height: 1px;
  background: #cbd5e1;
}

.checkout-steps li.is-current .checkout-steps__hit {
  background: #fff7ed;
  color: #9a3412;
}

.checkout-steps li.is-current .checkout-steps__index,
.checkout-steps li.is-done .checkout-steps__index {
  background: #ea580c;
  color: #fff;
}

.checkout-steps li.is-done .checkout-steps__hit {
  color: #0f172a;
}

.checkout-steps li.is-todo {
  opacity: 0.8;
}

@media (max-width: 639px) {
  .checkout-steps ol {
    justify-content: flex-start;
  }

  .checkout-steps__label {
    font-size: 0.65rem;
  }

  .checkout-steps__line {
    width: 0.55rem;
  }
}
</style>
