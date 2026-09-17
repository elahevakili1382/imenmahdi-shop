<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold">مدیریت محصولات</h1>
        <p class="text-sm text-slate-400 mt-1">{{ store.products.length }} کالا در کاتالوگ</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost border-white/15 min-h-10 text-sm" @click="reset">کاتالوگ پیش‌فرض</button>
        <button class="btn btn-primary min-h-10 text-sm" @click="openCreate">افزودن محصول</button>
      </div>
    </div>

    <input
      v-model="query"
      class="w-full mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
      placeholder="جستجوی نام یا دسته"
    />

    <div class="space-y-3">
      <article
        v-for="product in visible"
        :key="product.id"
        class="dash-card flex gap-4 items-center"
      >
        <img :src="asset(product.image)" alt="" class="w-16 h-16 rounded-xl object-contain bg-white/5" />
        <div class="flex-1 min-w-0">
          <p class="font-bold truncate">{{ product.title }}</p>
          <p class="text-sm text-slate-400">
            {{ product.category }} · موجودی {{ product.stock }} · {{ displayPrice(product) }}
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button class="btn btn-ghost border-white/15 min-h-10 px-3 text-sm" @click="openEdit(product)">
            ویرایش
          </button>
          <button class="btn btn-ghost border-red-400/40 text-red-300 min-h-10 px-3 text-sm" @click="remove(product)">
            حذف
          </button>
        </div>
      </article>
    </div>

    <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" @click.self="editing = null">
      <form class="product-form w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-4" @submit.prevent="save">
        <h2 class="text-xl font-bold">{{ form.id ? 'ویرایش محصول' : 'محصول جدید' }}</h2>
        <label class="field-label">
          <span>نام محصول</span>
          <input v-model="form.title" class="admin-field" required placeholder="نام کالا را بنویسید" />
        </label>
        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">قیمت</legend>
          <label class="flex items-start gap-2 text-sm leading-6">
            <input v-model="form.priceOnRequest" type="checkbox" class="mt-1" />
            <span>قیمت ندارد؛ روی سایت نوشته شود «جهت خرید تماس بگیرید»</span>
          </label>
          <p v-if="form.priceOnRequest" class="price-preview">نمایش روی سایت: جهت خرید تماس بگیرید</p>
          <label v-else class="field-label">
            <span>مبلغ (تومان)</span>
            <input v-model.number="form.price" class="admin-field" type="number" min="0" required />
          </label>
        </fieldset>
        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">دسته‌بندی</legend>
          <label class="field-label">
            <span>انتخاب دسته</span>
            <select v-model="form.category" class="admin-field">
              <option v-for="group in store.categories" :key="group.slug" :value="group.name">{{ group.name }}</option>
              <option :value="NEW_CATEGORY">+ افزودن دسته جدید</option>
            </select>
          </label>
          <div v-if="isNewCategory" class="new-cat-panel">
            <label class="field-label">
              <span>نام دسته جدید</span>
              <input v-model="newCategoryName" class="admin-field" placeholder="مثلاً تجهیزات آزمایشگاهی" />
            </label>
            <label class="field-label">
              <span>زیردسته (اختیاری)</span>
              <input v-model="newSubcategoryName" class="admin-field" placeholder="اگر خالی بماند همان نام دسته است" />
            </label>
          </div>
          <label v-else class="field-label">
            <span>زیردسته</span>
            <select v-model="form.subcategory" class="admin-field">
              <option v-for="child in subOptions" :key="child.slug" :value="child.name">{{ child.name }}</option>
            </select>
          </label>
        </fieldset>
        <label class="field-label">
          <span>موجودی</span>
          <input v-model.number="form.stock" class="admin-field" type="number" min="0" />
        </label>
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
            <input
              type="file"
              accept="image/*"
              multiple
              class="sr-only"
              @change="onFiles"
            />
            افزودن عکس
          </label>
        </fieldset>
        <label class="field-label">
          <span>توضیح</span>
          <textarea v-model="form.description" class="admin-field admin-field--area" placeholder="توضیح کوتاه برای صفحه محصول" />
        </label>
        <fieldset class="space-y-2">
          <legend class="text-sm font-bold">ویژگی‌ها</legend>
          <p class="text-xs text-slate-400">زیر قیمت در صفحه محصول نشان داده می‌شود.</p>
          <div v-for="(_, index) in form.features" :key="index" class="feature-row">
            <input
              v-model="form.features[index]"
              class="admin-field"
              :placeholder="`ویژگی ${index + 1}`"
            />
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
import { displayPrice } from '@/utils/money'
import { useToast } from 'vue-toastification'

const store = useProductStore()
const toast = useToast()
const query = ref('')
const editing = ref(null)
const form = reactive(emptyForm())
const newCategoryName = ref('')
const newSubcategoryName = ref('')
const NEW_CATEGORY = '__new__'
const MAX_PHOTOS = 8
const MAX_BYTES = 5 * 1024 * 1024

const isNewCategory = computed(() => form.category === NEW_CATEGORY)

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
    stock: 10,
    image: '',
    gallery: [],
    description: '',
    featured: false,
    popular: false,
    priceOnRequest: false,
    features: [''],
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
    stock: product.stock,
    image: gallery[0] || '',
    gallery,
    description: product.description,
    featured: Boolean(product.featured),
    popular: Boolean(product.popular),
    priceOnRequest: Boolean(product.priceOnRequest),
    features: product.features?.length ? [...product.features] : [''],
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

function save() {
  if (!form.gallery.length) {
    toast.error('حداقل یک عکس انتخاب کنید')
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
  store.upsert({
    ...form,
    category,
    subcategory,
    price: form.priceOnRequest ? 0 : form.price,
    priceOnRequest: Boolean(form.priceOnRequest),
    features: form.features.map((item) => String(item || '').trim()).filter(Boolean),
    image: form.gallery[0],
    gallery: [...form.gallery],
    sizes: form.id ? store.byId(form.id)?.sizes : ['یک سایز'],
  })
  toast.success('محصول ذخیره شد')
  editing.value = null
}

function remove(product) {
  if (!window.confirm(`حذف «${product.title}»؟`)) return
  store.remove(product.id)
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

.field-label > span {
  font-weight: 600;
}

.new-cat-panel {
  display: grid;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  border: 1px dashed #d6dde3;
  background: #f4f7f9;
}

.price-preview {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--dash-ember, #c45c26);
  background: #fff7f1;
  border: 1px solid #f0d9c8;
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
}

.feature-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
