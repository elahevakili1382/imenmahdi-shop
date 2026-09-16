<script setup>
import { asset } from '@/utils/asset'
import { categoryTree } from '@/data/catalog'

function categoryTo(name) {
  const group = categoryTree.find((item) => item.name === name)
  return group ? `/products/category/${group.slug}` : '/products'
}

const frames = [
  {
    id: 'fire',
    title: 'تجهیزات آتش نشانی',
    description: 'لباس عملیاتی، کلاه و چکمه برای تیم اطفا و ایستگاه.',
    image: 'images/lookbook/fire-ops-crew.jpg',
    to: categoryTo('تجهیزات آتش نشانی'),
    featured: true,
    position: 'center 48%',
  },
  {
    id: 'ppe',
    title: 'تجهیزات حفاظت فردی',
    description: 'کلاه، عینک و ماسک برای کارگاه، رنگ و خط تولید.',
    image: 'images/lookbook/ppe-crew.jpg',
    to: categoryTo('تجهیزات حفاظت فردی'),
    position: 'center 30%',
  },
  {
    id: 'height',
    title: 'تجهیزات کار در ارتفاع',
    description: 'هارنس، لیمیتر و کلاه برای کار روی دکل و نما.',
    image: 'images/lookbook/height-window.jpg',
    to: categoryTo('تجهیزات کار در ارتفاع'),
    position: 'center 35%',
  },
  {
    id: 'respiratory',
    title: 'تجهیزات تنفسی',
    description: 'ماسک تمام‌صورت، نیم‌صورت و فیلتر برای جوش، رنگ و شیمی.',
    image: 'images/lookbook/respiratory-painter.jpg',
    to: categoryTo('تجهیزات تنفسی'),
    position: 'center 22%',
  },
  {
    id: 'traffic',
    title: 'تجهیزات ترافیکی',
    description: 'جلیقه شبرنگ، علائم و مانع برای ایمن‌سازی مسیر کار.',
    image: 'images/lookbook/traffic-cone.jpg',
    to: categoryTo('تجهیزات ترافیکی'),
    position: 'left center',
  },
]
</script>

<template>
  <section class="container-shop py-8 sm:py-12">
    <div class="lookbook">
      <article class="look-intro">
        <p class="kicker" v-fade-up>کاتالوگ تصویری</p>
        <h2 class="section-title" v-fade-up>ورود سریع به دسته‌ها</h2>
        <p>
          یک تصویر، یک دسته. جزئیات فنی و قیمت داخل همان دسته است.
        </p>
      </article>

      <router-link
        v-for="frame in frames"
        :key="frame.id"
        :to="frame.to"
        class="look-card group"
        :class="{ 'look-featured': frame.featured, 'look-contain': frame.contain }"
      >
        <img
          :src="asset(frame.image)"
          :alt="frame.title"
          loading="lazy"
          decoding="async"
          :style="frame.position ? { objectPosition: frame.position } : undefined"
        />
        <div class="look-shade" aria-hidden="true" />
        <div class="look-copy">
          <h3>{{ frame.title }}</h3>
          <p>{{ frame.description }}</p>
          <span>
            مشاهده دسته
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </span>
        </div>
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.lookbook {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-width: 0;
}

.look-intro,
.look-featured {
  grid-column: 1 / -1;
}

.look-card {
  position: relative;
  overflow: hidden;
  min-height: 11.25rem;
  min-width: 0;
  border-radius: 22px;
  color: var(--color-paper);
}

.look-featured {
  min-height: 16.5rem;
}

.look-card:not(.look-featured) .look-copy p {
  display: none;
}

.look-intro {
  padding: 1.6rem 1.35rem 1.4rem;
  border-radius: 28px;
  background: var(--color-bone);
  border: 1px solid var(--color-line);
}

.look-intro p:last-child {
  margin-top: 0.85rem;
  max-width: 36ch;
  color: var(--color-ash);
  font-size: 0.95rem;
  line-height: 1.9;
}

.look-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 420ms ease;
}

.look-contain {
  background: var(--color-bone);
}

.look-contain img {
  object-fit: contain;
  padding: 1.25rem;
}

.look-card:hover img,
.look-card:focus-visible img {
  transform: scale(1.05);
}

.look-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 14, 18, 0.08), rgba(12, 14, 18, 0.78) 78%);
}

.look-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: inherit;
  padding: 1.25rem 1.2rem 1.15rem;
}

.look-copy h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 2.6vw, 1.35rem);
  font-weight: 800;
  letter-spacing: 0;
}

.look-copy p {
  margin: 0.45rem 0 0.9rem;
  max-width: 28ch;
  color: rgba(244, 239, 231, 0.78);
  font-size: 0.88rem;
  line-height: 1.75;
}

.look-copy span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-copper);
}

.look-card:hover .look-copy span i {
  transform: translateX(-3px);
}

.look-copy span i {
  transition: transform 180ms ease;
}

@media (min-width: 640px) {
  .lookbook {
    gap: 14px;
  }

  .look-card {
    min-height: 14.5rem;
    border-radius: 28px;
  }

  .look-card:not(.look-featured) .look-copy p {
    display: block;
  }
}

@media (min-width: 900px) {
  .lookbook {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: minmax(280px, 1.15fr) minmax(230px, auto);
    gap: 16px;
  }

  .look-intro {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .look-featured {
    grid-column: 2 / -1;
    grid-row: 1;
    min-height: 100%;
  }

  .look-card:not(.look-featured) {
    min-height: 230px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .look-card img,
  .look-card:hover img,
  .look-copy span i {
    transition: none;
    transform: none;
  }
}
</style>
