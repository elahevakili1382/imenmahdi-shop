<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">مدیریت محصولات</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.products.length }} کالا در کاتالوگ</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary min-h-10 text-sm" @click="openCreate">افزودن محصول</button>
      </div>
    </div>

    <input v-model="query" class="w-full mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      placeholder="جستجوی نام یا دسته" />

    <div class="space-y-3">
      <article v-for="product in visible" :key="product.id" class="dash-card flex gap-4 items-center">
        <img :src="asset(product.image)" alt="" class="w-16 h-16 rounded-xl object-contain bg-white/5" />
        <div class="flex-1 min-w-0">
          <p class="font-bold truncate">{{ product.title }}</p>
          <p class="text-sm text-slate-400">
            {{ product.category }} · {{ product.stock }} · {{ displayPrice(product) }}
            <span v-if="product.sizes?.length"> · سایز: {{ product.sizes.join('، ') }}</span>
          </p>
        </div>
        <div class="product-actions">
          <button class="icon-btn" type="button" aria-label="ویرایش" title="ویرایش" @click="openEdit(product)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448l-3-3l-9.452 9.448a.5.5 0 0 0-.147.353m10.837-11.04l3 3l1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0z"
              />
            </svg>
          </button>
          <button class="icon-btn icon-btn--danger" type="button" aria-label="حذف" title="حذف" @click="remove(product)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5"
              />
            </svg>
          </button>
        </div>
      </article>
    </div>

    <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" @click.self="editing = null">
      <form class="product-form w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4"
        @submit.prevent="save">
        <h2 class="text-xl font-bold">{{ form.id ? 'ویرایش محصول' : 'محصول جدید' }}</h2>
        <label class="field-label">
          <span>نام محصول</span>
          <input v-model="form.title" class="admin-field" required placeholder="نام کالا را بنویسید" />
        </label>
        <fieldset class="price-panel">
          <legend class="price-panel__title">قیمت</legend>
          <label class="price-panel__check">
            <input v-model="form.priceOnRequest" type="checkbox" />
            <span>قیمت ندارد؛ روی سایت نوشته شود «جهت خرید تماس بگیرید»</span>
          </label>
          <div v-if="form.priceOnRequest" class="price-panel__call">
            <span class="price-panel__call-label">نمایش روی سایت</span>
            <strong>جهت خرید تماس بگیرید</strong>
          </div>
          <label v-else class="price-panel__amount">
            <span>مبلغ (تومان)</span>
            <div class="price-panel__input-wrap">
              <input v-model="priceInput" class="admin-field admin-field--price" type="text" inputmode="numeric"
                required placeholder="مثلاً 1,250,000" />
            </div>
          </label>
          <label v-if="!form.priceOnRequest" class="price-panel__amount">
            <span>تخفیف (درصد)</span>
            <input
              v-model.number="form.discountPercent"
              class="admin-field"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="مثلاً ۲۰"
            />
            <p v-if="form.discountPercent > 0 && form.price > 0" class="price-panel__discount-hint">
              قیمت بعد از تخفیف:
              {{ formatPrice(Math.round((Number(form.price) || 0) * (100 - Math.min(100, Math.max(0, Number(form.discountPercent) || 0))) / 100)) }}
              تومان
            </p>
          </label>
        </fieldset>

        <fieldset class="stock-panel">
          <legend class="stock-panel__title">موجودی</legend>
          <p class="stock-panel__hint">
            عدد بنویس (مثلاً ۱۲) یا متن آزاد مثل «موجود در انبار فروشگاه» / «ناموجود».
          </p>
          <input v-model="form.stock" class="admin-field" type="text" required placeholder="موجود در انبار فروشگاه" />
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">دسته‌بندی</legend>

          <div class="cat-manage">
            <p class="cat-manage__label">دسته‌ها</p>
            <div
              v-for="group in store.categories"
              :key="group.slug"
              class="cat-manage__row"
              :class="{ 'is-active': form.category === group.name }"
            >
              <template v-if="editingCategory === group.name">
                <input v-model="editCategoryDraft" class="admin-field" @keydown.enter.prevent="commitCategoryEdit" />
                <button class="feature-row__remove" type="button" @click="commitCategoryEdit">ثبت</button>
                <button class="feature-row__remove" type="button" @click="cancelCategoryEdit">لغو</button>
              </template>
              <template v-else>
                <button class="cat-manage__name" type="button" @click="selectCategory(group.name)">
                  {{ group.name }}
                </button>
                <button class="icon-btn icon-btn--sm" type="button" title="ویرایش" aria-label="ویرایش دسته" @click="startCategoryEdit(group.name)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448l-3-3l-9.452 9.448a.5.5 0 0 0-.147.353m10.837-11.04l3 3l1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0z" />
                  </svg>
                </button>
                <button class="icon-btn icon-btn--sm icon-btn--danger" type="button" title="حذف" aria-label="حذف دسته" @click="deleteCategory(group.name)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path fill="currentColor" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" />
                  </svg>
                </button>
              </template>
            </div>
            <button class="file-btn" type="button" @click="form.category = NEW_CATEGORY">+ افزودن دسته جدید</button>
          </div>

          <div v-if="isNewCategory" class="new-cat-panel">
            <label class="field-label">
              <span>نام دسته جدید</span>
              <input v-model="newCategoryName" class="admin-field" placeholder="مثلاً تجهیزات آزمایشگاهی" />
            </label>
            <label class="field-label">
              <span>زیردسته (اختیاری)</span>
              <input v-model="newSubcategoryName" class="admin-field" placeholder="اگر خالی بماند همان نام دسته است" />
            </label>
            <button class="file-btn" type="button" @click="saveNewCategory">ذخیره دسته</button>
          </div>

          <div v-if="!isNewCategory && form.category" class="cat-manage">
            <p class="cat-manage__label">زیردسته‌های «{{ form.category }}»</p>
            <div
              v-for="child in subOptions"
              :key="child.slug"
              class="cat-manage__row"
              :class="{ 'is-active': form.subcategory === child.name }"
            >
              <template v-if="editingSubcategory === child.name">
                <input v-model="editSubDraft" class="admin-field" @keydown.enter.prevent="commitSubEdit" />
                <button class="feature-row__remove" type="button" @click="commitSubEdit">ثبت</button>
                <button class="feature-row__remove" type="button" @click="cancelSubEdit">لغو</button>
              </template>
              <template v-else>
                <button class="cat-manage__name" type="button" @click="form.subcategory = child.name">
                  {{ child.name }}
                </button>
                <button class="icon-btn icon-btn--sm" type="button" title="ویرایش" aria-label="ویرایش زیردسته" @click="startSubEdit(child.name)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448l-3-3l-9.452 9.448a.5.5 0 0 0-.147.353m10.837-11.04l3 3l1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0z" />
                  </svg>
                </button>
                <button class="icon-btn icon-btn--sm icon-btn--danger" type="button" title="حذف" aria-label="حذف زیردسته" @click="deleteSubcategory(child.name)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path fill="currentColor" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" />
                  </svg>
                </button>
              </template>
            </div>
            <button class="file-btn" type="button" @click="form.subcategory = NEW_SUBCATEGORY">+ افزودن زیردسته جدید</button>
          </div>

          <div v-if="!isNewCategory && isNewSubcategory" class="new-cat-panel">
            <label class="field-label">
              <span>نام زیردسته جدید</span>
              <input v-model="newSubcategoryName" class="admin-field" placeholder="مثلاً کلاه ایمنی صنعتی" />
            </label>
            <button class="file-btn" type="button" @click="saveNewSubcategory">ذخیره زیردسته</button>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">سایزها</legend>
          <p class="text-xs text-slate-400">
            سریع پر کن، بعد هر سایزی که لازم نیست حذف کن یا خودت یکی اضافه کن.
          </p>
          <div class="size-presets">
            <button class="size-preset-btn" type="button" @click="applySizePreset(SHOE_SIZES)">
              سایز کفش ۳۸–۴۷
            </button>
            <button class="size-preset-btn" type="button" @click="applySizePreset(CLOTHING_SIZES)">
              سایز لباس M–3XL
            </button>
          </div>
          <div v-for="(_, index) in form.sizes" :key="index" class="feature-row">
            <input v-model="form.sizes[index]" class="admin-field" :placeholder="`سایز ${index + 1} — مثلاً L یا ۴۲`" />
            <button class="feature-row__remove" type="button" @click="removeSize(index)">حذف</button>
          </div>
          <button class="file-btn" type="button" @click="addSize">افزودن سایز</button>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">عکس‌های محصول</legend>
          <p class="text-xs text-slate-400">چند فایل را با هم انتخاب کنید. اولین عکس جلد است.</p>
          <div v-if="form.gallery.length" class="gallery-picks">
            <figure v-for="(img, index) in form.gallery" :key="`${index}-${img.slice(-24)}`" class="gallery-pick">
              <img :src="asset(img)" alt="" />
              <span v-if="index === 0" class="gallery-pick__badge">جلد</span>
              <div class="gallery-pick__actions">
                <button v-if="index !== 0" type="button" @click="setCover(index)">جلد</button>
                <button type="button" class="is-danger" @click="removeImage(index)">حذف</button>
              </div>
            </figure>
          </div>
          <label class="file-btn">
            <input type="file" accept="image/*" multiple class="sr-only" @change="onFiles" />
            افزودن عکس
          </label>
        </fieldset>
        <label class="field-label">
          <span>توضیح</span>
          <textarea v-model="form.description" class="admin-field admin-field--area"
            placeholder="توضیح کوتاه برای صفحه محصول" />
        </label>
        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">ویژگی‌ها</legend>
          <p class="text-xs text-slate-400">زیر قیمت در صفحه محصول نشان داده می‌شود.</p>
          <div v-for="(_, index) in form.features" :key="index" class="feature-row">
            <input v-model="form.features[index]" class="admin-field" :placeholder="`ویژگی ${index + 1}`" />
            <button class="feature-row__remove" type="button" @click="removeFeature(index)">حذف</button>
          </div>
          <button class="file-btn" type="button" @click="addFeature">افزودن ویژگی</button>
        </fieldset>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.featured" type="checkbox" /> منتخب
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.popular" type="checkbox" /> پرفروش
        </label>
        <div class="flex gap-2 pt-2">
          <button class="btn btn-primary flex-1" type="submit">ذخیره</button>
          <button class="btn btn-ghost border-white/15 flex-1" type="button" @click="editing = null">انصراف</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { asset } from '@/utils/asset'
