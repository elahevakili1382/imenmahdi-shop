<script setup>
import { ref } from 'vue'
import { categoryTree } from '@/data/catalog'
import { baleLink, productInquiryText, shopContact, telLink, whatsappLink } from '@/data/contact'
import { isIranMobile, useLeadStore } from '@/stores/leadStore'
import { useToast } from 'vue-toastification'

const toast = useToast()
const leads = useLeadStore()
const phone = ref('')
const accepted = ref(false)
const joined = ref(false)
const root = ref(null)

const shopGroups = [
  {
    title: 'خرید',
    links: [
      { label: 'همه محصولات', to: '/products' },
      { label: 'سبد خرید', to: '/cart' },
      { label: 'پیگیری سفارش', to: '/account/orders' },
      { label: 'تماس با فروشگاه', to: '/contact' },
    ],
  },
  {
    title: 'دسته‌ها',
    links: categoryTree.map((group) => ({
      label: group.name,
      to: `/products/category/${group.slug}`,
    })),
  },
  {
    title: 'ارسال',
    links: [
      { label: 'تیپاکس و ماهکس', to: '/contact' },
      { label: 'پست پیشتاز', to: '/contact' },
      { label: 'باربری شهرستان', to: '/contact' },
      { label: 'مشاوره سایز', to: '/contact' },
    ],
  },
]

function onPointerMove(event) {
  const el = root.value
  if (!el) return
  const bounds = el.getBoundingClientRect()
  el.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`)
  el.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`)
}

async function submit(event) {
  event.preventDefault()
  if (!accepted.value) {
    toast.error('موافقت با پیام را تیک بزنید')
    return
  }
  if (!isIranMobile(phone.value)) {
    toast.error('شماره موبایل را با ۰۹ وارد کنید')
    return
  }
  const lead = await leads.add({ phone: phone.value, source: 'footer' })
  if (!lead) {
    toast.error('شماره ثبت نشد')
    return
  }
  joined.value = true
  toast.success('شماره ثبت شد. از داشبورد مدیر قابل مشاهده است')
  window.setTimeout(() => {
    joined.value = false
    phone.value = ''
    accepted.value = false
  }, 2400)
}
</script>

<template>
  <footer ref="root" class="im-footer" @pointermove="onPointerMove">
    <div class="im-footer-glow" />
    <div class="im-footer-ember" />
    <div class="im-footer-cursor" />
    <div class="im-footer-noise" />
    <div class="im-footer-grid" />

    <div class="im-footer-inner">
      <div class="im-footer-intro">
        <p class="kicker kicker-latin">IMEN YAB</p>
        <h2 class="section-title text-stone">ایمن یاب</h2>
        <p>
          تجهیزات حفاظت فردی، آتش‌نشانی و صنعتی.
        </p>
      </div>

      <div class="im-footer-links">
        <div v-for="group in shopGroups" :key="group.title" class="im-col">
          <p class="im-col-title">{{ group.title }}</p>
          <nav>
            <router-link v-for="link in group.links" :key="link.label" :to="link.to">
              <span>{{ link.label }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17 7 7 17" />
                <path d="M16 17H7V8" />
              </svg>
            </router-link>
          </nav>
        </div>

        <div class="im-col">
          <p class="im-col-title">تماس</p>
          <nav>
            <a :href="telLink(shopContact.phones[0].raw)">
              <span>{{ shopContact.phones[0].display }}</span>
            </a>
            <span class="im-address">{{ shopContact.address }}</span>
            <span class="im-address">ساعت کاری {{ shopContact.hours }}</span>
          </nav>
        </div>
      </div>

      <div class="im-divider"><span /></div>

      <section class="im-news">
        <div>
          <h3>از موجودی و ارسال باخبر شوید</h3>
        </div>
        <form class="im-form" @submit="submit">
          <div class="im-form-row">
            <label class="im-email">
              <span class="sr-only">شماره تماس</span>
              <input
                v-model="phone"
                type="tel"
                inputmode="numeric"
                autocomplete="tel"
                placeholder="0912xxxxxxx"
                required
              />
            </label>
            <button class="im-join" type="submit" :disabled="joined">
              {{ joined ? 'ثبت شد' : 'ثبت' }}
            </button>
          </div>
          <label class="im-agree">
            <input v-model="accepted" type="checkbox" />
            <span>موافقم گاهی درباره موجودی و ارسال پیام بگیرم.</span>
          </label>
        </form>
      </section>

      <div class="im-bottom">
        <p>© ۱۴۰۵ ایمن یاب. همه حقوق محفوظ است.</p>
        <div class="im-socials">
          <a :href="whatsappLink(productInquiryText())" target="_blank" rel="noopener noreferrer" aria-label="واتساپ">
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
          </a>
          <a :href="baleLink()" target="_blank" rel="noopener noreferrer" aria-label="بله">
            <i class="fa-solid fa-comments" aria-hidden="true"></i>
          </a>
          <a :href="telLink(shopContact.phones[0].raw)" aria-label="تماس">
            <i class="fa-solid fa-phone" aria-hidden="true"></i>
          </a>
        </div>
        <div class="im-legal">
          <router-link to="/contact">حریم خصوصی</router-link>
          <router-link to="/contact">شرایط خرید</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.im-footer {
  --mouse-x: 50%;
  --mouse-y: 50%;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin-top: 4rem;
  color: #f4efe7;
  background:
    radial-gradient(circle at 8% 0%, rgba(196, 92, 38, 0.22), transparent 34%),
    radial-gradient(circle at 92% 100%, rgba(196, 164, 132, 0.16), transparent 38%),
    linear-gradient(180deg, #0c0e12 0%, #12151b 100%);
}

.im-footer-glow,
.im-footer-ember,
.im-footer-cursor,
.im-footer-noise,
.im-footer-grid {
  position: absolute;
  pointer-events: none;
}

.im-footer-glow {
  top: -30%;
  right: -20%;
  z-index: 0;
  width: 55vw;
  height: 55vw;
  border-radius: 50%;
  background: rgba(196, 92, 38, 0.16);
  filter: blur(90px);
}

.im-footer-ember {
  left: -18%;
  bottom: -40%;
  z-index: 0;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  background: rgba(196, 164, 132, 0.12);
  filter: blur(70px);
}

.im-footer-cursor {
  inset: 0;
  z-index: 0;
  background: radial-gradient(340px circle at var(--mouse-x) var(--mouse-y), rgba(196, 92, 38, 0.1), transparent 70%);
}

.im-footer-noise {
  inset: 0;
  z-index: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.im-footer-grid {
  left: -12%;
  right: -12%;
  bottom: -22%;
  z-index: 0;
  height: 42%;
  opacity: 0.18;
  transform: perspective(510px) rotateX(63deg);
  transform-origin: center bottom;
  background-image:
    linear-gradient(rgba(196, 92, 38, 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgba(196, 164, 132, 0.18) 1px, transparent 1px);
  background-size: 55px 42px;
  mask-image: linear-gradient(to bottom, transparent, #000 55%);
}

.im-footer-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1180px;
  margin-inline: auto;
  padding: 56px 1rem 28px;
}

@media (min-width: 640px) {
  .im-footer-inner {
    padding-inline: 1.5rem;
  }
}

.im-footer-intro {
  max-width: 36rem;
  margin-bottom: 42px;
}

.im-footer-intro p:last-child {
  margin-top: 10px;
  color: rgba(244, 239, 231, 0.56);
  font-size: 13px;
  line-height: 1.8;
}

.im-footer-links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(28px, 5vw, 64px);
}

.im-col-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  color: rgba(244, 239, 231, 0.58);
  font-size: 12px;
}

.im-col-title span {
  letter-spacing: 0.28em;
  color: #c4a484;
}

.im-col nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 13px;
}

.im-col nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(244, 239, 231, 0.88);
  font-size: 13px;
  text-decoration: none;
  transition: color 240ms ease, transform 240ms ease;
}

