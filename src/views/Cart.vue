<template>
  <section class="cart-page">
    <div class="container-shop cart-page__inner">
      <div v-if="!cart.items.length" class="cart-empty">
        <div class="cart-top cart-top--empty">
          <CheckoutSteps current="cart" />
        </div>
        <div class="cart-empty__icon" aria-hidden="true">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <h1>سبد خرید خالی است</h1>
        <p>کالای ایمنی را از کاتالوگ انتخاب کنید تا تعداد، سایز و پیش‌فاکتور اینجا جمع شود.</p>
        <router-link to="/products" class="cart-empty__cta">شروع خرید از کاتالوگ</router-link>
      </div>

      <div v-else>
        <header class="cart-top">
          <div>
            <h1>سبد خرید</h1>
            <p>{{ cart.totalCount }} قلم کالا در سبد شماست</p>
          </div>
          <CheckoutSteps current="cart" />
        </header>

        <div class="cart-layout">
          <div class="cart-main">
            <article v-for="item in cart.items" :key="item.id + item.size" class="cart-item">
              <router-link
                :to="item.slug ? `/products/${item.slug}` : '/products'"
                class="cart-item__media"
              >
                <img :src="asset(item.image)" :alt="item.title" loading="lazy" decoding="async" />
                <span v-if="item.badge" class="cart-item__badge">{{ item.badge }}</span>
              </router-link>

              <div class="cart-item__body">
                <div class="cart-item__top">
                  <router-link
                    :to="item.slug ? `/products/${item.slug}` : '/products'"
                    class="cart-item__title"
                  >
                    {{ item.title }}
                  </router-link>
                  <span class="cart-item__sku">{{ itemCode(item) }}</span>
                </div>

                <p class="cart-item__meta">
                  <template v-if="item.size">سایز {{ item.size }} <span aria-hidden="true">·</span></template>
                  موجود در انبار فروشگاه
                  <span aria-hidden="true">·</span>
                  واحد {{ formatPrice(item.price) }} تومان
                </p>

                <div class="cart-item__foot">
                  <div class="cart-item__controls">
                    <div class="qty-stepper" role="group" :aria-label="`تعداد ${item.title}`">
                      <button type="button" aria-label="کاهش تعداد" @click="cart.changeQuantity(item.id, item.size, -1)">
                        −
                      </button>
                      <input
                        :value="item.quantity"
                        type="number"
                        min="1"
                        :aria-label="`تعداد ${item.title}`"
                        @change="cart.updateQuantity(item.id, item.size, Number($event.target.value))"
                      />
                      <button type="button" aria-label="افزایش تعداد" @click="cart.changeQuantity(item.id, item.size, 1)">
                        +
                      </button>
                    </div>
                    <button
                      class="remove-btn"
                      type="button"
                      aria-label="حذف از سبد"
                      @click="cart.removeFromCart(item.id, item.size)"
                    >
                      <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                    </button>
                  </div>
                  <strong class="cart-item__total">{{ formatPrice(lineTotal(item)) }} تومان</strong>
                </div>
              </div>
            </article>

            <div class="cart-main__actions">
              <button class="cart-clear" type="button" @click="clearAll">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                خالی کردن کل سبد خرید
              </button>
              <router-link to="/products" class="cart-continue">
                بازگشت و ادامه خرید تجهیزات دیگر
                <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
              </router-link>
            </div>
          </div>

          <aside class="cart-summary">
            <div class="cart-summary__head">
              <h2>خلاصه سفارش</h2>
              <span class="cart-summary__count">{{ cart.totalCount }} قلم کالا</span>
            </div>

            <div class="cart-summary__rows">
              <p>
                <span>جمع ارزش اقلام</span>
                <strong>{{ formatPrice(cart.totalPrice) }} تومان</strong>
              </p>
              <p>
                <span>هزینه حمل و ترخیص</span>
                <em>محاسبه در مرحله بعد</em>
              </p>
            </div>

            <div class="cart-summary__total">
              <span>مبلغ نهایی پرداختی</span>
              <strong>{{ formatPrice(cart.totalPrice) }} تومان</strong>
            </div>

            <p v-if="!auth.isLoggedIn" class="cart-summary__hint">
              برای پیش‌فاکتور و پرداخت، ابتدا وارد حساب شوید یا ثبت‌نام کنید.
            </p>

            <button class="cart-summary__primary" type="button" @click="goSecure('/checkout')">
              ادامه جهت تکمیل سفارش و آدرس
              <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            </button>
            <button class="cart-summary__secondary" type="button" @click="goSecure('/cart/invoice')">
              <i class="fa-solid fa-print" aria-hidden="true"></i>
              دریافت پیش‌فاکتور معتبر و چاپ
            </button>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CheckoutSteps from '@/components/CheckoutSteps.vue'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { asset } from '@/utils/asset'
import { formatPrice, toNumber } from '@/utils/money'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()
const toast = useToast()

function lineTotal(item) {
  return toNumber(item.price) * item.quantity
}

function itemCode(item) {
  const raw = String(item.id || '')
    .replace(/^p-/, '')
    .replace(/-/g, '')
    .toUpperCase()
  return raw.slice(0, 8) || 'ITEM'
}

function clearAll() {
  if (!window.confirm('کل سبد خرید خالی شود؟')) return
  cart.clearCart()
  toast.success('سبد خالی شد')
}