import { displayPrice, formatGroupedPrice, formatPrice, toNumber } from '@/utils/money'
import { useToast } from 'vue-toastification'

const store = useProductStore()
const toast = useToast()
const query = ref('')
const editing = ref(null)
const form = reactive(emptyForm())
const newCategoryName = ref('')
const newSubcategoryName = ref('')
const editingCategory = ref(null)
const editCategoryDraft = ref('')
const editingSubcategory = ref(null)
const editSubDraft = ref('')
const NEW_CATEGORY = '__new__'
const NEW_SUBCATEGORY = '__new_sub__'
const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024
const SHOE_SIZES = Array.from({ length: 10 }, (_, i) => String(38 + i))
const CLOTHING_SIZES = ['M', 'L', 'XL', '2XL', '3XL']

const isNewCategory = computed(() => form.category === NEW_CATEGORY)
const isNewSubcategory = computed(() => form.subcategory === NEW_SUBCATEGORY)

const priceInput = computed({
  get() {
    return formatGroupedPrice(form.price)
  },
  set(raw) {
    form.price = toNumber(raw)
  },
})

const visible = computed(() => {
  const q = query.value.trim()
  if (!q) return store.products
  return store.search(q)
})

const subOptions = computed(() => {
  const group = store.categories.find((item) => item.name === form.category)
  return group?.children || []
})

