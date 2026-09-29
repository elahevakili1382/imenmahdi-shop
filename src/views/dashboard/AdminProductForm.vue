<template>
  <section class="ap">
    <header class="ap-top">
      <div class="ap-top__titles">
        <router-link class="ap-top__back" :to="{ name: 'AdminProducts' }">
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          بازگشت به لیست
        </router-link>
        <h1>{{ isEdit ? 'ویرایش محصول' : 'محصول جدید' }}</h1>
        <p>{{ isEdit ? 'اطلاعات کالا را به‌روز کنید و ذخیره بزنید.' : 'مشخصات، عکس و قیمت را کامل کنید.' }}</p>
      </div>
      <div class="ap-top__actions ap-top__actions--desk">
        <button class="ap-btn ap-btn--ghost" type="button" @click="cancel">انصراف</button>
        <button class="ap-btn ap-btn--primary" type="submit" form="product-form" :disabled="saving">
          {{ saving ? 'در حال ذخیره...' : 'ذخیره محصول' }}
        </button>
      </div>
    </header>

    <p v-if="loadError" class="ap-error">{{ loadError }}</p>

    <form v-else id="product-form" class="ap-form" @submit.prevent="save">
      <div class="ap-banner">
        <span class="ap-banner__dot" aria-hidden="true"></span>
        <div>
          <strong>{{ isEdit ? 'در حال ویرایش محصول انبار' : 'ثبت محصول جدید در انبار' }}</strong>
          <em v-if="skuHint">شناسه: {{ skuHint }}</em>
        </div>
      </div>

      <div class="ap-grid">
        <div class="ap-main">
          <section class="ap-card">
            <h2>اطلاعات پایه محصول</h2>
            <label class="ap-field">
              <span>نام محصول</span>
              <input v-model="form.title" required placeholder="مثلاً کلاه ایمنی صنعتی" />
            </label>
          </section>

          <section class="ap-card">
            <h2>ساختار دسته‌بندی و برند</h2>
            <div class="ap-select-grid">
              <div class="ap-field">
                <span>برند</span>
                <div class="ap-picker" :class="{ 'is-open': openPicker === 'brand' }">
                  <button
                    type="button"
                    class="ap-picker__trigger"
                    :aria-expanded="openPicker === 'brand'"
                    @click="togglePicker('brand')"
                  >
                    <em>{{ brandTriggerLabel }}</em>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                  </button>
                  <div v-if="openPicker === 'brand'" class="ap-picker__menu" role="listbox">
                    <div class="ap-picker__row">
                      <button type="button" class="ap-picker__opt" @click="pickBrand('')">بدون برند</button>
                    </div>
                    <div v-for="brand in store.brands" :key="brand" class="ap-picker__row">
                      <template v-if="inlineEdit?.kind === 'brand' && inlineEdit.name === brand">
                        <input
                          v-model="inlineEditDraft"
                          class="ap-picker__edit-input"
                          @keydown.enter.prevent="commitInlineEdit"
                          @keydown.escape.prevent="cancelInlineEdit"
                        />
                        <button type="button" class="ap-picker__icon is-ok" aria-label="تایید" @click="commitInlineEdit">
                          <i class="fa-solid fa-check" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="ap-picker__icon" aria-label="انصراف" @click="cancelInlineEdit">
                          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button type="button" class="ap-picker__opt" :class="{ 'is-on': form.brand === brand }" @click="pickBrand(brand)">
                          {{ brand }}
                        </button>
                        <button
                          type="button"
                          class="ap-picker__icon"
                          aria-label="ویرایش برند"
                          title="ویرایش"
                          @click.stop="startInlineEdit('brand', brand)"
                        >
                          <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                      </template>
                    </div>
                    <div class="ap-picker__row">
                      <button type="button" class="ap-picker__opt ap-picker__opt--new" @click="pickBrand(NEW_BRAND)">
                        + برند جدید...
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ap-field">
                <span>دسته اصلی</span>
                <div class="ap-picker" :class="{ 'is-open': openPicker === 'category' }">
                  <button
                    type="button"
                    class="ap-picker__trigger"
                    :aria-expanded="openPicker === 'category'"
                    @click="togglePicker('category')"
                  >
                    <em>{{ categoryTriggerLabel }}</em>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                  </button>
                  <div v-if="openPicker === 'category'" class="ap-picker__menu" role="listbox">
                    <div v-for="group in store.categories" :key="group.slug" class="ap-picker__row">
                      <template v-if="inlineEdit?.kind === 'category' && inlineEdit.name === group.name">
                        <input
                          v-model="inlineEditDraft"
                          class="ap-picker__edit-input"
                          @keydown.enter.prevent="commitInlineEdit"
                          @keydown.escape.prevent="cancelInlineEdit"
                        />
                        <button type="button" class="ap-picker__icon is-ok" aria-label="تایید" @click="commitInlineEdit">
                          <i class="fa-solid fa-check" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="ap-picker__icon" aria-label="انصراف" @click="cancelInlineEdit">
                          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="ap-picker__opt"
                          :class="{ 'is-on': form.category === group.name }"
                          @click="pickCategory(group.name)"
                        >
                          {{ group.name }}
                        </button>
                        <button
                          type="button"
                          class="ap-picker__icon"
                          aria-label="ویرایش دسته"
                          title="ویرایش"
                          @click.stop="startInlineEdit('category', group.name)"
                        >
                          <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                      </template>
                    </div>
                    <div class="ap-picker__row">
                      <button type="button" class="ap-picker__opt ap-picker__opt--new" @click="pickCategory(NEW_CATEGORY)">
                        + دسته جدید...
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ap-field">
                <span>زیردسته</span>
                <div class="ap-picker" :class="{ 'is-open': openPicker === 'subcategory', 'is-disabled': !form.category || isNewCategory }">
                  <button
                    type="button"
                    class="ap-picker__trigger"
                    :disabled="!form.category || isNewCategory"
                    :aria-expanded="openPicker === 'subcategory'"
                    @click="togglePicker('subcategory')"
                  >
                    <em>{{ subcategoryTriggerLabel }}</em>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                  </button>
                  <div v-if="openPicker === 'subcategory'" class="ap-picker__menu" role="listbox">
                    <div v-for="child in subOptions" :key="child.slug" class="ap-picker__row">
                      <template v-if="inlineEdit?.kind === 'subcategory' && inlineEdit.name === child.name">
                        <input
                          v-model="inlineEditDraft"
                          class="ap-picker__edit-input"
                          @keydown.enter.prevent="commitInlineEdit"
                          @keydown.escape.prevent="cancelInlineEdit"
                        />
                        <button type="button" class="ap-picker__icon is-ok" aria-label="تایید" @click="commitInlineEdit">
                          <i class="fa-solid fa-check" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="ap-picker__icon" aria-label="انصراف" @click="cancelInlineEdit">
                          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                      </template>
                      <template v-else>
                        <button
                          type="button"
                          class="ap-picker__opt"
                          :class="{ 'is-on': form.subcategory === child.name }"
                          @click="pickSubcategory(child.name)"
                        >
                          {{ child.name }}
                        </button>
                        <button
                          type="button"
                          class="ap-picker__icon"
                          aria-label="ویرایش زیردسته"
                          title="ویرایش"
                          @click.stop="startInlineEdit('subcategory', child.name)"
                        >
                          <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                      </template>
                    </div>
                    <div v-if="form.category && !isNewCategory" class="ap-picker__row">
                      <button
                        type="button"
                        class="ap-picker__opt ap-picker__opt--new"
                        @click="pickSubcategory(NEW_SUBCATEGORY)"
                      >
                        + زیردسته جدید...
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isNewBrand" class="ap-inline-add">
              <input v-model="newBrandName" placeholder="نام برند جدید" @keydown.enter.prevent="saveNewBrand" />
              <button class="ap-btn ap-btn--soft" type="button" @click="saveNewBrand">ثبت برند</button>
            </div>
            <div v-if="isNewCategory" class="ap-inline-add ap-inline-add--stack">
              <input v-model="newCategoryName" placeholder="نام دسته جدید" />
              <input v-model="newSubcategoryName" placeholder="زیردسته (اختیاری)" />
              <button class="ap-btn ap-btn--soft" type="button" @click="saveNewCategory">ثبت دسته</button>
            </div>
            <div v-else-if="isNewSubcategory" class="ap-inline-add">
              <input
                v-model="newSubcategoryName"
                placeholder="نام زیردسته جدید"
                @keydown.enter.prevent="saveNewSubcategory"
              />
              <button class="ap-btn ap-btn--soft" type="button" @click="saveNewSubcategory">ثبت زیردسته</button>
            </div>
          </section>

          <section class="ap-card">
            <h2>قیمت و موجودی انبار</h2>
            <label class="ap-check">
              <input v-model="form.priceOnRequest" type="checkbox" />
              <span>قیمت ندارد (جهت خرید تماس بگیرید)</span>
            </label>

            <div v-if="form.priceOnRequest" class="ap-callout">
              روی سایت نمایش داده می‌شود: <strong>جهت خرید تماس بگیرید</strong>
            </div>

            <div v-else class="ap-price-grid">
              <label class="ap-field">
                <span>قیمت اصلی (تومان)</span>
                <input v-model="priceInput" type="text" inputmode="numeric" required placeholder="1,250,000" />
              </label>
              <label class="ap-field">
                <span>تخفیف (٪)</span>
                <input v-model.number="form.discountPercent" type="number" min="0" max="100" step="1" placeholder="0" />
              </label>
              <label class="ap-field">
                <span>قیمت بعد از تخفیف</span>
                <input :value="discountedPriceText" type="text" readonly />
              </label>
            </div>

            <label class="ap-field">
              <span>وضعیت موجودی</span>
              <input v-model="form.stock" required placeholder="موجود در انبار فروشگاه" />
            </label>
          </section>

          <section class="ap-card">
            <h2>تنوع سایز و رنگ</h2>

            <div class="ap-variant">
              <div class="ap-variant__head">
                <span>سایزها (اختیاری)</span>
                <div class="ap-preset">
                  <button type="button" @click="applySizePreset(SHOE_SIZES)">کفش ۳۸–۴۷</button>
                  <button type="button" @click="applySizePreset(CLOTHING_SIZES)">لباس M–3XL</button>
                </div>
              </div>
              <p class="ap-hint">اگر لازم نیست خالی بگذار؛ فقط وقتی کارفرما سایز می‌خواهد اضافه کن.</p>
              <div v-if="form.sizes.length" class="ap-chips">
                <span v-for="(size, index) in form.sizes" :key="`s-${index}-${size}`" class="ap-chip">
                  {{ size || '—' }}
                  <button type="button" aria-label="حذف سایز" @click="removeSize(index)">×</button>
                </span>
              </div>
              <div v-else class="ap-empty-sizes">سایزی ثبت نشده</div>
              <div class="ap-add-row">
                <input
                  v-model="sizeDraft"
                  placeholder="سایز جدید بنویسید"
                  @keydown.enter.prevent="commitSizeDraft"
                />
                <button class="ap-btn ap-btn--soft" type="button" @click="commitSizeDraft">ثبت سایز</button>
              </div>
            </div>

            <div class="ap-variant">
              <div class="ap-variant__head">
                <span>رنگ:</span>
              </div>
              <div class="ap-swatches">
                <button
                  v-for="preset in COLOR_PRESETS"
                  :key="preset"
                  type="button"
                  class="ap-swatch"
                  :class="{ 'is-on': hasColor(preset) }"
                  :title="preset"
                  :aria-label="preset"
                  :aria-pressed="hasColor(preset)"
                  @click="toggleColor(preset)"
                >
                  <i :style="{ background: colorHex(preset) }" aria-hidden="true"></i>
                  <em v-if="hasColor(preset)" class="fa-solid fa-check" aria-hidden="true"></em>
                </button>
              </div>
              <div class="ap-add-row ap-add-row--color">
                <input v-model="customColorName" placeholder="نام رنگ سفارشی" />
                <input v-model="customColorHex" type="color" class="ap-hex" :title="customColorHex" />
                <button class="ap-btn ap-btn--soft" type="button" @click="addCustomColor">افزودن</button>
              </div>
              <div v-if="form.colors.length" class="ap-chips">
                <span v-for="(color, index) in form.colors" :key="colorName(color) + index" class="ap-chip ap-chip--color">
                  <i :style="{ background: colorHex(color) }" aria-hidden="true"></i>
                  {{ colorName(color) }}
                  <button type="button" aria-label="حذف رنگ" @click="removeColor(index)">×</button>
                </span>
              </div>
            </div>
          </section>

          <section class="ap-card">
            <h2>توضیح و مشخصات فنی</h2>
            <label class="ap-field">
              <span>توضیح کوتاه محصول</span>
              <textarea v-model="form.description" rows="4" placeholder="توضیح صفحه محصول را بنویسید" />
            </label>

            <div class="ap-features">
              <div class="ap-variant__head">
                <span>ویژگی‌های کلیدی فنی</span>
                <button class="ap-link" type="button" @click="addFeature">+ افزودن ویژگی</button>
              </div>
              <div v-for="(_, index) in form.features" :key="index" class="ap-feature-row">
                <span class="ap-feature-row__handle" aria-hidden="true">⋮⋮</span>
                <input v-model="form.features[index]" :placeholder="`ویژگی ${index + 1}`" />
                <button type="button" class="ap-feature-row__del" aria-label="حذف" @click="removeFeature(index)">
                  <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div class="ap-flags">
              <label class="ap-check">
                <input v-model="form.featured" type="checkbox" />
                <span>محصول منتخب</span>
              </label>
              <label class="ap-check">
                <input v-model="form.popular" type="checkbox" />
                <span>نمایش در پرفروش‌ها</span>
              </label>
            </div>
          </section>
        </div>

        <aside class="ap-side">
          <section class="ap-card ap-card--side">
            <h2>عکس‌های محصول</h2>
            <p class="ap-hint">JPG / WEBP / PNG — اولین عکس، تصویر اصلی است.</p>

            <label class="ap-upload">
              <input type="file" accept="image/*" multiple class="sr-only" @change="onFiles" />
              <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
              <strong>برای انتخاب عکس کلیک کنید</strong>
              <em>حداکثر {{ MAX_PHOTOS }} فایل</em>
            </label>

            <div v-if="form.gallery.length" class="ap-gallery">
              <figure v-for="(img, index) in form.gallery" :key="`${index}-${String(img).slice(-20)}`">
                <img :src="asset(img)" alt="" />
                <span v-if="index === 0" class="ap-gallery__badge">تصویر اصلی</span>
                <div class="ap-gallery__tools">
                  <button type="button" title="ویرایش" @click="openImageEditor(index)">
                    <i class="fa-solid fa-crop" aria-hidden="true"></i>
                  </button>
                  <button v-if="index !== 0" type="button" title="اصلی" @click="setCover(index)">
                    <i class="fa-solid fa-star" aria-hidden="true"></i>
                  </button>
                  <button type="button" class="is-danger" title="حذف" @click="removeImage(index)">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                </div>
              </figure>
            </div>
          </section>

          <section class="ap-card ap-card--side ap-publish">
            <h2>وضعیت انتشار و عملیات</h2>
            <label class="ap-switch">
              <input v-model="form.featured" type="checkbox" />
              <span>فعال به‌عنوان منتخب فروشگاه</span>
            </label>
            <button class="ap-btn ap-btn--primary ap-btn--block" type="submit" :disabled="saving">
              {{ saving ? 'در حال ذخیره...' : 'ذخیره و انتشار نهایی' }}
            </button>
            <button class="ap-btn ap-btn--ghost ap-btn--block" type="button" @click="cancel">انصراف</button>
          </section>
        </aside>
      </div>

      <div class="ap-top__actions ap-top__actions--mobile">
        <button class="ap-btn ap-btn--ghost" type="button" @click="cancel">انصراف</button>
        <button class="ap-btn ap-btn--primary" type="submit" :disabled="saving">
          {{ saving ? '...' : 'ذخیره محصول' }}
        </button>
      </div>
    </form>

    <ProductImageEditor
      :open="imageEditorOpen"
      :src="imageEditorSrc"
      @close="closeImageEditor"
      @apply="applyEditedImage"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { asset } from '@/utils/asset'
