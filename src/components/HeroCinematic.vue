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

function togglePause() {
  const shouldPause = !paused.value
  userPaused.value = shouldPause
  if (!shouldPause) hoverPaused.value = false
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
    class="relative isolate overflow-hidden bg-night text-stone min-h-[34rem] sm:min-h-[68vh]"
    aria-roledescription="carousel"
    aria-label="بنر فروشگاه"
    @mouseenter="hoverPaused = true"
    @mouseleave="onHeroMouseLeave"
    @focusin="hoverPaused = true"
    @focusout="onHeroFocusOut"
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

    <div class="container-shop relative z-10 flex min-h-[34rem] sm:min-h-[68vh] flex-col justify-end pb-8 pt-24">
      <p class="kicker mb-4 flex items-center gap-3 text-copper">
        <span class="h-px w-10 bg-ember" />
        {{ slides[index]?.kicker }}
      </p>
      <motion.h1
        :key="slides[index]?.headline"
        class="display-title max-w-3xl mb-4"
        :initial="reduceMotion ? false : { opacity: 0, y: 18 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }"
      >
        {{ slides[index]?.headline }}
      </motion.h1>
      <p class="max-w-xl text-white/72 text-base sm:text-lg leading-8 mb-6">{{ slides[index]?.copy }}</p>
      <div class="flex flex-wrap items-center gap-3 mb-8">
        <router-link :to="slides[index]?.to || '/products'" class="btn btn-primary">
          {{ slides[index]?.cta }}
        </router-link>
        <div v-if="slides.length > 1" class="flex items-center gap-2">
          <button class="hero-ctrl" type="button" aria-label="اسلاید قبلی" @click="prev">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
          <button
            class="hero-ctrl"
            type="button"
            :aria-label="paused ? 'پخش اسلایدها' : 'توقف اسلایدها'"
            :aria-pressed="paused"
            @click="togglePause"
          >
            <i :class="paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'" aria-hidden="true"></i>
          </button>
          <button class="hero-ctrl" type="button" aria-label="اسلاید بعدی" @click="next">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-3">
        <button
          v-for="(slide, i) in slides"
          :key="slide.image"
          type="button"
          class="group flex items-start gap-3 rounded-2xl border px-4 py-3 text-right transition"
          :class="
            i === index
              ? 'border-ember/70 bg-white/10'
              : 'border-white/10 bg-black/20 hover:border-white/25'
          "
          :aria-current="i === index ? 'true' : undefined"
          :aria-label="slide.headline || slide.kicker"
          @click="go(i)"
        >
          <span class="text-xs tabular-nums text-copper pt-0.5">{{ String(i + 1).padStart(2, '0') }}</span>
          <span>
            <span class="block text-sm font-semibold">{{ slide.kicker }}</span>
            <span class="block text-[12px] text-white/55 mt-0.5 leading-5">{{ slide.cta }}</span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
