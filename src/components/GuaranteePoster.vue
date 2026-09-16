<script setup>
import { computed } from 'vue'
import { asset } from '@/utils/asset'
import { useContentStore } from '@/stores/contentStore'
import PaperMeshGradient from '@/components/PaperMeshGradient.vue'

const content = useContentStore()
const poster = computed(() => content.guarantee)
const titleLines = computed(() => String(poster.value.title || '').split(/،\s*|,\s*/).filter(Boolean))
</script>

<template>
  <section class="container-shop py-6 sm:py-10">
    <article class="poster">
      <div class="poster-photo">
        <PaperMeshGradient />
        <PaperMeshGradient
          class="poster-mesh-soft"
          :colors="['#0C0E12', '#F4EFE7', '#C45C26', '#C4A484']"
          :speed="0.16"
          :opacity="0.4"
          :distortion="0.34"
          :swirl="0.05"
          :grain-mixer="0.16"
          :grain-overlay="0.18"
        />
        <img :src="asset(poster.image)" :alt="poster.title" loading="lazy" decoding="async" />
        <div class="poster-photo-fade" />
      </div>

      <div class="poster-panel">
        <p class="poster-badge" v-fade-up>{{ poster.kicker }}</p>
        <h2 class="section-title poster-title" v-fade-up>
          <template v-if="titleLines.length > 1">
            {{ titleLines[0] }}،<br />{{ titleLines.slice(1).join('، ') }}
          </template>
          <template v-else>{{ poster.title }}</template>
        </h2>
        <p class="poster-lead">{{ poster.lead }}</p>
        <ol>
          <li v-for="item in poster.points" :key="item.n">
            <span class="poster-mark" aria-hidden="true"></span>
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.text }}</small>
            </span>
          </li>
        </ol>
        <router-link :to="poster.ctaTo || '/contact'" class="poster-cta">
          {{ poster.cta }}
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </router-link>
      </div>
    </article>
  </section>
</template>

<style scoped>
.poster {
  display: grid;
  overflow: hidden;
  border-radius: 28px;
  background: #0c0e12;
  color: #f4efe7;
  box-shadow: 0 22px 50px rgba(12, 14, 18, 0.2);
}

.poster-photo {
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.poster-mesh-soft {
  mix-blend-mode: screen;
}

.poster-photo img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 22%;
  opacity: 0.72;
  mix-blend-mode: luminosity;
}

.poster-photo-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 14, 18, 0.08) 40%, rgba(12, 14, 18, 0.72));
}

.poster-panel {
  padding: 28px 22px 26px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 28%),
    #12151b;
}

.poster-badge {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(244, 239, 231, 0.12);
  background: rgba(244, 239, 231, 0.05);
  color: #c4a484;
  font-size: 0.8125rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.poster-title {
  margin-top: 0.75rem;
  color: #f4efe7;
}

.poster-lead {
  margin: 14px 0 20px;
  color: rgba(244, 239, 231, 0.68);
  font-size: 0.95rem;
  line-height: 1.85;
}

.poster-panel ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.poster-panel li {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid rgba(244, 239, 231, 0.08);
}

.poster-mark {
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 999px;
  background: #c45c26;
  box-shadow: 0 0 0 4px rgba(196, 92, 38, 0.16);
}

.poster-panel strong {
  display: block;
  font-size: 0.98rem;
  font-weight: 800;
}

.poster-panel small {
  display: block;
  margin-top: 3px;
  color: rgba(244, 239, 231, 0.58);
  font-size: 0.8rem;
  line-height: 1.7;
}

.poster-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 22px;
  min-height: 48px;
  padding: 0 1.35rem;
  border-radius: 999px;
  background: #c45c26;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
}

.poster-cta:hover {
  background: #a34b1f;
}

@media (min-width: 900px) {
  .poster {
    grid-template-columns: 1.15fr 0.85fr;
    min-height: 560px;
  }

  .poster-photo {
    min-height: 100%;
  }

  .poster-photo-fade {
    background: linear-gradient(90deg, rgba(12, 14, 18, 0.12), rgba(12, 14, 18, 0.42));
  }

  .poster-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 42px 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .poster-cta {
    transition: none;
  }
}
</style>
