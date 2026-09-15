<script setup>
import { categoryTree } from '@/data/catalog'
import { formatPrice } from '@/utils/money'

const COLOR_SWATCH = {
  زرد: '#E6B800',
  سفید: '#F7F3EC',
  مشکی: '#1C1916',
  سرمه‌ای: '#1B3A4B',
  خاکستری: '#8A847C',
  سبز: '#2F6F5E',
  آبی: '#3D5A80',
  نارنجی: '#C45C26',
  قرمز: '#B42318',
  طلایی: '#C4A484',
  شفاف: '#D9E2EC',
}

defineProps({
  selectedCategories: { type: Array, default: () => [] },
  selectedSizes: { type: Array, default: () => [] },
  selectedColors: { type: Array, default: () => [] },
  availableSizes: { type: Array, default: () => [] },
  availableColors: { type: Array, default: () => [] },
  price: { type: Object, required: true },
  bounds: { type: Object, required: true },
  lockedCategory: { type: String, default: '' },
})

const emit = defineEmits(['toggle-category', 'toggle-size', 'toggle-color', 'update-price', 'clear'])

function swatch(name) {
  return COLOR_SWATCH[name] || '#C4A484'
}
</script>

<template>
  <aside class="filter-panel">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-bold">فیلترها</h2>
      <button class="text-sm text-ember" type="button" @click="emit('clear')">حذف همه</button>
    </div>

    <section class="filter-block">
      <h3>دسته‌بندی</h3>
      <label v-for="group in categoryTree" :key="group.slug" class="filter-check">
        <input
          type="checkbox"
          :checked="selectedCategories.includes(group.slug) || lockedCategory === group.slug"
          :disabled="Boolean(lockedCategory)"
          @change="emit('toggle-category', group.slug)"
        />
        <span>{{ group.name }}</span>
      </label>
    </section>

    <section class="filter-block">
      <h3>سایز</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in availableSizes"
          :key="size"
          type="button"
          class="size-chip"
          :class="{ 'is-on': selectedSizes.includes(size) }"
          @click="emit('toggle-size', size)"
        >
          {{ size }}
        </button>
      </div>
    </section>

    <section class="filter-block">
      <h3>رنگ</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in availableColors"
          :key="color"
          type="button"
          class="color-chip"
          :class="{ 'is-on': selectedColors.includes(color) }"
          :title="color"
          :aria-pressed="selectedColors.includes(color)"
          @click="emit('toggle-color', color)"
        >
          <span class="color-dot" :style="{ background: swatch(color) }" />
          <span>{{ color }}</span>
        </button>
      </div>
    </section>

    <section class="filter-block">
      <h3>محدوده قیمت</h3>
      <p class="text-sm text-steel mb-3">
        {{ formatPrice(price.min) }} — {{ formatPrice(price.max) }} تومان
      </p>
      <label class="block text-xs text-steel mb-2">
        از
        <input
          class="range"
          type="range"
          :min="bounds.min"
          :max="bounds.max"
          :step="10000"
          :value="price.min"
          @input="emit('update-price', { min: Number($event.target.value), max: price.max })"
        />
      </label>
      <label class="block text-xs text-steel">
        تا
        <input
          class="range"
          type="range"
          :min="bounds.min"
          :max="bounds.max"
          :step="10000"
          :value="price.max"
          @input="emit('update-price', { min: price.min, max: Number($event.target.value) })"
        />
      </label>
    </section>
  </aside>
</template>

<style scoped>
.filter-panel {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  padding: 20px;
}

.filter-block + .filter-block {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line);
}

.filter-block h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.filter-check {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  font-size: 14px;
  cursor: pointer;
}

.filter-check input {
  width: 16px;
  height: 16px;
  accent-color: #c45c26;
}

.size-chip,
.color-chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: #fbfaf7;
  font-size: 13px;
}

.size-chip.is-on,
.color-chip.is-on {
  border-color: #1c1916;
  background: #1c1916;
  color: #fff;
}

.color-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(12, 14, 18, 0.15);
}

.range {
  width: 100%;
  margin-top: 6px;
  accent-color: #c45c26;
}
</style>
