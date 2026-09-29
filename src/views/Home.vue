<template>
  <div class="home-stitch">
    <HeroCinematic />

    <section class="benefit-bar" aria-label="مزایای خرید از ایمن یاب">
      <div class="container-shop benefit-bar__grid">
        <div v-for="item in trustPoints" :key="item.title" class="benefit-bar__item">
          <span class="benefit-bar__icon" aria-hidden="true"><i :class="item.icon"></i></span>
          <div>
            <p>{{ item.title }}</p>
            <small>{{ item.text }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="cat-section section-block">
      <div class="container-shop">
        <div class="section-head cat-section__head">
          <div>
            <h2 class="cat-section__title">
              <span class="cat-section__bullet" aria-hidden="true"></span>
              <span class="cat-section__title-sm">دسته‌بندی‌های تخصصی</span>
              <span class="cat-section__title-lg">دسته‌بندی‌های تخصصی تجهیزات ایمنی</span>
            </h2>
            <p class="cat-section__lead">
              انتخاب شاخص ملزومات مورد نیاز پروژه‌ها با بالاترین گواهینامه‌های حفاظتی روز
            </p>
          </div>
          <router-link to="/products" class="section-link">
            <span class="section-link__short">مشاهده همه</span>
            <span class="section-link__full">مشاهده کلیه دسته‌ها و مدل‌ها</span>
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </router-link>
        </div>
        <div class="spec-cat-grid">
          <router-link
            v-for="card in specialtyCategories"
            :key="card.slug"
            :to="card.to"
            class="spec-cat"
          >
            <div class="spec-cat__media">
              <span class="spec-cat__badge">{{ formatCount(card.count) }} کالا</span>
              <img :src="asset(card.image)" :alt="card.title" loading="lazy" decoding="async" />
            </div>
            <div class="spec-cat__info">
              <div class="spec-cat__meta">
                <span class="spec-cat__label">{{ card.label }}</span>
                <span class="spec-cat__pill">{{ formatCount(card.count) }} کالا</span>
              </div>
              <h3>
                <span class="spec-cat__title-sm">{{ card.shortTitle || card.title }}</span>
                <span class="spec-cat__title-lg">{{ card.title }}</span>
              </h3>
              <p>{{ card.desc }}</p>
            </div>
            <span class="spec-cat__cta">
              <span class="spec-cat__cta-text">{{ card.cta }}</span>
              <span class="spec-cat__cta-icon" aria-hidden="true">
                <i class="fa-solid fa-chevron-left"></i>
              </span>
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="container-shop section-block">
      <div class="wholesale-banner" aria-label="فروش عمده و همکاری پروژه‌ای">
        <div class="wholesale-banner__top">
          <div class="wholesale-banner__copy">
            <p class="wholesale-banner__badge">
              <i class="fa-solid fa-store" aria-hidden="true"></i>
              B2B WHOLESALE &amp; PARTNER PRICING
            </p>
            <h2>مرکز تأمین عمده، استعلام قیمت همکاری و عاملیت پروژه‌ها</h2>
            <p>
              تأمین مستقیم تجهیزات ایمنی، آتش‌نشانی و حفاظت فردی ویژه همکاران، پروژه‌های عمرانی، نفت و گاز با قیمت کارخانه و پیش‌فاکتور معتبر.
            </p>
          </div>
          <div class="wholesale-banner__actions">
            <router-link to="/contact" class="wholesale-banner__rfq">
              <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
              استعلام فوری قیمت همکاری (RFQ)
            </router-link>
            <a href="tel:09106419678" class="wholesale-banner__phone">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
              <span>واحد فروش عمده: ۰۹۱۰۶۴۱۹۶۷۸</span>
            </a>
          </div>
        </div>

        <div class="wholesale-banner__features">
          <article class="wholesale-feature">
            <span class="wholesale-feature__icon is-orange" aria-hidden="true">
              <i class="fa-solid fa-clipboard-list"></i>
            </span>
            <div>
              <h3>تخفیف پلکانی تیراژ</h3>
              <p>نرخ‌گذاری رقابتی کارتنی و پالتی با بالاترین حاشیه سود ویژه فروشندگان و انبارداران استانی.</p>
            </div>
          </article>
          <article class="wholesale-feature">
            <span class="wholesale-feature__icon is-blue" aria-hidden="true">
              <i class="fa-solid fa-file-invoice"></i>
            </span>
            <div>
              <h3>پیش‌فاکتور معتبر در کمتر از ۲ ساعت</h3>
              <p>محاسبه شفاف قیمت، درج مشخصات کالا و آماده‌سازی سریع سفارش برای همکاران و پروژه‌ها.</p>
            </div>
          </article>
          <article class="wholesale-feature">
            <span class="wholesale-feature__icon is-green" aria-hidden="true">
              <i class="fa-solid fa-truck-fast"></i>
            </span>
            <div>
              <h3>ارسال مستقیم با بارنامه معتبر</h3>
              <p>ارسال سریع روزانه از انبار مرکزی تهران با باربری، اتوبوسرانی و کانتینری به تمام نقاط کشور.</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="container-shop section-block">
      <div class="section-head">
        <div>
          <p class="section-kicker">پرتقاضا</p>
          <h2>تجهیزات برگزیده فروشگاه</h2>
        </div>
        <router-link to="/products" class="section-link">مشاهده همه</router-link>
      </div>
      <ProductRail :products="featuredRail" />
    </section>

    <section v-if="latestList.length" class="latest-section section-block">
      <div class="container-shop">
        <div class="latest-panel">
          <div class="section-head latest-panel__head">
            <div>
              <p class="section-kicker latest-panel__kicker">
                <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                2h FAST
              </p>
              <h2>ارسال فوری انبار مرکزی تهران</h2>
              <p class="latest-panel__lead">آماده ارسال با پیک موتوری زیر ۲ ساعت در پایتخت</p>
            </div>
            <router-link to="/products" class="section-link">
              <span class="section-link__short">لیست کامل ←</span>
              <span class="section-link__full">لیست کامل محصولات جدید ←</span>
            </router-link>
          </div>

          <div class="latest-rail">
            <Swiper
              class="latest-swiper"
              dir="rtl"
              :modules="latestModules"
              :slides-per-view="1.5"
              :space-between="10"
              :breakpoints="latestBreakpoints"
              :free-mode="{ enabled: true, sticky: true }"
              grab-cursor
            >
              <SwiperSlide v-for="(column, index) in latestColumns" :key="`col-${index}`" class="latest-slide">
                <div class="latest-col">
                  <router-link
                    v-for="product in column"
                    :key="product.id"
                    :to="`/products/${product.slug}`"
                    class="latest-card"
                    :class="{ 'latest-card--out': isOutOfStock(product) }"
                  >
                    <img :src="asset(product.image)" :alt="product.title" loading="lazy" decoding="async" />
                    <span class="latest-card__copy">
                      <h3 :title="product.title">{{ product.title }}</h3>
                      <strong>{{ displayPrice(product) }}</strong>
                      <small
                        class="latest-card__stock"
                        :class="isOutOfStock(product) ? 'latest-card__stock--out' : 'latest-card__stock--in'"
                      >
                        {{ stockLabel(product) }}
                      </small>
                    </span>
                  </router-link>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </section>

    <LookbookGrid />

    <section class="container-shop section-block">
      <div class="trust-banner" aria-label="خدمات سازمانی ایمن یاب">
        <div class="trust-banner__copy">
          <p class="trust-banner__eyebrow">تعهد ایمن‌یاب به کیفیت و سرعت تحویل کالا</p>
          <h2>ارسال سریع، اصالت رسمی و صدور پیش‌فاکتور معتبر</h2>
          <p>
            فروش عمده و سازمانی داریم؛ برای پیش‌فاکتور رسمی و پیگیری تا تحویل، از طریق ایمن یاب هماهنگ کنید.
          </p>
          <div class="trust-banner__features">
            <div>
              <i class="fa-solid fa-truck-fast" aria-hidden="true"></i>
              <span>ارسال اکسپرس پایتخت و کشور</span>
            </div>
            <div>
              <i class="fa-solid fa-certificate" aria-hidden="true"></i>
              <span>تضمین قطعی اصالت برندها</span>
            </div>
            <div>
              <i class="fa-solid fa-file-invoice" aria-hidden="true"></i>
              <span>فاکتور رسمی شرکتی</span>
            </div>
            <div>
              <i class="fa-solid fa-building-shield" aria-hidden="true"></i>
              <span>استاندارد وزارت کار و HSE</span>
            </div>
          </div>
          <div class="trust-banner__actions">
            <router-link to="/contact" class="trust-banner__rfq">
              <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
              ثبت درخواست پیش فاکتور معتبر
            </router-link>
            <a href="tel:09106419678" class="trust-banner__call">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
              تماس با کارشناس فروش عمده
            </a>
          </div>
        </div>

        <aside class="trust-banner__passport">
          <p class="trust-banner__passport-title">شناسنامه کیفیت و سلامت کالا</p>
          <div class="trust-banner__score">
            <strong>۹۹٫۰۸٪</strong>
            <span class="trust-banner__seal" aria-hidden="true">
              <i class="fa-solid fa-check"></i>
            </span>
          </div>
          <p class="trust-banner__score-label">سلامت و اصالت اقلام کنترل‌شده</p>
          <div class="trust-banner__sheet">
            <div><span>استاندارد کالا</span><b>EN 397</b></div>
            <div><span>اصالت کالا</span><b>CE / ANSI</b></div>
            <div><span>کنترل پیش از ارسال</span><b>فعال</b></div>
          </div>
          <p class="trust-banner__foot">
            <i class="fa-solid fa-shield" aria-hidden="true"></i>
            پوشش اطمینان کیفیت تا زمان تحویل به پروژه
          </p>
        </aside>
      </div>
    </section>

    <BrandSlider />

    <section v-if="approvedReviews.length" class="container-shop section-block">
      <div class="section-head">
        <div>
          <p class="section-kicker">اعتماد</p>
          <h2>نظر خریداران</h2>
        </div>
      </div>
      <div class="review-grid">
        <article v-for="review in approvedReviews" :key="review.id" class="review-card">
          <div class="review-card__top">
            <span>{{ review.name.slice(0, 1) }}</span>
            <div>
              <h3>{{ review.name }}</h3>
              <p>خریدار تاییدشده</p>
            </div>
          </div>
          <p class="review-card__stars" :aria-label="`امتیاز ${review.rating} از ۵`">
            <i
              v-for="star in 5"
              :key="star"
              :class="star <= review.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'"
              aria-hidden="true"
            ></i>
          </p>
          <p class="review-card__text">{{ review.text }}</p>
          <p class="review-card__meta">خرید {{ review.product }} · {{ review.city }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode } from 'swiper/modules'
import HeroCinematic from '@/components/HeroCinematic.vue'
import ProductRail from '@/components/ProductRail.vue'
import LookbookGrid from '@/components/LookbookGrid.vue'
import BrandSlider from '@/components/BrandSlider.vue'
import { useProductStore } from '@/stores/productStore'
import { useReviewStore } from '@/stores/reviewStore'
import { asset } from '@/utils/asset'
import { displayPrice } from '@/utils/money'
import { isOutOfStock } from '@/utils/stock'
import 'swiper/css'
import 'swiper/css/free-mode'

const products = useProductStore()
const reviews = useReviewStore()
const latestModules = [FreeMode]
const latestBreakpoints = {
  640: { slidesPerView: 3, spaceBetween: 12 },
  1024: { slidesPerView: 4, spaceBetween: 12 },
}

const categoryCards = computed(() =>
  products.categories.slice(0, 6).map((group) => {
    const items = products.products.filter((item) => item.category === group.name && item.image)
    return {
      ...group,
      count: items.length,
      image: group.image || items[0]?.image || '',
    }
  }),
)

const specialtyBlueprints = [
  {
    name: 'تجهیزات حفاظت فردی',
    label: 'CATEGORY 01',
    title: 'تجهیزات حفاظت فردی (PPE)',
    shortTitle: 'حفاظت فردی (PPE)',
    desc: 'کلاه ایمنی، شیلد محافظ صورت، عینک و گوشی کار',
    image: 'images/lookbook/stitch-ppe-helmet.jpg',
    cta: 'بررسی مدل‌ها و استاندارد EN 397',
  },
  {
    name: 'تجهیزات تنفسی',
    label: 'CATEGORY 02',
    title: 'تجهیزات حفاظت تنفسی',
    shortTitle: 'حفاظت تنفسی',
    desc: 'ماسک تمام‌صورت، نیمه‌صورت و فیلترهای چندگانه',
    image: 'images/lookbook/stitch-respirator.jpg',
    cta: 'مشاهده فیلترهای P3 و چندگانه گاز',
  },
  {
    name: 'تجهیزات آتش نشانی',
    label: 'CATEGORY 03',
    title: 'تجهیزات و البسه آتش‌نشانی',
    shortTitle: 'البسه آتش‌نشانی',
    desc: 'لباس عملیاتی، چکمه و تجهیزات ایستگاهی',
    image: 'images/lookbook/stitch-fire-gear.jpg',
    cta: 'بررسی تأییدیه‌های NFPA و آتش‌نشانی',
  },
  {
    name: 'تجهیزات کار در ارتفاع',
    label: 'CATEGORY 04',
    title: 'تجهیزات ایمنی کار در ارتفاع',
    shortTitle: 'کار در ارتفاع',
    desc: 'هارنس، لنیارد، کارابین و سیستم ضد سقوط',
    image: 'images/lookbook/stitch-height.jpg',
    cta: 'مشاهده استانداردهای EN 361 و EN 358',
  },
  {
    name: 'تجهیزات ترافیکی',
    label: 'CATEGORY 05',
    title: 'تجهیزات کنترل و ایمنی ترافیک',
    shortTitle: 'ایمنی ترافیک',
    desc: 'مخروط، مانع، چراغ هشدار و تابلو کارگاهی',
    image: 'images/lookbook/stitch-traffic.jpg',
    cta: 'سفارش عمده راه‌بندان و کارگاهی',
  },
  {
    name: 'البسه فرم',
    label: 'CATEGORY 06',
    title: 'البسه کارگاهی و کفش ایمنی',
    shortTitle: 'البسه و کفش',
    desc: 'یونیفرم صنعتی، کفش و پوتین مقاوم',
    image: 'images/lookbook/stitch-uniform.jpg',
    cta: 'تست مقاومت ۵۰۰ ژول و ضدبرش',
  },
]

const specialtyCategories = computed(() =>
  specialtyBlueprints.map((card, index) => {
    const group = products.categories.find((item) => item.name === card.name) || categoryCards.value[index]
    const count = group
      ? products.products.filter((item) => item.category === group.name).length
      : 0
    return {
      ...card,
      slug: group?.slug || card.name,
      count,
      to: group ? `/products/category/${group.slug}` : '/products',
    }
  }),
)

function formatCount(value) {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function stockLabel(product) {
  return isOutOfStock(product) ? 'ناموجود' : 'موجود در انبار فروشگاه'
}

function hasImage(product) {
  return Boolean(product?.image)
}

function byNewest(a, b) {
  const ta = Date.parse(a.createdAt || '') || Number(String(a.id || '').replace(/\D/g, '')) || 0
  const tb = Date.parse(b.createdAt || '') || Number(String(b.id || '').replace(/\D/g, '')) || 0
  return tb - ta
}

function shuffle(list) {
  const items = [...list]
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

/** محصولات واقعی استور — ترتیب رندوم برای نمایش برگزیده */
const featuredRail = computed(() => {
  const list = products.products.filter(hasImage)
  const preferred = list.filter((item) => item.featured || item.popular)
  const base = preferred.length ? preferred : list
  return shuffle(base).slice(0, 12)
})

const latestList = computed(() =>
  [...products.products.filter(hasImage)].sort(byNewest).slice(0, 8),
)

/** هر اسلاید = یک ستون با ۲ کارت → موبایل ۲ ردیف × ۱٫۵ ستون */
const latestColumns = computed(() => {
  const columns = []
  const list = latestList.value
  for (let i = 0; i < list.length; i += 2) {
    columns.push(list.slice(i, i + 2))
  }
  return columns
})

const approvedReviews = computed(() => reviews.approved.slice(0, 3))

const trustPoints = [
  { icon: 'fa-solid fa-truck-fast', title: 'ارسال اکسپرس کشوری', text: 'تهران، کارخانه و شهرستان' },
  { icon: 'fa-solid fa-certificate', title: 'اصالت و استاندارد معتبر', text: 'EN · CE · ANSI' },
  { icon: 'fa-solid fa-file-invoice', title: 'فاکتور رسمی شرکتی', text: 'صدور پیش‌فاکتور معتبر' },
  { icon: 'fa-solid fa-headset', title: 'مشاوره تخصصی مهندسی', text: 'راهنمایی HSE قبل از سفارش' },
]
</script>

<style scoped>
.home-stitch {
  background: #f8fafc;
  color: #0f172a;
}

.section-block {
  padding-block: 1.75rem;
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem 0.85rem;
  margin-bottom: 1rem;
}

.section-head > div {
  min-width: 0;
  flex: 1 1 12rem;
}

.section-kicker {
  margin: 0 0 0.35rem;
  color: #ea580c;
  font-size: 0.72rem;
  font-weight: 800;
}

.section-kicker.is-light {
  color: #fdba74;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(1.05rem, 4.2vw, 1.7rem);
  font-weight: 900;
  line-height: 1.45;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.25rem;
  color: #ea580c;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.section-link__full {
  display: none;
}

.benefit-bar {
  border-block: 1px solid #e2e8f0;
  background: #fff;
}

.benefit-bar__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding-block: 1rem;
}

.benefit-bar__item {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
}

.benefit-bar__icon {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.8rem;
  background: #fff7ed;
  color: #ea580c;
}

.benefit-bar__item p {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 800;
}

.benefit-bar__item small {
  display: block;
  margin-top: 0.15rem;
  color: #64748b;
  font-size: 0.72rem;
}

.cat-section {
  background: #fff;
}

.cat-section__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.cat-section__bullet {
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: #ea580c;
}

.cat-section__title-lg {
  display: none;
}

.cat-section__lead {
  display: none;
  margin: 0.45rem 0 0;
  max-width: 36rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.8;
}

.wholesale-banner {
  display: grid;
  gap: 1.15rem;
  padding: 1.35rem 1.2rem 1.25rem;
  border-radius: 1.5rem;
  background: linear-gradient(145deg, #0b1220 0%, #111827 55%, #0f172a 100%);
  color: #f8fafc;
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.28);
}

.wholesale-banner__top {
  display: grid;
  gap: 1.1rem;
}

.wholesale-banner__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.wholesale-banner__badge i {
  font-size: 0.72rem;
}

.wholesale-banner__copy h2 {
  margin: 0;
  font-size: clamp(1.05rem, 3.6vw, 1.55rem);
  font-weight: 900;
  line-height: 1.55;
}

.wholesale-banner__copy > p:last-child {
  margin: 0.7rem 0 0;
  color: rgba(226, 232, 240, 0.78);
  font-size: 0.82rem;
  line-height: 1.85;
  max-width: 46rem;
}

.wholesale-banner__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.wholesale-banner__rfq {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.85rem;
  padding: 0.7rem 1.15rem;
  border-radius: 0.85rem;
  background: #ea580c;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 12px 28px rgba(234, 88, 12, 0.32);
  transition: background 160ms ease;
}

.wholesale-banner__rfq:hover {
  background: #c2410c;
}

.wholesale-banner__phone {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.85rem;
  padding: 0.55rem 0.9rem;
  border-radius: 0.85rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.wholesale-banner__phone i {
  color: #fb923c;
}

.wholesale-banner__features {
  display: grid;
  gap: 0.75rem;
}

.wholesale-feature {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.95rem 0.9rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.wholesale-feature__icon {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  flex-shrink: 0;
  border-radius: 0.7rem;
  font-size: 0.95rem;
}

.wholesale-feature__icon.is-orange {
  background: rgba(234, 88, 12, 0.18);
  color: #fb923c;
}

.wholesale-feature__icon.is-blue {
  background: rgba(59, 130, 246, 0.18);
  color: #60a5fa;
}

.wholesale-feature__icon.is-green {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
}

.wholesale-feature h3 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.45;
}

.wholesale-feature p {
  margin: 0.35rem 0 0;
  color: rgba(203, 213, 225, 0.82);
  font-size: 0.74rem;
  line-height: 1.7;
}

.spec-cat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.spec-cat {
  display: grid;
  grid-template-rows: auto auto;
  min-width: 0;
  overflow: hidden;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  text-decoration: none;
  color: inherit;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.spec-cat:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.spec-cat__media {
  position: relative;
  display: block;
  margin: 0.55rem 0.55rem 0;
  aspect-ratio: 3 / 2;
  border-radius: 0.75rem;
  border: 1px solid #e0e0e0;
  background: #f3f4f6;
  overflow: hidden;
}

.spec-cat__badge {
  position: absolute;
  top: 0.45rem;
  inset-inline-start: 0.45rem;
  z-index: 1;
  padding: 0.18rem 0.45rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  font-size: 0.62rem;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.spec-cat__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.spec-cat__info {
  display: contents;
}

.spec-cat__meta,
.spec-cat__label,
.spec-cat__pill,
.spec-cat__info p {
  display: none;
}

.spec-cat__info h3 {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  padding: 0.55rem 0.55rem 0.55rem 0;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
  color: #0f172a;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.spec-cat__title-lg {
  display: none;
}

.spec-cat__cta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  padding: 0 0.55rem 0.55rem;
}

.spec-cat__cta-text {
  display: none;
}

.spec-cat__cta-icon {
  display: grid;
  place-items: center;
  width: 1.15rem;
  height: 1.15rem;
  margin-inline-start: auto;
  color: #94a3b8;
  font-size: 0.65rem;
  background: transparent;
}

/* Mobile card: image on top, title+chevron as footer row */
@media (max-width: 639.98px) {
  .cat-section__head {
    align-items: center;
    margin-bottom: 0.85rem;
  }

  .spec-cat {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }

  .spec-cat__media {
    grid-column: 1 / -1;
  }

  .spec-cat__info h3 {
    grid-column: 1;
    align-self: center;
    padding-block: 0.6rem;
    padding-inline: 0.6rem 0.2rem;
  }

  .spec-cat__cta {
    grid-column: 2;
    align-self: center;
    padding: 0 0.55rem 0 0;
  }
}

.latest-section {
  background: transparent;
}

.latest-panel {
  padding: 0.95rem 0.85rem 1rem;
  border-radius: 1.15rem;
  background: linear-gradient(180deg, #eef6ff 0%, #f7fbff 55%, #ffffff 100%);
  border: 1px solid #dbe7f5;
}

.latest-panel__kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.latest-panel__kicker i {
  color: #ea580c;
}

.latest-panel__lead {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.6;
}

.latest-rail {
  min-width: 0;
  margin-inline: -0.1rem;
}

.latest-swiper {
  overflow: hidden;
  padding-bottom: 0.15rem;
}

.latest-slide {
  height: auto;
}

.latest-col {
  display: grid;
  gap: 0.65rem;
  height: 100%;
}

.latest-card {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  min-width: 0;
  min-height: 5.1rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.95rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  text-decoration: none;
  color: inherit;
}

.latest-card--out {
  filter: grayscale(1);
  opacity: 0.72;
  background: #e8e8e8;
}

.latest-card img {
  width: 4.25rem;
  height: 4.25rem;
  object-fit: cover;
  border-radius: 0.7rem;
  background: #f8fafc;
  flex-shrink: 0;
}

.latest-card__stock--in {
  color: #047857;
  font-weight: 700;
}

.latest-card__stock--out {
  color: #6b7280;
  font-weight: 700;
}

.latest-card__copy {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 0.18rem;
  align-content: center;
}

.latest-card h3 {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.4;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.latest-card strong {
  display: block;
  font-size: 0.82rem;
  color: #ea580c;
}

.latest-card small {
  display: block;
  color: #64748b;
  font-size: 0.68rem;
  line-height: 1.4;
}

.trust-banner {
  display: grid;
  gap: 1.25rem;
  padding: 1.4rem;
  border-radius: 1.6rem;
  background: linear-gradient(145deg, #0b1220 0%, #172554 48%, #0f172a 100%);
  color: #f8fafc;
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.24);
}

.trust-banner__eyebrow {
  margin: 0 0 0.55rem;
  color: #fb923c;
  font-size: 0.78rem;
  font-weight: 800;
}

.trust-banner__copy h2 {
  margin: 0;
  font-size: clamp(1.25rem, 2.5vw, 1.8rem);
  font-weight: 900;
  line-height: 1.5;
}

.trust-banner__copy > p {
  margin: 0.85rem 0 0;
  max-width: 36rem;
  color: rgba(248, 250, 252, 0.74);
  font-size: 0.9rem;
  line-height: 1.85;
}

.trust-banner__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.95rem 1rem;
  margin-top: 1.25rem;
}

.trust-banner__features div {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.55;
}

.trust-banner__features i {
  margin-top: 0.12rem;
  flex-shrink: 0;
  color: #fb923c;
}

.trust-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1.35rem;
}

.trust-banner__rfq {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.9rem;
  padding: 0.55rem 1.05rem;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.2s ease;
}

.trust-banner__rfq:hover {
  background: #c2410c;
}

.trust-banner__call {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.9rem;
  color: #fff;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
}

.trust-banner__passport {
  display: grid;
  align-content: start;
  padding: 1.2rem;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.trust-banner__passport-title {
  margin: 0;
  color: #fdba74;
  font-size: 0.82rem;
  font-weight: 800;
}

.trust-banner__score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.55rem;
}

.trust-banner__score strong {
  font-size: 2.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
}

.trust-banner__seal {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #fdba74, #ea580c);
  color: #0f172a;
  font-size: 1.05rem;
  box-shadow: 0 8px 18px rgba(234, 88, 12, 0.35);
}

.trust-banner__score-label {
  margin: 0.45rem 0 0;
  color: rgba(248, 250, 252, 0.62);
  font-size: 0.78rem;
}

.trust-banner__sheet {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.95rem;
  padding: 0.9rem;
  border-radius: 0.95rem;
  background: rgba(15, 23, 42, 0.48);
}

.trust-banner__sheet div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.trust-banner__sheet span {
  color: rgba(248, 250, 252, 0.65);
}

.trust-banner__sheet b {
  font-weight: 800;
}

.trust-banner__foot {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin: 0.95rem 0 0;
  color: rgba(248, 250, 252, 0.78);
  font-size: 0.78rem;
  line-height: 1.6;
}

.trust-banner__foot i {
  margin-top: 0.15rem;
  flex-shrink: 0;
  color: #fb923c;
}

.review-grid {
  display: grid;
  gap: 0.85rem;
}

.review-card {
  padding: 1.1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.review-card__top {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin-bottom: 0.7rem;
}

.review-card__top > span {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  background: #fff7ed;
  color: #ea580c;
  font-weight: 900;
}

.review-card__top h3 {
  margin: 0;
  font-size: 0.9rem;
}

.review-card__top p {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.72rem;
}

.review-card__stars {
  margin: 0 0 0.55rem;
  color: #ea580c;
  font-size: 0.75rem;
}

.review-card__text {
  margin: 0;
  color: #475569;
  font-size: 0.86rem;
  line-height: 1.8;
}

.review-card__meta {
  margin: 0.7rem 0 0;
  color: #94a3b8;
  font-size: 0.72rem;
}

@media (min-width: 640px) {
  .section-block {
    padding-block: 2.4rem;
  }

  .section-head {
    align-items: flex-end;
    margin-bottom: 1.25rem;
  }

  .section-head h2 {
    font-size: clamp(1.25rem, 2.4vw, 1.7rem);
  }

  .section-link {
    font-size: 0.875rem;
  }

  .section-link__short {
    display: none;
  }

  .section-link__full {
    display: inline;
  }

  .cat-section {
    background: #f4f6f8;
  }

  .cat-section__bullet {
    display: none;
  }

  .cat-section__title-sm {
    display: none;
  }

  .cat-section__title-lg {
    display: inline;
  }

  .cat-section__lead {
    display: block;
    font-size: 0.9rem;
  }

  .wholesale-banner {
    padding: 1.55rem 1.5rem 1.4rem;
    border-radius: 1.65rem;
  }

  .wholesale-banner__top {
    grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.85fr);
    align-items: start;
    gap: 1.25rem;
  }

  .wholesale-banner__actions {
    flex-direction: column;
    align-items: stretch;
    justify-self: end;
    width: min(100%, 19.5rem);
  }

  .wholesale-banner__rfq,
  .wholesale-banner__phone {
    width: 100%;
    justify-content: center;
  }

  .wholesale-banner__features {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .benefit-bar__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .spec-cat-grid {
    gap: 1rem;
  }

  .spec-cat {
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 0.55rem;
    padding: 1.1rem 1rem 0.95rem;
    border-radius: 1.25rem;
    border: 1px solid #eee;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  }

  .spec-cat__media {
    order: 2;
    margin: 0;
    aspect-ratio: 3 / 2;
    min-height: 0;
    border-radius: 0.85rem;
    border: 1px solid #e0e0e0;
    background: #f3f4f6;
  }

  .spec-cat__badge {
    display: none;
  }

  .spec-cat__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .spec-cat__info {
    order: 1;
    display: grid;
    gap: 0.35rem;
  }

  .spec-cat__meta {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: center;
  }

  .spec-cat__label {
    display: block;
    color: #ea580c;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  .spec-cat__pill {
    display: inline-flex;
    padding: 0.22rem 0.65rem;
    border-radius: 999px;
    background: #fff7ed;
    color: #ea580c;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .spec-cat__info h3 {
    padding: 0;
    font-size: 0.98rem;
    font-weight: 900;
    -webkit-line-clamp: 2;
  }

  .spec-cat__title-sm {
    display: none;
  }

  .spec-cat__title-lg {
    display: inline;
  }

  .spec-cat__info p {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #64748b;
    font-size: 0.78rem;
    line-height: 1.6;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .spec-cat__cta {
    order: 3;
    justify-content: space-between;
    min-height: 2.35rem;
    padding: 0;
  }

  .spec-cat__cta-text {
    display: -webkit-box;
    overflow: hidden;
    color: #334155;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.35;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .spec-cat__cta-icon {
    width: 2.05rem;
    height: 2.05rem;
    border-radius: 999px;
    background: #e8eef8;
    color: #1d4ed8;
    font-size: 0.72rem;
  }

  .latest-panel {
    padding: 1.15rem 1.1rem 1.2rem;
    border-radius: 1.35rem;
  }

  .latest-panel__lead {
    font-size: 0.84rem;
  }

  .latest-col {
    gap: 0.75rem;
  }

  .latest-card {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-height: 4.8rem;
    padding: 0.7rem 0.8rem;
  }

  .latest-card img {
    width: 3.8rem;
    height: 3.8rem;
    object-fit: contain;
    padding: 0.15rem;
  }

  .latest-card h3 {
    font-size: 0.8rem;
  }

  .latest-card strong {
    margin-top: 0.15rem;
    font-size: 0.82rem;
  }

  .latest-card small {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 0.15rem;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .trust-banner {
    grid-template-columns: minmax(0, 1.28fr) minmax(260px, 0.82fr);
    align-items: stretch;
    padding: 1.65rem 1.7rem;
    gap: 1.4rem;
  }

  .review-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .wholesale-banner {
    padding: 1.75rem 1.7rem 1.55rem;
  }

  .wholesale-banner__copy h2 {
    font-size: 1.65rem;
  }

  .wholesale-banner__copy > p:last-child {
    font-size: 0.9rem;
  }

  .spec-cat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .spec-cat {
    padding: 1.2rem 1.15rem 1rem;
    border-radius: 1.35rem;
  }

  .spec-cat__info h3 {
    font-size: 1.05rem;
  }

  .spec-cat__media {
    aspect-ratio: 3 / 2;
    border-radius: 0.95rem;
  }

  .spec-cat__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .trust-banner__features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
