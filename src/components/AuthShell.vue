<template>
  <section class="auth-shell">
    <div class="auth-card">
      <header class="auth-card__head">
        <h1 class="auth-card__title">{{ title }}</h1>
        <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
      </header>
      <slot />
      <p v-if="$slots.footer" class="auth-card__footer">
        <slot name="footer" />
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.auth-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 8rem);
  padding: 1.5rem 1rem 2rem;
}

.auth-card {
  width: 100%;
  max-width: 22rem;
}

.auth-card__head {
  margin-bottom: 1rem;
  text-align: center;
}

.auth-card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.35;
}

.auth-card__subtitle {
  margin: 0.45rem 0 0;
  color: var(--color-ash);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.auth-card__footer {
  margin: 0.85rem 0 0;
  text-align: center;
  font-size: 0.8125rem;
}
</style>