function goSecure(path) {
  if (!auth.isLoggedIn) {
    toast.info('برای ادامه، ابتدا وارد شوید یا ثبت‌نام کنید.')
    router.push({ name: 'Login', query: { redirect: path } })
    return
  }
  if ((path === '/cart/invoice' || path === '/checkout') && !auth.profileComplete) {
    toast.info('برای پیش‌فاکتور و پرداخت، ابتدا اطلاعات حساب را تکمیل کنید.')
    router.push({ name: 'AccountProfile', query: { redirect: path } })
    return
  }
  router.push(path)
}
</script>

<style scoped>
.cart-page {
  background: transparent;
  padding-block: 1.25rem 2.5rem;
  min-height: 60vh;
}

.cart-page__inner {
  display: grid;
  gap: 1.25rem;
}

.cart-empty {
  max-width: 28rem;
  margin-inline: auto;
  padding: 2.5rem 1.5rem;
  border-radius: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  text-align: center;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.cart-empty__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 1rem;
  border-radius: 999px;
  background: #fff7ed;
  color: #ea580c;
  font-size: 1.25rem;
}

.cart-empty h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
}

.cart-empty p {
  margin: 0.65rem 0 1.25rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.8;
}

.cart-empty__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.65rem 1.25rem;
  border-radius: 0.85rem;
  background: #ea580c;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}

.cart-layout {
  display: grid;
  gap: 1rem;
  align-items: start;
}

.cart-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem 1rem;
  margin-bottom: 1rem;
}

.cart-top--empty {
  justify-content: flex-end;
  margin-bottom: 1.25rem;
}

.cart-top h1 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.65rem);
  font-weight: 900;
  color: #0f172a;
}

.cart-top p {
  margin: 0.3rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  gap: 0.85rem;
  margin-bottom: 0.85rem;
  padding: 0.95rem;
  border-radius: 1.15rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}

.cart-item__media {
  position: relative;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.cart-item__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.35rem;
}

.cart-item__badge {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  max-width: calc(100% - 0.5rem);
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 800;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__body {
  min-width: 0;
  display: grid;
  gap: 0.45rem;
}

.cart-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
}

.cart-item__title {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.55;
  text-decoration: none;
}

.cart-item__title:hover {
  color: #ea580c;
}

.cart-item__sku {
  flex-shrink: 0;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #eef4ff;
  color: #475569;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cart-item__meta {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.7;
}

.cart-item__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.cart-item__controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #eef4ff;
  border: 1px solid #dbe7f8;
}

.qty-stepper button,
.qty-stepper input {
  border: 0;
  background: transparent;
  min-height: 2.5rem;
  text-align: center;
  color: #0f172a;
}

.qty-stepper button {
  width: 2.35rem;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 700;
}

.qty-stepper input {
  width: 2.6rem;
  border-inline: 1px solid #dbe7f8;
  font-weight: 800;
  font-size: 0.88rem;
}

.qty-stepper input::-webkit-outer-spin-button,
.qty-stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-stepper input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.remove-btn {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 0.75rem;
  background: rgba(185, 28, 28, 0.08);
  color: #b91c1c;
  cursor: pointer;
}

.remove-btn:hover,
.remove-btn:focus-visible {
  background: rgba(185, 28, 28, 0.14);
}

.cart-item__total {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 900;
  white-space: nowrap;
}

.cart-main__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.cart-clear {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  background: transparent;
  color: #b91c1c;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.cart-continue {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.cart-continue:hover {
  color: #ea580c;
}

.cart-summary {
  padding: 1.2rem;
  border-radius: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  height: fit-content;
}

.cart-summary__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.cart-summary__head h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
  color: #0f172a;
}

.cart-summary__count {
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  background: #eef4ff;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
}

.cart-summary__rows {
  display: grid;
  gap: 0.7rem;
  padding-bottom: 0.95rem;
  border-bottom: 1px dashed #e2e8f0;
}

.cart-summary__rows p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
}

.cart-summary__rows strong {
  color: #0f172a;
  font-weight: 800;
}

.cart-summary__rows em {
  font-style: normal;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
}

.cart-summary__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 1rem 0 1.15rem;
}

.cart-summary__total span {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
}

.cart-summary__total strong {
  color: #ea580c;
  font-size: 1.2rem;
  font-weight: 900;
  white-space: nowrap;
}

.cart-summary__hint {
  margin: 0 0 0.85rem;
  color: #c2410c;
  font-size: 0.78rem;
  line-height: 1.7;
}

.cart-summary__primary,
.cart-summary__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.9rem;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
}

.cart-summary__primary {
  border: 0;
  background: #c2410c;
  color: #fff;
  box-shadow: 0 12px 24px rgba(194, 65, 12, 0.28);
}

.cart-summary__primary:hover {
  background: #9a3412;
}

.cart-summary__secondary {
  margin-top: 0.65rem;
  border: 0;
  background: #e8f1ff;
  color: #1e3a5f;
}

.cart-summary__secondary:hover {
  background: #dbe7f8;
}

@media (min-width: 640px) {
  .cart-item {
    grid-template-columns: 6.5rem minmax(0, 1fr);
    gap: 1rem;
    padding: 1.1rem;
  }

  .cart-item__title {
    font-size: 1rem;
  }
}

@media (min-width: 900px) {
  .cart-page {
    padding-block: 1.75rem 3rem;
  }

  .cart-layout {
    grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.72fr);
    align-items: start;
    gap: 1.25rem;
  }

  .cart-summary {
    position: sticky;
    top: 6.5rem;
    padding: 1.35rem;
  }
}
</style>
