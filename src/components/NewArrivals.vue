<script setup>
import { computed } from 'vue'
import { asset } from '@/utils/asset'
import { displayPrice } from '@/utils/money'
import { categoryTree } from '@/data/catalog'
import { useProductStore } from '@/stores/productStore'

const products = useProductStore()

function categoryTo(name) {
  const group = categoryTree.find((item) => item.name === name)
  return group ? `/products/category/${group.slug}` : '/products'
}

const promos = [
  {
    id: 'fire',
    title: 'تجهیزات آتش نشانی',
    image: 'images/promos/fire-gear.jpg',
    position: 'center 38%',
    to: categoryTo('تجهیزات آتش نشانی'),
  },
  {
    id: 'ppe',
    title: 'تجهیزات حفاظت فردی',
    image: 'images/promos/ppe-gear.jpg',
    position: 'center 72%',
    to: categoryTo('تجهیزات حفاظت فردی'),
  },
]

const newest = computed(() => products.newest)
</script>

<template>
  <section class="new-arrivals container-shop" aria-label="محصولات جدید">
    <div class="promo-row">
      <router-link v-for="promo in promos" :key="promo.id" :to="promo.to" class="promo-card">
        <img
          :src="asset(promo.image)"
          :alt="promo.title"
          loading="lazy"
          decoding="async"
          :style="{ objectPosition: promo.position }"
        />
        <span class="promo-card__shade" aria-hidden="true" />
        <span class="promo-card__copy">
          <span class="promo-card__cta">خرید</span>
          <span class="promo-card__title">{{ promo.title }}</span>
        </span>
      </router-link>
    </div>

    <div v-if="newest.length" class="new-head">
      <h2 class="section-title">محصولات جدید</h2>
      <router-link to="/products" class="new-all">
        مشاهده همه
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </router-link>
    </div>

    <div v-if="newest.length" class="new-grid">
      <router-link
        v-for="product in newest"
        :key="product.id"
        :to="`/products/${product.slug}`"
        class="new-card"
      >
        <span class="new-card__photo">
          <img :src="asset(product.image)" :alt="product.title" loading="lazy" decoding="async" />
        </span>
        <span class="new-card__copy">
          <h3 :title="product.title">{{ product.title }}</h3>
          <strong>{{ displayPrice(product) }}</strong>
        </span>
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.new-arrivals {
  padding-block: 1.5rem 0.5rem;
}

.promo-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.promo-card {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 2.35 / 1;
  border-radius: 16px;
  color: #fff;
  text-decoration: none;
  isolation: isolate;
  background: #1c1916;
}

.promo-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(12, 14, 18, 0.58) 8%, rgba(12, 14, 18, 0.14) 58%);
}

.promo-card__copy {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 0.9rem;
}

.promo-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  padding: 0 1rem;
  border-radius: 999px;
  background: var(--color-ember);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
}

.promo-card__title {
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.4;
}

.promo-card:hover .promo-card__cta,
.promo-card:focus-visible .promo-card__cta {
  background: var(--color-ember-hover);
}

.promo-card:focus-visible {
  outline: 2px solid var(--color-ember);
  outline-offset: 3px;
}

.new-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.new-all {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.75rem;
  color: var(--color-ember);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}

.new-all i {
  font-size: 0.7rem;
}

.new-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.new-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  min-height: 5.25rem;
  padding: 0.6rem 0.75rem 0.6rem 0.65rem;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: #fff;
  color: var(--color-ink);
  text-decoration: none;
  box-shadow: 0 1px 0 rgba(12, 14, 18, 0.04);
  transition:
    border-color 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms cubic-bezier(0.2, 0, 0, 1),
    transform 180ms cubic-bezier(0.2, 0, 0, 1);
}

.new-card__photo {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-bone);
}

.new-card__photo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.28rem;
}

.new-card__copy {
  min-width: 0;
  flex: 1;
}

.new-card__copy h3 {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.new-card__copy strong {
  display: block;
  margin-top: 0.28rem;
  color: var(--color-ink);
  font-size: 0.78rem;
  font-weight: 800;
}

.new-card:hover,
.new-card:focus-visible {
  border-color: color-mix(in srgb, var(--color-ember) 42%, var(--color-line));
  box-shadow: 0 12px 28px rgba(28, 25, 22, 0.1);
}

.new-card:focus-visible {
  outline: 2px solid var(--color-ember);
  outline-offset: 2px;
}

.new-card:active {
  transform: scale(0.99);
}

@media (min-width: 640px) {
  .promo-row {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .new-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (min-width: 1024px) {
  .new-arrivals {
    padding-block: 1.75rem 0.75rem;
  }

  .new-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .new-card__copy h3,
  .new-card__copy strong {
    font-size: 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .new-card,
  .promo-card__cta,
  .new-card:active {
    transition: none;
    transform: none;
  }
}
</style>
