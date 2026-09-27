<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { motion } from 'motion-v'
import { asset } from '@/utils/asset'
import { useContentStore } from '@/stores/contentStore'
import ShaderLayer from '@/components/ShaderLayer.vue'

const content = useContentStore()
const slides = computed(() => content.heroSlides)

const index = ref(0)
const userPaused = ref(false)
const hoverPaused = ref(false)
const reduceMotion = ref(false)
let timer
let touchStartX = 0
let touchStartY = 0

const paused = computed(() => userPaused.value || hoverPaused.value || reduceMotion.value)

function go(i) {
  if (!slides.value.length) return
  index.value = (i + slides.value.length) % slides.value.length
  restart()
}

function next() {
  go(index.value + 1)
}

function prev() {
  go(index.value - 1)
}

function onTouchStart(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function onTouchEnd(event) {
  if (slides.value.length < 2) return
  const touch = event.changedTouches?.[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
  // RTL: کشیدن به چپ = بعدی، کشیدن به راست = قبلی
  if (dx < 0) next()
  else prev()
}

function onHeroFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) hoverPaused.value = false
}

function onHeroMouseLeave(event) {
  if (!event.currentTarget.contains(document.activeElement)) hoverPaused.value = false
}

function restart() {
  window.clearInterval(timer)
  if (paused.value || slides.value.length < 2) return
  timer = window.setInterval(() => {
    index.value = (index.value + 1) % slides.value.length
  }, 7500)
}

watch(paused, () => restart())

watch(
  () => slides.value.length,
  () => {
    if (index.value >= slides.value.length) index.value = 0
    restart()
  },
)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) userPaused.value = true
  restart()
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <section
    class="hero-cinematic relative isolate overflow-hidden bg-night text-stone min-h-[22rem] sm:min-h-[48vh]"
    aria-roledescription="carousel"
    aria-label="بنر فروشگاه"
    @mouseenter="hoverPaused = true"
    @mouseleave="onHeroMouseLeave"
    @focusin="hoverPaused = true"
    @focusout="onHeroFocusOut"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="absolute inset-0 overflow-hidden">
      <img
        v-for="(slide, i) in slides"
        :key="`img-${i}-${slide.headline}`"
        :src="asset(slide.image)"
        :alt="slide.headline"
        class="hero-frame absolute inset-0 h-full w-full object-cover"
        :class="[slide.focus, i === index ? 'is-active' : 'is-idle']"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : 'low'"
        decoding="async"
      />
      <div class="absolute inset-0 bg-gradient-to-l from-night via-night/55 to-night/10" />
      <div class="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/40" />
      <ShaderLayer :intensity="0.9" />
    </div>

    <div class="container-shop relative z-10 flex min-h-[22rem] sm:min-h-[48vh] flex-col justify-end pb-7 pt-20">
      <p class="kicker mb-3 flex items-center gap-3 text-copper">
        <span class="h-px w-10 bg-ember" />
        {{ slides[index]?.kicker }}
      </p>
      <motion.h1
        :key="slides[index]?.headline"
        class="display-title max-w-3xl mb-3"
        :initial="reduceMotion ? false : { opacity: 0, y: 18 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }"
      >
        {{ slides[index]?.headline }}
      </motion.h1>
      <p class="max-w-xl text-white/72 text-sm sm:text-base leading-7 mb-5">{{ slides[index]?.copy }}</p>
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <router-link :to="slides[index]?.to || '/products'" class="btn btn-primary min-h-11">
          {{ slides[index]?.cta }}
        </router-link>
        <router-link to="/products" class="btn btn-ghost min-h-11 hero-catalog">
          همه محصولات
        </router-link>
        <div v-if="slides.length > 1" class="flex items-center gap-2">
          <button class="hero-ctrl" type="button" aria-label="اسلاید قبلی" @click="prev">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
          <button class="hero-ctrl" type="button" aria-label="اسلاید بعدی" @click="next">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div v-if="slides.length > 1" class="hero-dots" role="tablist" aria-label="اسلایدهای بنر">
        <button
          v-for="(slide, i) in slides"
          :key="slide.image"
          type="button"
          class="hero-dot"
          :class="{ 'is-on': i === index }"
          :aria-label="slide.kicker || `اسلاید ${i + 1}`"
          :aria-current="i === index ? 'true' : undefined"
          @click="go(i)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-cinematic {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.hero-ctrl {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(12, 14, 18, 0.35);
  color: #f4efe7;
  cursor: pointer;
}

.hero-ctrl:hover,
.hero-ctrl:focus-visible {
  border-color: rgba(255, 255, 255, 0.55);
}

.hero-catalog {
  border-color: rgba(255, 255, 255, 0.45);
  color: #f4efe7;
}

.hero-dots {
  display: flex;
  gap: 0.45rem;
}

.hero-dot {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.hero-dot::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.4);
}

.hero-dot.is-on::after {
  width: 1.25rem;
  background: #c45c26;
}

.hero-frame {
  transform: scale(1.06);
  opacity: 0;
  transition: opacity 800ms ease;
}

.hero-frame.is-active {
  opacity: 1;
  animation: ken 7.5s ease-out forwards;
}

.hero-frame.is-idle {
  opacity: 0;
}

@keyframes ken {
  from {
    transform: scale(1.06);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-frame.is-active {
    animation: none;
    transform: scale(1);
  }
}
</style>
