<template>
  <div class="contact-page">
    <section class="contact-hero">
      <PaperMeshGradient />
      <PaperMeshGradient
        class="contact-mesh-soft"
        :colors="['#0C0E12', '#F4EFE7', '#C45C26', '#C4A484']"
        :speed="0.18"
        :opacity="0.42"
        :distortion="0.38"
        :swirl="0.06"
        :grain-mixer="0.18"
        :grain-overlay="0.2"
      />
      <img class="contact-hero-photo" :src="heroImage" alt="" />
      <div class="contact-hero-shade" aria-hidden="true" />
      <svg class="contact-filters" aria-hidden="true">
        <defs>
          <filter id="contact-glass" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
          </filter>
          <filter id="contact-text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div class="container-shop contact-hero-inner">
        <p class="contact-badge" v-fade-up>
          <span class="contact-badge-shine" aria-hidden="true" />
          ارتباط مستقیم
        </p>
        <h1 class="display-title contact-title" v-fade-up>
          <span class="contact-title-soft">تماس با</span>
          ایمن یاب
        </h1>
        <p class="contact-lead" v-fade-up>
          برای استعلام موجودی، خرید سازمانی و انتخاب سایز از بله، روبیکا، واتساپ یا تماس استفاده کنید.
          پاسخ از ساعت ۸:۳۰ الی ۱۹:۰۰ داده می‌شود.
        </p>

        <div class="contact-dock-wrap">
          <Transition name="dock-card" mode="out-in">
            <a
              :key="active.id"
              class="dock-card"
              :href="active.href"
              :target="active.external ? '_blank' : undefined"
              :rel="active.external ? 'noopener noreferrer' : undefined"
            >
              <span class="dock-card-icon" aria-hidden="true">
                <i :class="active.icon"></i>
              </span>
              <span class="dock-card-copy">
                <span class="dock-card-name">{{ active.title }}</span>
                <span class="dock-card-meta">{{ active.meta }}</span>
              </span>
              <span class="dock-card-cta">
                {{ active.cta }}
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
              </span>
            </a>
          </Transition>

          <div class="dock" role="toolbar" aria-label="راه تماس">
            <button
              v-for="channel in channels"
              :key="channel.id"
              class="dock-btn"
              :class="{ 'is-active': active.id === channel.id }"
              type="button"
              :aria-pressed="active.id === channel.id"
              :aria-label="channel.title"
              @mouseenter="activeId = channel.id"
              @focus="activeId = channel.id"
              @click="openChannel(channel)"
            >
              <i :class="channel.icon" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="container-shop contact-body">

      <div class="contact-split">
        <article class="surface-card address-card">
          <p class="kicker">فروشگاه</p>
          <h2 class="address-title">آدرس و تلفن</h2>
          <p class="address-text">{{ shopContact.address }}</p>
          <p class="address-text">ساعت کاری: {{ shopContact.hours }}</p>
          <a class="address-phone" :href="telLink(phone.raw)">
            {{ phone.display }}
          </a>
          <a
            class="btn btn-ghost address-map"
            :href="mapsHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            مشاهده روی نقشه
          </a>
        </article>

        <form class="surface-card inquiry-card" @submit.prevent="sendInquiry">
          <p class="kicker">پیام سریع</p>
          <h2 class="address-title">متن آماده برای واتساپ</h2>
          <p class="inquiry-help">نام و درخواست را بنویسید؛ همان متن در واتساپ باز می‌شود.</p>

          <label class="inquiry-label" for="contact-name">نام و نام خانوادگی</label>
          <input id="contact-name" v-model="name" class="field" autocomplete="name" />

          <label class="inquiry-label" for="contact-message">پیام</label>
          <textarea
            id="contact-message"
            v-model="message"
            class="field inquiry-text"
            rows="4"
            required
          />
          <p v-if="error" id="contact-error" class="inquiry-error" role="alert">{{ error }}</p>

          <div class="inquiry-actions">
            <button class="btn btn-primary" type="submit">ارسال در واتساپ</button>
            <a class="btn btn-dark" :href="baleHref" target="_blank" rel="noopener noreferrer">
              پیام در بله
            </a>
            <a class="btn btn-ghost" :href="rubikaHref" target="_blank" rel="noopener noreferrer">
              پیام در روبیکا
            </a>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { baleLink, productInquiryText, rubikaLink, shopContact, telLink, whatsappLink } from '@/data/contact'
import { asset } from '@/utils/asset'
import PaperMeshGradient from '@/components/PaperMeshGradient.vue'

const heroImage = asset('images/hero/factory-floor.jpg')

const name = ref('')
const message = ref(productInquiryText())
const error = ref('')

