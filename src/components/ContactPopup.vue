<template>
  <Teleport to="body">
    <div v-if="props.enabled && !hide" class="shop-contact-fab">
      <button
        class="shop-contact-fab__btn"
        type="button"
        aria-label="تماس با فروشگاه"
        @click="contact.openWidget()"
      >
        <i class="fa-solid fa-phone" aria-hidden="true"></i>
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
            <button type="button" @click="contact.close()">بستن</button>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contactStore'
import { baleLink, productInquiryText, rubikaLink, shopContact, telLink, whatsappLink } from '@/data/contact'

const props = defineProps({
  enabled: { type: Boolean, default: true },
})

const contact = useContactStore()
const route = useRoute()
const hide = computed(() =>
  ['Invoice', 'ContactView', 'CartInvoice', 'Cart', 'Checkout', 'OrderStatus'].includes(route.name),
)
const message = computed(() => productInquiryText(contact.productTitle))
const whatsappHref = computed(() => whatsappLink(message.value))
const baleHref = computed(() => baleLink())
const rubikaHref = computed(() => rubikaLink())
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
  /* physical bottom-left in LTR coords = visible corner opposite dock in RTL pages */
  left: 1rem !important;
  right: auto !important;
  bottom: 1.25rem !important;
  z-index: 2147483001 !important;
  display: grid !important;
  place-items: center;
  width: 3.35rem !important;
  height: 3.35rem !important;
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
}

@media (max-width: 1023px) {
  .shop-contact-fab__btn {
    bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px)) !important;
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
  left: 1rem;
  right: auto;
  bottom: 1.25rem;
  width: min(92vw, 360px);
  max-width: calc(100% - 2.5rem);
  border-radius: 1.5rem;
  background: #fbfaf7;
  color: #1c1916;
  padding: 1.25rem;
  box-shadow: 0 16px 40px rgba(12, 14, 18, 0.2);
}

@media (max-width: 1023px) {
  .shop-contact-fab__panel {
    bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
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

.shop-contact-fab__head button {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  color: inherit;
}

.shop-contact-fab__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media print {
  .shop-contact-fab {
    display: none !important;
  }
}
</style>
