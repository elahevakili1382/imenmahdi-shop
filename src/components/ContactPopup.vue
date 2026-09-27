<template>
  <Teleport to="body">
    <div v-if="props.enabled && !hide" class="shop-contact-fab">
      <button
        class="shop-contact-fab__btn"
        :class="{ 'is-expanded': expanded }"
        type="button"
        :aria-label="expanded ? consultLabel : 'تماس با فروشگاه'"
        @click="contact.openWidget()"
      >
        <i class="fa-solid fa-phone" aria-hidden="true"></i>
        <span class="shop-contact-fab__label">{{ consultLabel }}</span>
      </button>

      <div v-if="contact.open" class="shop-contact-fab__overlay" @click.self="contact.close()">
        <aside class="shop-contact-fab__panel">
          <div class="shop-contact-fab__head">
            <div>
              <h2>ارتباط با ایمن یاب</h2>
              <p>
                {{
                  contact.productTitle
                    ? `مشاوره برای «${contact.productTitle}»`
                    : 'بله، روبیکا، واتساپ یا تماس مستقیم'
                }}
              </p>
            </div>
            <button class="shop-contact-fab__close" type="button" @click="contact.close()">بستن</button>
          </div>

          <div class="shop-contact-fab__actions">
            <a :href="baleHref" target="_blank" rel="noopener noreferrer" class="btn btn-dark w-full">
              پیام در بله
            </a>
            <a :href="rubikaHref" target="_blank" rel="noopener noreferrer" class="btn btn-ghost w-full">
              پیام در روبیکا
            </a>
            <a :href="whatsappHref" target="_blank" rel="noopener noreferrer" class="btn btn-primary w-full">
              پیام در واتساپ
            </a>
            <a
              v-for="phone in shopContact.phones"
              :key="phone.raw"
              :href="telLink(phone.raw)"
              class="btn btn-ghost w-full"
            >
              {{ phone.label }} · {{ phone.display }}
            </a>
          </div>
        </aside>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contactStore'
import { baleLink, productInquiryText, rubikaLink, shopContact, telLink, whatsappLink } from '@/data/contact'

const props = defineProps({
  enabled: { type: Boolean, default: true },
})

const consultLabel = 'جهت مشاوره، همین حالا تماس بگیرید'
const contact = useContactStore()
const route = useRoute()
const hide = computed(() =>
  ['Invoice', 'ContactView', 'CartInvoice', 'Cart', 'Checkout', 'OrderStatus', 'ProductDetail', 'Terms', 'Privacy'].includes(
    route.name,
  ),
)
const message = computed(() => productInquiryText(contact.productTitle))
const whatsappHref = computed(() => whatsappLink(message.value))
const baleHref = computed(() => baleLink())
const rubikaHref = computed(() => rubikaLink())
const expanded = ref(false)

let idleTimer
let ticking = false

function collapseSoon() {
  window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    expanded.value = false
  }, 2200)
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    if (contact.open) return
    if (window.scrollY < 40) {
      expanded.value = false
      return
    }
    expanded.value = true
    collapseSoon()
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.clearTimeout(idleTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style>
.shop-contact-fab {
  pointer-events: none;
}

.shop-contact-fab__btn,
.shop-contact-fab__overlay {
  pointer-events: auto;
}

.shop-contact-fab__btn {
  position: fixed !important;
  inset-inline-end: 1rem !important;
  inset-inline-start: auto !important;
  bottom: 1.25rem !important;
  z-index: 2147483001 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 3.35rem !important;
  max-width: 3.35rem;
  height: 3.35rem !important;
  padding: 0 !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 999px !important;
  background: #c45c26 !important;
  color: #fff !important;
  box-shadow: 0 10px 28px rgba(12, 14, 18, 0.28) !important;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  visibility: visible !important;
  opacity: 1 !important;
  animation: shop-fab-pop 420ms cubic-bezier(0.2, 0, 0, 1);
  transition:
    max-width 320ms cubic-bezier(0.2, 0, 0, 1),
    padding 320ms cubic-bezier(0.2, 0, 0, 1),
    gap 320ms cubic-bezier(0.2, 0, 0, 1),
    transform 220ms cubic-bezier(0.2, 0, 0, 1);
}

.shop-contact-fab__btn.is-expanded {
  max-width: min(92vw, 22rem);
  padding-inline: 0.9rem 1.1rem !important;
  gap: 0.55rem;
}

.shop-contact-fab__label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  transition:
    max-width 320ms cubic-bezier(0.2, 0, 0, 1),
    opacity 220ms ease;
}

.shop-contact-fab__btn.is-expanded .shop-contact-fab__label {
  max-width: 16.5rem;
  opacity: 1;
}

@keyframes shop-fab-pop {
  from {
    transform: scale(0.62);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 1023px) {
  .shop-contact-fab__btn {
    bottom: calc(6rem + env(safe-area-inset-bottom, 0px)) !important;
  }
}

.shop-contact-fab__overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483002;
  background: rgba(28, 25, 22, 0.4);
}

.shop-contact-fab__panel {
  position: absolute;
  inset-inline-end: 1rem;
  inset-inline-start: auto;
  bottom: 1.25rem;
  width: min(92vw, 360px);
  max-width: calc(100% - 2.5rem);
  border-radius: 1.5rem;
  background: #fbfaf7;
  color: #1c1916;
  padding: 1.25rem;
  box-shadow: 0 16px 40px rgba(12, 14, 18, 0.2);
  animation: shop-fab-pop 280ms cubic-bezier(0.2, 0, 0, 1);
}

@media (max-width: 1023px) {
  .shop-contact-fab__panel {
    bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  }
}

.shop-contact-fab__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.shop-contact-fab__head h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.shop-contact-fab__head p {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: #6b6560;
  line-height: 1.6;
}

.shop-contact-fab__close {
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-sand, #e8e0d4);
  cursor: pointer;
  font-size: 0.85rem;
  color: inherit;
}

.shop-contact-fab__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (prefers-reduced-motion: reduce) {
  .shop-contact-fab__btn,
  .shop-contact-fab__panel,
  .shop-contact-fab__label {
    animation: none;
    transition: none;
  }
}

@media print {
  .shop-contact-fab {
    display: none !important;
  }
}
</style>