import { formatGroupedPrice, formatPrice, toNumber } from '@/utils/money'
import { COLOR_PRESETS, colorHex, colorName, normalizeColors } from '@/utils/colors'
import { compressGallery, compressImage } from '@/utils/imageCompress'
import { useToast } from 'vue-toastification'
import ProductImageEditor from '@/components/dashboard/ProductImageEditor.vue'

const store = useProductStore()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const form = reactive(emptyForm())
const saving = ref(false)
const loadError = ref('')
const newCategoryName = ref('')
const newSubcategoryName = ref('')
const newBrandName = ref('')
const sizeDraft = ref('')
const imageEditorOpen = ref(false)
const imageEditorIndex = ref(-1)
const imageEditorSrc = ref('')
const customColorName = ref('')
const customColorHex = ref('#FFD700')
const NEW_CATEGORY = '__new__'
const NEW_SUBCATEGORY = '__new_sub__'
const NEW_BRAND = '__new_brand__'
const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024
const SHOE_SIZES = Array.from({ length: 10 }, (_, i) => String(38 + i))
const CLOTHING_SIZES = ['M', 'L', 'XL', '2XL', '3XL']

const isEdit = computed(() => Boolean(route.params.id))
const isNewCategory = computed(() => form.category === NEW_CATEGORY)
const isNewSubcategory = computed(() => form.subcategory === NEW_SUBCATEGORY)
const isNewBrand = computed(() => form.brand === NEW_BRAND)
const skuHint = computed(() => form.id || 'پس از ذخیره ساخته می‌شود')
const openPicker = ref('')
const inlineEdit = ref(null)
const inlineEditDraft = ref('')

