<template>
  <div v-if="!hide" class="print:hidden">
    <button
      class="fixed bottom-5 start-5 z-[60] h-14 w-14 rounded-full bg-ember text-white shadow-lift cursor-pointer"
      aria-label="ارتباط با فروشگاه"
      @click="contact.openWidget()"
    >
      تماس
    </button>

    <div
      v-if="contact.open"
      class="fixed inset-0 z-[70] bg-ink/40"
      @click.self="contact.close()"
    >
      <aside
        class="absolute bottom-5 start-5 w-[min(92vw,360px)] max-w-[calc(100%-2.5rem)] rounded-3xl bg-bone text-ink p-5 shadow-lift"
      >
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 class="font-bold text-lg">ارتباط با ایمن یاب</h2>
            <p class="text-sm text-steel mt-1">
              {{
                contact.productTitle
                  ? `مشاوره برای «${contact.productTitle}»`
                  : 'بله، روبیکا، واتساپ یا تماس مستقیم'
              }}
            </p>
          </div>
          <button class="text-sm cursor-pointer" @click="contact.close()">بستن</button>
        </div>

        <div class="flex flex-col gap-2">
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContactStore } from '@/stores/contactStore'
import { baleLink, productInquiryText, rubikaLink, shopContact, telLink, whatsappLink } from '@/data/contact'

const contact = useContactStore()
const route = useRoute()
const hide = computed(() => route.name === 'Invoice' || route.name === 'ContactView')
const message = computed(() => productInquiryText(contact.productTitle))
const whatsappHref = computed(() => whatsappLink(message.value))
const baleHref = computed(() => baleLink())
const rubikaHref = computed(() => rubikaLink())
</script>