.im-col nav a svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  opacity: 0;
  transform: translate(4px, 4px);
  transition: opacity 240ms ease, transform 240ms ease;
}

.im-col nav a:hover {
  color: #fff;
  transform: translateX(-4px);
}

.im-col nav a:hover svg {
  opacity: 0.9;
  transform: none;
}

.im-address {
  color: rgba(244, 239, 231, 0.55);
  font-size: 13px;
  line-height: 1.8;
}

.im-divider {
  height: 1px;
  margin: 48px 0 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.12);
}

.im-divider span {
  display: block;
  width: 24%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(196, 164, 132, 0.9), transparent);
  animation: imDivider 6s ease-in-out infinite;
}

.im-news {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 40px;
  align-items: center;
  padding: 40px 0;
}

.im-news h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.im-news p {
  margin: 0;
  color: rgba(244, 239, 231, 0.52);
  font-size: 13px;
  line-height: 1.7;
}

.im-form-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  gap: 8px;
}

.im-email {
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
}

.im-email input {
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  color: #fff;
  padding: 0 16px;
  outline: 0;
}

.im-join {
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: #f4efe7;
  color: #0c0e12;
  font-weight: 700;
  cursor: pointer;
}

.im-agree {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: rgba(244, 239, 231, 0.44);
  font-size: 11px;
}

.im-bottom {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  padding-top: 8px;
  color: rgba(244, 239, 231, 0.45);
  font-size: 11px;
}

.im-bottom p {
  margin: 0;
}

.im-socials {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.im-socials a {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: rgba(244, 239, 231, 0.6);
  border: 1px solid transparent;
}

.im-socials a:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.07);
}

.im-legal {
  display: flex;
  justify-content: flex-end;
  gap: 28px;
}

.im-legal a {
  color: inherit;
  text-decoration: none;
}

.im-legal a:hover {
  color: #fff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@keyframes imDivider {
  0%,
  12% {
    transform: translateX(120%);
  }
  58%,
  100% {
    transform: translateX(-510%);
  }
}

@media (max-width: 900px) {
  .im-footer-links,
  .im-news,
  .im-bottom {
    grid-template-columns: 1fr 1fr;
  }

  .im-news {
    gap: 24px;
  }

  .im-bottom {
    justify-items: start;
  }

  .im-legal {
    justify-content: flex-start;
  }
}

@media (max-width: 620px) {
  .im-footer-links {
    grid-template-columns: 1fr 1fr;
    gap: 22px 16px;
  }

  .im-news,
  .im-bottom,
  .im-form-row {
    grid-template-columns: 1fr;
  }

  .im-bottom,
  .im-socials,
  .im-legal {
    justify-content: center;
    text-align: center;
  }

  .im-footer-inner {
    padding-top: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .im-divider span {
    animation: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .im-email {
    background: #171b21;
    backdrop-filter: none;
  }
}
</style>