const phone = shopContact.phones[0]
const baleHref = baleLink()
const rubikaHref = rubikaLink()
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopContact.address)}`

const activeId = ref('bale')

const channels = computed(() => [
  {
    id: 'bale',
    title: 'بله',
    meta: phone.display,
    cta: 'ارسال پیام',
    icon: 'fa-solid fa-comments',
    href: baleHref,
    external: true,
  },
  {
    id: 'rubika',
    title: 'روبیکا',
    meta: phone.display,
    cta: 'ارسال پیام',
    icon: 'fa-solid fa-paper-plane',
    href: rubikaHref,
    external: true,
  },
  {
    id: 'whatsapp',
    title: 'واتساپ',
    meta: phone.display,
    cta: 'شروع گفتگو',
    icon: 'fa-brands fa-whatsapp',
    href: whatsappLink(productInquiryText()),
    external: true,
  },
  {
    id: 'phone',
    title: 'تماس تلفنی',
    meta: phone.display,
    cta: 'شماره‌گیری',
    icon: 'fa-solid fa-phone',
    href: telLink(phone.raw),
    external: false,
  },
])

const active = computed(() => channels.value.find((item) => item.id === activeId.value) || channels.value[0])

function openChannel(channel) {
  activeId.value = channel.id
  if (channel.external) {
    window.open(channel.href, '_blank', 'noopener,noreferrer')
    return
  }
  window.location.href = channel.href
}

function sendInquiry() {
  error.value = ''
  const text = [name.value.trim() && `سلام، ${name.value.trim()} هستم.`, message.value.trim()]
    .filter(Boolean)
    .join('\n')
  if (!message.value.trim()) {
    error.value = 'متن پیام را بنویسید.'
    return
  }
  window.open(whatsappLink(text), '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.contact-hero {
  position: relative;
  overflow: hidden;
  min-height: min(88vh, 46rem);
  background: var(--color-night);
  color: var(--color-paper);
  padding: 6.5rem 0 0;
}

.contact-mesh-soft {
  mix-blend-mode: screen;
}

.contact-hero-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 72% 28%;
  opacity: 0.38;
  mix-blend-mode: luminosity;
}

.contact-hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(12, 14, 18, 0.28) 0%, rgba(12, 14, 18, 0.12) 36%, rgba(12, 14, 18, 0.62) 78%, var(--color-paper) 100%),
    linear-gradient(270deg, rgba(12, 14, 18, 0.08), rgba(12, 14, 18, 0.58));
}

.contact-filters {
  position: absolute;
  width: 0;
  height: 0;
}

.contact-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: min(72vh, 38rem);
}

.contact-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin: 0;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(244, 239, 231, 0.14);
  background: rgba(244, 239, 231, 0.06);
  color: rgba(244, 239, 231, 0.92);
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  filter: url(#contact-glass);
}

.contact-badge-shine {
  position: absolute;
  top: 0;
  right: 0.75rem;
  left: 0.75rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(196, 164, 132, 0.55), transparent);
}

.contact-title {
  max-width: 14ch;
  color: var(--color-paper);
  margin-top: 1rem;
  text-shadow: 0 12px 40px rgba(12, 14, 18, 0.45);
  filter: url(#contact-text-glow);
}

.contact-title-soft {
  display: block;
  margin-bottom: 0.2rem;
  color: rgba(244, 239, 231, 0.78);
  font-weight: 500;
  font-size: 0.48em;
}

.contact-lead {
  max-width: 38rem;
  margin-top: 1rem;
  color: rgba(244, 239, 231, 0.82);
  line-height: 1.9;
  font-size: 1rem;
}

.contact-body {
  padding-block: 2rem 4rem;
}

.contact-dock-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.85rem;
  margin-top: auto;
  padding: 2.5rem 0 2rem;
}

.dock-card {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  width: min(22rem, 100%);
  min-height: 5.25rem;
  padding: 0.9rem 1rem;
  border-radius: 22px;
  background: var(--color-bone);
  color: var(--color-ink);
  border: 1px solid rgba(244, 239, 231, 0.35);
  box-shadow: var(--shadow-lg);
}

.dock-card-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--color-ember) 14%, var(--color-sand));
  color: var(--color-ember);
}

.dock-card-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.dock-card-name {
  font-weight: 800;
}

.dock-card-meta {
  color: var(--color-ash);
  font-size: 0.85rem;
  direction: ltr;
  text-align: start;
}

.dock-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-ember);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.dock {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem;
  border-radius: 999px;
  background: rgba(12, 14, 18, 0.72);
  border: 1px solid rgba(244, 239, 231, 0.12);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(16px);
}

.dock-btn {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-paper);
  cursor: pointer;
}

.dock-btn:hover,
.dock-btn:focus-visible {
  background: rgba(244, 239, 231, 0.1);
}

.dock-btn.is-active {
  background: var(--color-ember);
  color: #fff;
}

.dock-card-enter-active,
.dock-card-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.dock-card-enter-from,
.dock-card-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.contact-split {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.address-card,
.inquiry-card {
  padding: 1.5rem;
}

.address-title {
  font-family: var(--font-display);
  font-size: clamp(1.45rem, 2.4vw, 1.85rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0;
  margin: 0.45rem 0 0.75rem;
}

.address-text {
  color: var(--color-ash);
  line-height: 1.9;
}

.address-phone {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  margin-top: 0.65rem;
  color: var(--color-ink);
  font-size: 1.35rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 0;
}

.address-phone:hover,
.address-phone:focus-visible {
  color: var(--color-ember);
}

.address-map {
  margin-top: 1.25rem;
}

.inquiry-help {
  color: var(--color-ash);
  font-size: 0.92rem;
  line-height: 1.8;
  margin-bottom: 1.1rem;
}

.inquiry-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.inquiry-label + .field {
  margin-bottom: 1rem;
}

.inquiry-text {
  min-height: 7.5rem;
  resize: vertical;
}

.inquiry-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin: -0.35rem 0 0.85rem;
}

.inquiry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

@media (max-width: 420px) {
  .dock-card {
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .dock-card-cta {
    grid-column: 2;
    justify-self: start;
  }
}

@media (min-width: 768px) {
  .contact-hero {
    padding-top: 7.5rem;
  }

  .contact-split {
    grid-template-columns: 0.9fr 1.1fr;
    align-items: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dock-card-enter-active,
  .dock-card-leave-active,
  .dock-card-enter-from,
  .dock-card-leave-to {
    transition: none;
    transform: none;
  }
}
</style>