watch(
  () => form.category,
  () => {
    if (form.category === NEW_CATEGORY) return
    if (form.subcategory === NEW_SUBCATEGORY) return
    if (!subOptions.value.some((item) => item.name === form.subcategory)) {
      form.subcategory = subOptions.value[0]?.name || ''
    }
  },
)

function emptyForm() {
  return {
    id: '',
    title: '',
    price: 0,
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
    sizes: ['یک سایز'],
  }
}

function uniqueImages(list) {
  return [...new Set((list || []).filter(Boolean))]
}

function openCreate() {
  Object.assign(form, emptyForm())
  const first = store.categories[0]
  form.category = first?.name || ''
  form.subcategory = first?.children?.[0]?.name || form.category
  newCategoryName.value = ''
  newSubcategoryName.value = ''
  editing.value = true
}

function openEdit(product) {
  const gallery = uniqueImages([product.image, ...(product.gallery || [])])
  Object.assign(form, {
    id: product.id,
    title: product.title,
    price: product.price,
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
    sizes: product.sizes?.length ? [...product.sizes] : ['یک سایز'],
  })
  newCategoryName.value = ''
  newSubcategoryName.value = ''
  editing.value = true
}

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
  for (const url of urls) {
    if (!form.gallery.includes(url)) form.gallery.push(url)
  }
  form.image = form.gallery[0] || ''
  if (files.length > room) toast.error(`فقط ${room} عکس دیگر جا داشت`)
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