const brandTriggerLabel = computed(() => {
  if (form.brand === NEW_BRAND) return '+ برند جدید...'
  return form.brand || 'بدون برند'
})
const categoryTriggerLabel = computed(() => {
  if (form.category === NEW_CATEGORY) return '+ دسته جدید...'
  return form.category || 'انتخاب دسته'
})
const subcategoryTriggerLabel = computed(() => {
  if (form.subcategory === NEW_SUBCATEGORY) return '+ زیردسته جدید...'
  return form.subcategory || 'انتخاب زیردسته'
})

const priceInput = computed({
  get() {
    return formatGroupedPrice(form.price)
  },
  set(raw) {
    form.price = toNumber(raw)
  },
})

const discountedPriceText = computed(() => {
  const price = Number(form.price) || 0
  const discount = Math.min(100, Math.max(0, Number(form.discountPercent) || 0))
  if (!price) return '—'
  return `${formatPrice(Math.round((price * (100 - discount)) / 100))} تومان`
})

const subOptions = computed(() => {
  const group = store.categories.find((item) => item.name === form.category)
  return group?.children || []
})

watch(
  () => form.category,
  () => {
    if (!formReady.value || suppressCategoryWatch) return
    if (form.category === NEW_CATEGORY) return
    if (form.subcategory === NEW_SUBCATEGORY) return
    if (!subOptions.value.some((item) => item.name === form.subcategory)) {
      form.subcategory = subOptions.value[0]?.name || ''
    }
  },
)

