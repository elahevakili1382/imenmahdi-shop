<template>
  <section class="container-shop policy">
    <p class="policy__crumb">
      <router-link to="/">خانه</router-link>
      <span> / </span>
      {{ title }}
    </p>
    <h1 class="policy__title">{{ title }}</h1>
    <p v-if="lead" class="policy__lead">{{ lead }}</p>
    <article class="surface-card policy__card">
      <slot />
    </article>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  lead: { type: String, default: '' },
})
</script>

<style scoped>
.policy {
  padding-block: 2.25rem 3.5rem;
  max-width: 46rem;
}

.policy__crumb {
  margin: 0 0 0.75rem;
  color: var(--color-ash);
  font-size: 0.875rem;
}

.policy__crumb a {
  color: inherit;
}

.policy__crumb a:hover {
  color: var(--color-ember);
}

.policy__title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 800;
  line-height: 1.25;
}

.policy__lead {
  margin: 0 0 1.5rem;
  color: var(--color-ash);
  font-size: 0.95rem;
  line-height: 1.8;
}

.policy__card {
  padding: 1.35rem 1.25rem 1.5rem;
}

.policy__card :deep(h2) {
  margin: 1.4rem 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
}

.policy__card :deep(h2:first-child) {
  margin-top: 0;
}

.policy__card :deep(p),
.policy__card :deep(li) {
  color: var(--color-ash);
  font-size: 0.92rem;
  line-height: 1.85;
}

.policy__card :deep(p) {
  margin: 0 0 0.7rem;
}

.policy__card :deep(ul) {
  margin: 0 0 0.7rem;
  padding: 0 1.1rem 0 0;
}

.policy__card :deep(a) {
  color: var(--color-ember);
  font-weight: 700;
}

@media (min-width: 768px) {
  .policy__card {
    padding: 1.75rem 1.85rem;
  }
}
</style>