function addFeature() {
  form.features.push('')
}

function removeFeature(index) {
  form.features.splice(index, 1)
  if (!form.features.length) form.features.push('')
}

function addSize() {
  form.sizes.push('')
}

function removeSize(index) {
  form.sizes.splice(index, 1)
  if (!form.sizes.length) form.sizes.push('یک سایز')
}

function applySizePreset(list) {
  form.sizes = [...list]
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

function selectCategory(name) {
  form.category = name
  const kids = store.categories.find((item) => item.name === name)?.children || []
  if (!kids.some((item) => item.name === form.subcategory)) {
    form.subcategory = kids[0]?.name || name
  }
}

function startCategoryEdit(name) {
  editingCategory.value = name
  editCategoryDraft.value = name
  editingSubcategory.value = null
}

function cancelCategoryEdit() {
  editingCategory.value = null
  editCategoryDraft.value = ''
}

function commitCategoryEdit() {
  const oldName = editingCategory.value
  const next = editCategoryDraft.value.trim()
  if (!oldName) return
  if (!next) {
    toast.error('نام دسته را بنویسید')
    return
  }
  const ok = store.renameCategory(oldName, next)
  if (!ok) {
    toast.error('این نام دسته از قبل هست')
    return
  }
  if (form.category === oldName) form.category = next
  cancelCategoryEdit()
  toast.success('دسته ویرایش شد')
}

function deleteCategory(name) {
  if (!window.confirm(`حذف دسته «${name}»؟ محصولاتش به دسته دیگر منتقل می‌شوند.`)) return
  store.removeCategory(name)
  if (form.category === name) {
    const first = store.categories[0]
    form.category = first?.name || ''
    form.subcategory = first?.children?.[0]?.name || form.category
  }
  toast.success('دسته حذف شد')
}

function startSubEdit(name) {
  editingSubcategory.value = name
  editSubDraft.value = name
  editingCategory.value = null
}

function cancelSubEdit() {
  editingSubcategory.value = null
  editSubDraft.value = ''
}

function commitSubEdit() {
  const oldName = editingSubcategory.value
  const next = editSubDraft.value.trim()
  if (!oldName || !form.category) return
  if (!next) {
    toast.error('نام زیردسته را بنویسید')
    return
  }
  const ok = store.renameSubcategory(form.category, oldName, next)
  if (!ok) {
    toast.error('این زیردسته از قبل هست')
    return
  }
  if (form.subcategory === oldName) form.subcategory = next
  cancelSubEdit()
  toast.success('زیردسته ویرایش شد')
}

function deleteSubcategory(name) {
  if (!form.category) return
  if (!window.confirm(`حذف زیردسته «${name}»؟`)) return
  store.removeSubcategory(form.category, name)
  if (form.subcategory === name) {
    form.subcategory = subOptions.value[0]?.name || form.category
  }
  toast.success('زیردسته حذف شد')
}

async function save() {
  if (!form.gallery.length) {
    toast.error('حداقل یک عکس انتخاب کنید')
    return
  }
  if (!String(form.stock ?? '').trim()) {
    toast.error('موجودی را بنویسید (عدد یا متن)')
    return
  }
  const sizes = form.sizes.map((item) => String(item || '').trim()).filter(Boolean)
  if (!sizes.length) {
    toast.error('حداقل یک سایز بنویسید')
    return
  }
  let category = form.category
  let subcategory = form.subcategory
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
  const result = await store.upsert({
    ...form,
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
    image: form.gallery[0],
    gallery: [...form.gallery],
  })
  if (!result?.product) {
    toast.error('محصول ذخیره نشد')
    return
  }
  if (!result.persist?.ok) {
    if (result.persist?.reason === 'offline') {
      toast.error('API خاموش است یا ادمین نیستی؛ محصول ممکن است بعداً بپرد. API را روشن کن و دوباره ذخیره کن.')
    } else {
      toast.error(result.persist?.message || 'روی سرور ذخیره نشد؛ صفحه را نبند و دوباره ذخیره کن.')
    }
    return
  }
  toast.success('محصول ذخیره شد')
  editing.value = null
}

async function remove(product) {
  if (!window.confirm(`حذف «${product.title}»؟`)) return
  const persist = await store.remove(product.id)
  if (persist && persist.ok === false && persist.reason === 'api') {
    toast.error(persist.message || 'حذف روی سرور کامل نشد')
    return
  }
  toast.success('حذف شد')
}

function reset() {
  if (!window.confirm('کاتالوگ به حالت اولیه برگردد؟')) return
  store.resetCatalog()
  toast.success('کاتالوگ بازنشانی شد')
}
</script>

<style scoped>
.product-form {
  background: #fff;
  color: var(--dash-text, #0f172a);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.product-actions {
  display: flex;
  gap: 0.45rem;
  flex-shrink: 0;
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 12px;
  border: 1px solid #d9e0e6;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
}

.icon-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.icon-btn--danger {
  color: #b91c1c;
  border-color: #f0d0d0;
}

.icon-btn--danger:hover {
  background: #fff5f5;
  border-color: #fca5a5;
}

.icon-btn svg {
  display: block;
  flex-shrink: 0;
}

.admin-field {
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #d9e0e6;
  background: #f7f9fb;
  padding: 12px 14px;
  color: var(--dash-text, #0f172a);
}

.admin-field::placeholder {
  color: #94a3b8;
}

.admin-field:focus {
  outline: 2px solid var(--dash-primary, #1b8f5a);
  outline-offset: 1px;
  border-color: transparent;
  background: #fff;
}

.admin-field:disabled {
  background: #f1f5f9;
  color: #64748b;
}

.admin-field--price {
  direction: ltr;
  text-align: left;
  font-variant-numeric: tabular-nums;
  padding-inline-end: 3.5rem;
}

.price-panel,
.stock-panel {
  margin: 0;
  padding: 1rem 1.05rem 1.1rem;
  border-radius: 18px;
  border: 1px solid #e4ebf0;
  background:
    linear-gradient(180deg, #fbfcfd 0%, #f4f7f9 100%);
}

.price-panel {
  border-color: #d9ebe2;
  background:
    radial-gradient(circle at top left, rgba(27, 143, 90, 0.08), transparent 55%),
    linear-gradient(180deg, #f7fbf9 0%, #f3f7f5 100%);
}

.stock-panel {
  border-color: #e8dfd4;
  background:
    radial-gradient(circle at top left, rgba(196, 92, 38, 0.08), transparent 55%),
    linear-gradient(180deg, #fcf8f4 0%, #f7f2ec 100%);
}

.price-panel__title,
.stock-panel__title {
  padding-inline: 0.35rem;
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--dash-text, #0f172a);
}

.price-panel__check {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  margin-top: 0.35rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #334155;
}

.price-panel__check input {
  margin-top: 0.25rem;
}

.price-panel__call {
  display: grid;
  gap: 0.2rem;
  margin-top: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid #f0d9c8;
  background: #fff7f1;
}

.price-panel__call-label {
  font-size: 0.75rem;
  color: #9a6a4d;
}

.price-panel__call strong {
  color: var(--dash-ember, #c45c26);
  font-size: 0.95rem;
}

.price-panel__discount-hint {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1b8f5a;
}

.price-panel__amount {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.85rem;
  font-size: 0.875rem;
}

.price-panel__amount>span,
.stock-panel__hint {
  font-weight: 600;
  color: #475569;
}

.price-panel__input-wrap {
  position: relative;
}

.price-panel__input-wrap em {
  position: absolute;
  inset-inline-end: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-style: normal;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  pointer-events: none;
}

.stock-panel__hint {
  margin: 0.35rem 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.6;
  color: #7c6a5a;
}

.admin-field--area {
  min-height: 6.5rem;
  resize: vertical;
}

.field-label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: var(--dash-text, #0f172a);
}

.field-label>span {
  font-weight: 600;
}

.icon-btn--sm {
  width: 2rem;
  height: 2rem;
  border-radius: 10px;
}

.cat-manage {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  border: 1px solid #e4ebf0;
  background: #f8fafc;
}

.cat-manage__label {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.cat-manage__row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.4rem;
  padding: 0.2rem 0.35rem;
  border-radius: 10px;
}

.cat-manage__row.is-active {
  background: rgba(27, 143, 90, 0.1);
}

.cat-manage__name {
  flex: 1;
  min-width: 0;
  text-align: right;
  padding: 0.35rem 0.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.cat-manage__row .admin-field {
  flex: 1;
  min-height: 2.2rem;
  padding: 0.4rem 0.7rem;
}

.new-cat-panel {
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px dashed #d6dde3;
  background: #f4f7f9;
}

.feature-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.size-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.size-preset-btn {
  min-height: 2.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #d6dde3;
  background: #fff;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.size-preset-btn:hover {
  border-color: var(--dash-primary, #1b8f5a);
  color: var(--dash-primary, #1b8f5a);
}

.feature-row__remove {
  flex-shrink: 0;
  min-height: 44px;
  padding: 0 0.85rem;
  border-radius: 12px;
  border: 1px solid #f0d0d0;
  background: #fff;
  color: #b42318;
  font-size: 0.8rem;
  font-weight: 700;
}

.gallery-picks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.55rem;
}

.gallery-pick {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.gallery-pick img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  padding: 0.35rem;
}

.gallery-pick__badge {
  position: absolute;
  top: 6px;
  inset-inline-start: 6px;
  border-radius: 999px;
  background: #c45c26;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
}

.gallery-pick__actions {
  display: flex;
  gap: 0.25rem;
  padding: 0.3rem;
}

.gallery-pick__actions button {
  flex: 1;
  min-height: 2rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  font-size: 0.68rem;
}

.gallery-pick__actions .is-danger {
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px dashed rgba(196, 164, 132, 0.45);
  color: #c4a484;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.file-btn:focus-within {
  outline: 2px solid #c45c26;
  outline-offset: 2px;
}
</style>