watch(
  () => String(route.params.id || ''),
  (nextId, prevId) => {
    if (nextId === prevId) return
    formReady.value = false
    bootstrap({ force: true })
  },
)

const formReady = ref(false)
let suppressCategoryWatch = false
let draftTimer = null
const DRAFT_PREFIX = 'imenmahdi-product-draft'

function emptyForm() {
  return {
    id: '',
    title: '',
    price: 0,
    brand: '',
    category: '',
    subcategory: '',
    stock: 'موجود در انبار فروشگاه',
    image: '',
    gallery: [],
    description: '',
    featured: false,
    popular: false,
    priceOnRequest: false,
    discountPercent: 0,
    features: [''],
    sizes: [],
    colors: [],
  }
}

function uniqueImages(list) {
  return [...new Set((list || []).filter(Boolean))]
}

function resetMetaFields() {
  newCategoryName.value = ''
  newSubcategoryName.value = ''
  newBrandName.value = ''
  sizeDraft.value = ''
  customColorName.value = ''
  customColorHex.value = '#FFD700'
}

function openCreate() {
  Object.assign(form, emptyForm())
  const first = store.categories[0]
  form.category = first?.name || ''
  form.subcategory = first?.children?.[0]?.name || form.category
  resetMetaFields()
  loadError.value = ''
}

function openEdit(product) {
  const gallery = uniqueImages([product.image, ...(product.gallery || [])])
  Object.assign(form, {
    id: product.id,
    title: product.title,
    price: product.price,
    brand: product.brand || '',
    category: product.category,
    subcategory: product.subcategory,
    stock: product.stock === 0 || product.stock ? String(product.stock) : 'موجود در انبار فروشگاه',
    image: gallery[0] || '',
    gallery,
    description: product.description,
    featured: Boolean(product.featured),
    popular: Boolean(product.popular),
    priceOnRequest: Boolean(product.priceOnRequest),
    discountPercent: Math.min(100, Math.max(0, Number(product.discountPercent) || 0)),
    features: product.features?.length ? [...product.features] : [''],
    sizes: product.sizes?.length ? [...product.sizes] : [],
    colors: normalizeColors(product.colors),
  })
  resetMetaFields()
  loadError.value = ''
}

function draftStorageKey() {
  const id = route.params.id ? String(route.params.id) : 'new'
  return `${DRAFT_PREFIX}:${id}`
}

function clearDraft() {
  try {
    sessionStorage.removeItem(draftStorageKey())
  } catch {
    /* ignore */
  }
}

function readDraft() {
  try {
    const raw = sessionStorage.getItem(draftStorageKey())
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.form || typeof parsed.form !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function applyDraft(draft) {
  if (!draft?.form) return false
  suppressCategoryWatch = true
  Object.assign(form, emptyForm(), draft.form)
  form.gallery = Array.isArray(draft.form.gallery) ? [...draft.form.gallery].filter(Boolean) : []
  form.image = form.gallery[0] || draft.form.image || ''
  form.features = draft.form.features?.length ? [...draft.form.features] : ['']
  form.sizes = draft.form.sizes?.length ? [...draft.form.sizes] : []
  form.colors = normalizeColors(draft.form.colors)
  newBrandName.value = draft.newBrandName || ''
  newCategoryName.value = draft.newCategoryName || ''
  newSubcategoryName.value = draft.newSubcategoryName || ''
  sizeDraft.value = ''
  customColorName.value = ''
  customColorHex.value = '#FFD700'
  loadError.value = ''
  suppressCategoryWatch = false
  return true
}

function persistDraft() {
  if (!formReady.value) return
  const payload = {
    form: {
      id: form.id,
      title: form.title,
      price: form.price,
      brand: form.brand,
      category: form.category,
      subcategory: form.subcategory,
      stock: form.stock,
      image: form.image,
      gallery: [...form.gallery],
      description: form.description,
      featured: form.featured,
      popular: form.popular,
      priceOnRequest: form.priceOnRequest,
      discountPercent: form.discountPercent,
      features: [...form.features],
      sizes: [...form.sizes],
      colors: form.colors.map((item) => ({ ...item })),
    },
    newBrandName: newBrandName.value,
    newCategoryName: newCategoryName.value,
    newSubcategoryName: newSubcategoryName.value,
    savedAt: Date.now(),
  }
  try {
    sessionStorage.setItem(draftStorageKey(), JSON.stringify(payload))
  } catch {
    // حجم عکس زیاد: بدون گالری کامل نگه دار تا حداقل متن‌ها نپرد
    try {
      payload.form.gallery = payload.form.gallery.slice(0, 1)
      payload.form.image = payload.form.gallery[0] || ''
      sessionStorage.setItem(draftStorageKey(), JSON.stringify(payload))
    } catch {
      /* ignore quota */
    }
  }
}

function scheduleDraftSave() {
  if (!formReady.value) return
  clearTimeout(draftTimer)
  draftTimer = setTimeout(persistDraft, 250)
}

async function bootstrap({ force = false } = {}) {
  const id = route.params.id ? String(route.params.id) : ''
  const draft = readDraft()

  // برگشت از تب دیگر / رفرش موبایل: اول پیش‌نویس را برگردان
  if (!force && draft && applyDraft(draft)) {
    formReady.value = true
    return
  }

  if (!force && formReady.value && hasDraftContent()) {
    return
  }

  if (typeof store.hydrate === 'function') {
    try {
      await store.hydrate()
    } catch {
      /* keep local catalog */
    }
  }

  // بعد از await اگر پیش‌نویس ساخته شد، همان را نگه دار
  const draftAfter = readDraft()
  if (!force && draftAfter && applyDraft(draftAfter)) {
    formReady.value = true
    return
  }
  if (!force && formReady.value && hasDraftContent()) {
    return
  }

  if (!id) {
    openCreate()
    formReady.value = true
    return
  }
  const product = store.byId(id)
  if (!product) {
    loadError.value = 'این محصول پیدا نشد.'
    Object.assign(form, emptyForm())
    formReady.value = true
    return
  }
  openEdit(product)
  formReady.value = true
}

function hasDraftContent() {
  return Boolean(
    String(form.title || '').trim() ||
      form.gallery.length ||
      String(form.description || '').trim() ||
      (form.colors && form.colors.length) ||
      form.price > 0 ||
      form.brand ||
      form.priceOnRequest,
  )
}

function cancel() {
  clearDraft()
  router.push({ name: 'AdminProducts' })
}

function onVisibilitySave() {
  if (document.visibilityState === 'hidden' && formReady.value && hasDraftContent()) {
    persistDraft()
  }
}

watch(
  form,
  () => {
    scheduleDraftSave()
  },
  { deep: true },
)

watch([newBrandName, newCategoryName, newSubcategoryName], () => {
  scheduleDraftSave()
})

onMounted(() => {
  // force نگذار تا پیش‌نویس بعد از برگشت به تب پاک نشود
  bootstrap({ force: false })
  document.addEventListener('visibilitychange', onVisibilitySave)
  document.addEventListener('pointerdown', onDocPointerDown)
})

onBeforeUnmount(() => {
  clearTimeout(draftTimer)
  document.removeEventListener('visibilitychange', onVisibilitySave)
  document.removeEventListener('pointerdown', onDocPointerDown)
  if (formReady.value && hasDraftContent()) persistDraft()
})

function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

async function onFiles(event) {
  const input = event.target
  const files = Array.from(input.files || []).filter((file) => file.type.startsWith('image/'))
  input.value = ''
  if (!files.length) return
  const room = MAX_PHOTOS - form.gallery.length
  if (room <= 0) {
    toast.error(`حداکثر ${MAX_PHOTOS} عکس برای هر محصول`)
    return
  }
  const picked = files.slice(0, room)
  const skippedSize = picked.filter((file) => file.size > MAX_BYTES).length
  const readable = picked.filter((file) => file.size <= MAX_BYTES)
  if (skippedSize) toast.error('بعضی فایل‌ها بزرگ‌تر از ۵ مگابایت بودند و اضافه نشدند')
  const urls = (await Promise.all(readable.map(readAsDataURL))).filter(Boolean)
  const compressed = await compressGallery(urls, { maxEdge: 1100, quality: 0.72, maxBytes: 380_000 })
  const startIndex = form.gallery.length
  for (const url of compressed) {
    if (url && !form.gallery.includes(url)) form.gallery.push(url)
  }
  form.image = form.gallery[0] || ''
  if (files.length > room) toast.error(`فقط ${room} عکس دیگر جا داشت`)
  // ادیتور را خودکار باز نکن؛ باعث پرش ناگهانی وسط ثبت می‌شد
}

function setCover(index) {
  const [img] = form.gallery.splice(index, 1)
  if (!img) return
  form.gallery.unshift(img)
  form.image = img
}

function removeImage(index) {
  form.gallery.splice(index, 1)
  form.image = form.gallery[0] || ''
}

function openImageEditor(index) {
  const src = form.gallery[index]
  if (!src) return
  imageEditorIndex.value = index
  imageEditorSrc.value = asset(src)
  imageEditorOpen.value = true
}

function closeImageEditor() {
  imageEditorOpen.value = false
  imageEditorIndex.value = -1
  imageEditorSrc.value = ''
}

async function applyEditedImage(dataUrl) {
  const index = imageEditorIndex.value
  if (index < 0 || !dataUrl) return
  const compressed = await compressImage(dataUrl, { maxEdge: 1100, quality: 0.75, force: true })
  form.gallery[index] = compressed || dataUrl
  if (index === 0) form.image = form.gallery[index]
  toast.success('عکس ویرایش شد')
}

function addFeature() {
  form.features.push('')
}

function removeFeature(index) {
  form.features.splice(index, 1)
  if (!form.features.length) form.features.push('')
}

function removeSize(index) {
  form.sizes.splice(index, 1)
}

function applySizePreset(list) {
  form.sizes = [...list]
}

function commitSizeDraft() {
  const value = sizeDraft.value.trim()
  if (!value) {
    toast.error('سایز را بنویسید')
    return
  }
  if (form.sizes.includes(value)) {
    toast.error('این سایز از قبل هست')
    return
  }
  form.sizes.push(value)
  sizeDraft.value = ''
}

function togglePicker(kind) {
  if (kind === 'subcategory' && (!form.category || isNewCategory.value)) return
  const next = openPicker.value === kind ? '' : kind
  openPicker.value = next
  cancelInlineEdit()
}

function closePickers() {
  openPicker.value = ''
  cancelInlineEdit()
}

function onDocPointerDown(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.ap-picker')) return
  closePickers()
}

function pickBrand(value) {
  form.brand = value
  if (value !== NEW_BRAND) newBrandName.value = ''
  closePickers()
}

function pickCategory(value) {
  form.category = value
  if (value !== NEW_CATEGORY) newCategoryName.value = ''
  closePickers()
}

function pickSubcategory(value) {
  form.subcategory = value
  if (value !== NEW_SUBCATEGORY) newSubcategoryName.value = ''
  closePickers()
}

function startInlineEdit(kind, name) {
  inlineEdit.value = { kind, name }
  inlineEditDraft.value = name
  nextTick(() => {
    const input = document.querySelector('.ap-picker__edit-input')
    if (input instanceof HTMLInputElement) {
      input.focus()
      input.select()
    }
  })
}

function cancelInlineEdit() {
  inlineEdit.value = null
  inlineEditDraft.value = ''
}

function commitInlineEdit() {
  const edit = inlineEdit.value
  if (!edit) return
  const next = String(inlineEditDraft.value || '').trim()
  if (!next) {
    toast.error('نام خالی است')
    return
  }
  if (next === edit.name) {
    cancelInlineEdit()
    return
  }
  if (edit.kind === 'brand') {
    const ok = store.renameBrand(edit.name, next)
    if (!ok) {
      toast.error('تغییر نام برند انجام نشد')
      return
    }
    if (form.brand === edit.name) form.brand = next
    toast.success('برند ویرایش شد')
  } else if (edit.kind === 'category') {
    const ok = store.renameCategory(edit.name, next)
    if (!ok) {
      toast.error('تغییر نام دسته انجام نشد؛ شاید این نام از قبل باشد')
      return
    }
    if (form.category === edit.name) form.category = next
    toast.success('دسته ویرایش شد')
  } else if (edit.kind === 'subcategory') {
    const ok = store.renameSubcategory(form.category, edit.name, next)
    if (!ok) {
      toast.error('تغییر نام زیردسته انجام نشد؛ شاید این نام از قبل باشد')
      return
    }
    if (form.subcategory === edit.name) form.subcategory = next
    toast.success('زیردسته ویرایش شد')
  }
  cancelInlineEdit()
}

function hasColor(name) {
  return form.colors.some((item) => colorName(item) === name)
}

function toggleColor(name) {
  if (hasColor(name)) {
    form.colors = form.colors.filter((item) => colorName(item) !== name)
    return
  }
  form.colors.push({ name, hex: colorHex(name) })
}

function addCustomColor() {
  const name = customColorName.value.trim()
  if (!name) {
    toast.error('نام رنگ را بنویسید')
    return
  }
  if (hasColor(name)) {
    toast.error('این رنگ از قبل هست')
    return
  }
  form.colors.push({ name, hex: customColorHex.value || '#94a3b8' })
  customColorName.value = ''
  toast.success('رنگ اضافه شد')
}

function removeColor(index) {
  form.colors.splice(index, 1)
}

function saveNewCategory() {
  const name = newCategoryName.value.trim()
  if (!name) {
    toast.error('نام دسته جدید را بنویسید')
    return
  }
  const sub = newSubcategoryName.value.trim() || name
  store.addCategory(name, sub)
  form.category = name
  form.subcategory = sub
  newCategoryName.value = ''
  newSubcategoryName.value = ''
  toast.success('دسته ذخیره شد')
}

function saveNewSubcategory() {
  const sub = newSubcategoryName.value.trim()
  if (!sub) {
    toast.error('نام زیردسته جدید را بنویسید')
    return
  }
  if (!form.category || form.category === NEW_CATEGORY) {
    toast.error('اول یک دسته انتخاب کنید')
    return
  }
  store.addCategory(form.category, sub)
  form.subcategory = sub
  newSubcategoryName.value = ''
  toast.success('زیردسته ذخیره شد')
}

function saveNewBrand() {
  const name = newBrandName.value.trim()
  if (!name) {
    toast.error('نام برند جدید را بنویسید')
    return
  }
  const saved = store.addBrand(name)
  form.brand = saved
  newBrandName.value = ''
  toast.success('برند ذخیره شد')
}

async function save() {
  if (saving.value) return
  if (!form.gallery.length) {
    toast.error('حداقل یک عکس انتخاب کنید')
    return
  }
  if (!String(form.stock ?? '').trim()) {
    toast.error('موجودی را بنویسید (عدد یا متن)')
    return
  }
  const sizes = form.sizes.map((item) => String(item || '').trim()).filter(Boolean)
  let category = form.category
  let subcategory = form.subcategory
  let brand = form.brand
  if (form.brand === NEW_BRAND) {
    brand = newBrandName.value.trim()
    if (!brand) {
      toast.error('نام برند جدید را بنویسید یا ذخیره برند را بزنید')
      return
    }
    store.addBrand(brand)
  }
  if (form.category === NEW_CATEGORY) {
    category = newCategoryName.value.trim()
    if (!category) {
      toast.error('نام دسته جدید را بنویسید')
      return
    }
    subcategory = newSubcategoryName.value.trim() || category
    store.addCategory(category, subcategory)
  }
  if (form.subcategory === NEW_SUBCATEGORY) {
    subcategory = newSubcategoryName.value.trim()
    if (!subcategory) {
      toast.error('نام زیردسته جدید را بنویسید')
      return
    }
    store.addCategory(category, subcategory)
  }
  if (category === NEW_CATEGORY || !category) {
    toast.error('اول دسته را ذخیره و انتخاب کنید')
    return
  }
  if (subcategory === NEW_SUBCATEGORY || !subcategory) {
    toast.error('اول زیردسته را ذخیره و انتخاب کنید')
    return
  }

  saving.value = true
  try {
    // عکس‌ها موقع آپلود فشرده شده‌اند؛ فقط موارد خیلی بزرگ دوباره فشرده می‌شوند
    const compressed = await compressGallery(
      form.gallery.map((item) => String(item || '')).filter(Boolean),
      { maxEdge: 1100, quality: 0.72, maxBytes: 380_000 },
    )
    if (!compressed.length) {
      toast.error('حداقل یک عکس معتبر لازم است')
      return
    }
    // روی موبایل حجم base64 باعث Network Error می‌شود؛ تک‌تک به سرور می‌فرستیم
    const uploaded = await store.uploadImages(compressed, 'product')
    if (!uploaded?.ok) {
      toast.warning(
        uploaded?.message ||
          'آپلود عکس انجام نشد. API را روشن نگه دار و دوباره ذخیره بزن.',
      )
      return
    }
    const gallery = uploaded.urls
    form.gallery = gallery
    form.image = gallery[0]

    const result = await store.upsert({
      ...form,
      brand: brand === NEW_BRAND ? '' : String(brand || '').trim(),
      category,
      subcategory,
      stock: String(form.stock ?? '').trim(),
      price: form.priceOnRequest ? 0 : form.price,
      priceOnRequest: Boolean(form.priceOnRequest),
      discountPercent: form.priceOnRequest
        ? 0
        : Math.min(100, Math.max(0, Math.round(Number(form.discountPercent) || 0))),
      features: form.features.map((item) => String(item || '').trim()).filter(Boolean),
      sizes,
      colors: normalizeColors(form.colors),
      image: gallery[0],
      gallery: [...gallery],
    })
    if (!result?.product) {
      toast.error('محصول ذخیره نشد')
      return
    }
    if (!result.persist?.ok) {
      if (result.persist?.reason === 'offline') {
        toast.warning('محصول روی این مرورگر ذخیره شد؛ API خاموش است یا وارد ادمین نیستید. همین‌جا بمان و دوباره ذخیره بزن.')
      } else {
        toast.warning(
          result.persist?.message ||
            'محصول روی مرورگر ماند، ولی سرور قبول نکرد. عکس‌ها را کوچک‌تر کن و دوباره ذخیره بزن.',
        )
      }
      return
    }
    toast.success('محصول ذخیره شد')
    clearDraft()
    formReady.value = false
    router.push({ name: 'AdminProducts' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ap {
  display: grid;
  gap: 0.9rem;
  min-width: 0;
  max-width: 1080px;
  margin-inline: auto;
  padding-bottom: 5.5rem;
}

.ap-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}

.ap-top__titles {
  min-width: 0;
  flex: 1;
}

.ap-top__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.45rem;
  color: var(--dash-muted, #64748b);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.ap-top__back:hover {
  color: var(--dash-ember, #c45c26);
}

.ap-top__titles h1 {
  margin: 0;
  font-size: clamp(1.15rem, 3vw, 1.45rem);
  font-weight: 900;
}

.ap-top__titles p {
  margin: 0.3rem 0 0;
  color: var(--dash-muted, #64748b);
  font-size: 0.82rem;
}

.ap-top__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ap-top__actions--desk {
  display: none;
}

.ap-top__actions--mobile {
  position: sticky;
  bottom: 0.65rem;
  z-index: 20;
  margin-top: 0.35rem;
  padding: 0.55rem;
  border-radius: 0.95rem;
  border: 1px solid var(--dash-line, #e8ecef);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}

.ap-top__actions--mobile .ap-btn {
  flex: 1;
}

.ap-error {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
}

.ap-form {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
}

.ap-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 0.95rem;
  border: 1px solid #dbeafe;
  background: #eff6ff;
}

.ap-banner__dot {
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.35rem;
  border-radius: 999px;
  background: #3b82f6;
  flex-shrink: 0;
}

.ap-banner strong {
  display: block;
  font-size: 0.86rem;
  color: #1e3a8a;
}

.ap-banner em {
  display: block;
  margin-top: 0.2rem;
  font-style: normal;
  font-size: 0.75rem;
  color: #64748b;
}

.ap-grid {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
}

.ap-main,
.ap-side {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
}

.ap-card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--dash-line, #e8ecef);
  background: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.03);
  min-width: 0;
}

.ap-card h2 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 900;
}

.ap-hint {
  margin: -0.35rem 0 0;
  color: var(--dash-muted, #64748b);
  font-size: 0.75rem;
}

.ap-field {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.ap-field > span {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.ap-field input,
.ap-field select,
.ap-field textarea,
.ap-add-row input,
.ap-inline-add input,
.ap-feature-row input {
  width: 100%;
  min-height: 2.65rem;
  padding: 0.55rem 0.8rem;
  border-radius: 0.75rem;
  border: 1px solid #d9e0e6;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.88rem;
}

.ap-field textarea {
  min-height: 6rem;
  resize: vertical;
}

.ap-field input:focus,
.ap-field select:focus,
.ap-field textarea:focus,
.ap-add-row input:focus,
.ap-inline-add input:focus,
.ap-feature-row input:focus {
  outline: 2px solid color-mix(in srgb, var(--dash-ember, #c45c26) 35%, transparent);
  border-color: transparent;
  background: #fff;
}

.ap-field input[readonly] {
  color: #64748b;
  background: #f1f5f9;
}

.ap-select-grid,
.ap-price-grid {
  display: grid;
  gap: 0.75rem;
}

.ap-picker {
  position: relative;
  min-width: 0;
}

.ap-picker.is-disabled .ap-picker__trigger {
  opacity: 0.55;
  cursor: not-allowed;
}

.ap-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.65rem;
  padding: 0.55rem 0.8rem;
  border-radius: 0.75rem;
  border: 1px solid #d9e0e6;
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
  font-size: 0.88rem;
  text-align: right;
  cursor: pointer;
}

.ap-picker__trigger em {
  font-style: normal;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ap-picker__trigger i {
  color: #64748b;
  font-size: 0.7rem;
  transition: transform 0.15s ease;
}

.ap-picker.is-open .ap-picker__trigger {
  border-color: transparent;
  outline: 2px solid color-mix(in srgb, var(--dash-ember, #c45c26) 35%, transparent);
  background: #fff;
}

.ap-picker.is-open .ap-picker__trigger i {
  transform: rotate(180deg);
}

.ap-picker__menu {
  position: absolute;
  z-index: 30;
  inset-inline: 0;
  top: calc(100% + 0.3rem);
  max-height: 16rem;
  overflow: auto;
  padding: 0.35rem;
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.ap-picker__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.15rem;
  min-width: 0;
}

.ap-picker__row:has(.ap-picker__edit-input) {
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 0.2rem;
}

.ap-picker__opt {
  display: block;
  width: 100%;
  min-height: 2.35rem;
  padding: 0.45rem 0.7rem;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: #0f172a;
  font: inherit;
  font-size: 0.86rem;
  text-align: right;
  cursor: pointer;
}

.ap-picker__opt:hover,
.ap-picker__opt.is-on {
  background: #eff6ff;
  color: #1d4ed8;
}

.ap-picker__opt--new {
  color: var(--dash-ember, #c45c26);
  font-weight: 800;
}

.ap-picker__icon {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.ap-picker__icon:hover {
  background: #f1f5f9;
  color: var(--dash-ember, #c45c26);
}

.ap-picker__icon.is-ok {
  color: #15803d;
}

.ap-picker__edit-input {
  width: 100%;
  min-height: 2.2rem;
  padding: 0.4rem 0.65rem;
  border-radius: 0.55rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  font: inherit;
  font-size: 0.86rem;
}

.ap-inline-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
}

.ap-inline-add--stack {
  grid-template-columns: 1fr;
}

.ap-empty-sizes {
  padding: 0.55rem 0.75rem;
  border-radius: 0.7rem;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
}

.ap-check {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: #334155;
}

.ap-callout {
  padding: 0.75rem 0.9rem;
  border-radius: 0.8rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 0.84rem;
}

.ap-variant {
  display: grid;
  gap: 0.65rem;
  padding-top: 0.15rem;
}

.ap-variant + .ap-variant {
  margin-top: 0.35rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--dash-line, #e8ecef);
}

.ap-variant__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #334155;
}

.ap-preset {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.ap-preset button,
.ap-link {
  min-height: 1.9rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #d9e0e6;
  background: #fff;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}

.ap-link {
  border: 0;
  background: transparent;
  color: var(--dash-ember, #c45c26);
}

.ap-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ap-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
  padding: 0.2rem 0.35rem 0.2rem 0.65rem;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
  font-size: 0.78rem;
  font-weight: 700;
}

.ap-chip--color {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #334155;
}

.ap-chip i {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.ap-chip button {
  display: grid;
  place-items: center;
  width: 1.3rem;
  height: 1.3rem;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: inherit;
  cursor: pointer;
  line-height: 1;
}

.ap-add-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
}

.ap-add-row--color {
  grid-template-columns: minmax(0, 1fr) 2.65rem auto;
}

.ap-hex {
  width: 2.65rem !important;
  min-height: 2.65rem !important;
  padding: 0.15rem !important;
  cursor: pointer;
}

.ap-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.ap-swatch {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  padding: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
}

.ap-swatch i {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.ap-swatch em {
  position: absolute;
  font-size: 0.55rem;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
  font-style: normal;
}

.ap-swatch.is-on {
  border-color: #ea580c;
  background: #fff7ed;
}

.ap-features {
  display: grid;
  gap: 0.55rem;
}

.ap-feature-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.4rem;
  align-items: center;
}

.ap-feature-row__handle {
  color: #94a3b8;
  font-size: 0.75rem;
  letter-spacing: -0.08em;
  user-select: none;
}

.ap-feature-row__del {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid #fecaca;
  border-radius: 0.7rem;
  background: #fff;
  color: #b91c1c;
  cursor: pointer;
}

.ap-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}

.ap-upload {
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  padding: 1.35rem 1rem;
  border-radius: 0.95rem;
  border: 1.5px dashed #cbd5e1;
  background: #f8fafc;
  text-align: center;
  cursor: pointer;
}

.ap-upload i {
  color: var(--dash-ember, #c45c26);
  font-size: 1.35rem;
}

.ap-upload strong {
  font-size: 0.84rem;
  color: #0f172a;
}

.ap-upload em {
  font-style: normal;
  font-size: 0.72rem;
  color: #94a3b8;
}

.ap-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.ap-gallery figure {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 0.85rem;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.ap-gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  padding: 0.35rem;
}

.ap-gallery__badge {
  position: absolute;
  top: 0.4rem;
  inset-inline-start: 0.4rem;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: #ea580c;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
}

.ap-gallery__tools {
  display: flex;
  gap: 0.25rem;
  padding: 0.3rem;
}

.ap-gallery__tools button {
  flex: 1;
  min-height: 1.85rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
}

.ap-gallery__tools .is-danger {
  color: #b91c1c;
  border-color: #fecaca;
}

.ap-publish {
  gap: 0.65rem;
}

.ap-switch {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: #334155;
}

.ap-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.65rem;
  padding: 0.55rem 1rem;
  border-radius: 0.8rem;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  border: 0;
}

.ap-btn--primary {
  background: #ea580c;
  color: #fff;
  box-shadow: 0 10px 22px rgba(234, 88, 12, 0.22);
}

.ap-btn--primary:hover:not(:disabled) {
  background: #c2410c;
}

.ap-btn--primary:disabled {
  opacity: 0.65;
  cursor: wait;
}

.ap-btn--ghost {
  border: 1px solid var(--dash-line, #e8ecef);
  background: #fff;
  color: #334155;
}

.ap-btn--soft {
  border: 1px solid #fdba74;
  background: #fff7ed;
  color: #c2410c;
}

.ap-btn--block {
  width: 100%;
}

@media (min-width: 640px) {
  .ap-select-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ap-price-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ap-gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .ap {
    padding-bottom: 1.25rem;
  }

  .ap-top__actions--desk {
    display: flex;
  }

  .ap-top__actions--mobile {
    display: none;
  }

  .ap-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.78fr);
    align-items: start;
    gap: 1rem;
  }

  .ap-side {
    order: 2;
    align-self: start;
  }

  .ap-main {
    order: 1;
  }

  .ap-side {
    position: sticky;
    top: 5.25rem;
  }

  .ap-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .ap-grid {
    grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.7fr);
  }
}
</style>
