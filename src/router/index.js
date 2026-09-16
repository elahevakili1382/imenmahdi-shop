import { createRouter, createWebHistory } from 'vue-router'
import { bootApp } from '@/services/boot'
import { useAuthStore } from '@/stores/authStore'
import { applySeo, setJsonLd } from '@/utils/seo'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/ShopLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: 'ایمن یاب | تجهیزات ایمنی و آتش‌نشانی',
          description:
            'خرید تجهیزات حفاظت فردی، آتش‌نشانی و ایمنی صنعتی از ایمن یاب با ارسال تهران و شهرستان.',
        },
      },
      {
        path: 'products',
        name: 'ProductsApp',
        component: () => import('@/views/ProductsApp.vue'),
        meta: {
          title: 'کاتالوگ محصولات',
          description: 'مشاهده و فیلتر کاتالوگ تجهیزات ایمنی، PPE و آتش‌نشانی ایمن یاب.',
        },
      },
      {
        path: 'products/category/:categorySlug',
        name: 'ProductCategory',
        component: () => import('@/views/ProductCategory.vue'),
        meta: { seoDynamic: true },
      },
      {
        path: 'products/:slug',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: { seoDynamic: true },
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: { title: 'سبد خرید', noIndex: true },
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { requiresAuth: true, requiresProfile: true, title: 'تسویه حساب', noIndex: true },
      },
      {
        path: 'contact',
        name: 'ContactView',
        component: () => import('@/views/ContactView.vue'),
        meta: {
          title: 'تماس با ما',
          description: 'راه‌های ارتباط با فروشگاه تجهیزات ایمنی ایمن یاب.',
        },
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/LoginApp.vue'),
        meta: { title: 'ورود', noIndex: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/RegisterApp.vue'),
        meta: { title: 'ثبت‌نام', noIndex: true },
      },
      {
        path: 'account',
        component: () => import('@/layouts/AccountLayout.vue'),
        meta: { requiresAuth: true, noIndex: true, title: 'حساب کاربری' },
        children: [
          { path: '', name: 'Account', component: () => import('@/views/Account.vue') },
          {
            path: 'orders',
            name: 'AccountOrders',
            component: () => import('@/views/AccountOrders.vue'),
            meta: { title: 'سفارش‌های من' },
          },
          {
            path: 'profile',
            name: 'AccountProfile',
            component: () => import('@/views/AccountProfile.vue'),
            meta: { title: 'پروفایل' },
          },
        ],
      },
      {
        path: 'staff',
        name: 'StaffLogin',
        component: () => import('@/views/StaffLogin.vue'),
        meta: { title: 'ورود کارکنان', noIndex: true },
      },
      {
        path: 'orders/:id',
        name: 'OrderTracking',
        component: () => import('@/views/OrderTracking.vue'),
        meta: { requiresAuth: true, noIndex: true, title: 'پیگیری سفارش' },
      },
      {
        path: 'orders/:id/pay',
        name: 'OrderStatus',
        component: () => import('@/views/OrderStatus.vue'),
        meta: { requiresAuth: true, noIndex: true, title: 'پرداخت و رسید' },
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, noIndex: true, title: 'داشبورد' },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/dashboard/DashboardHome.vue') },
      { path: 'orders', name: 'DashboardOrders', component: () => import('@/views/dashboard/Orders.vue') },
      { path: 'profile', name: 'DashboardProfile', component: () => import('@/views/dashboard/Profile.vue') },
      {
        path: 'admin/orders',
        name: 'AdminOrders',
        component: () => import('@/views/dashboard/AdminOrders.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/receipts',
        name: 'AdminReceipts',
        component: () => import('@/views/dashboard/AdminReceipts.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/products',
        name: 'AdminProducts',
        component: () => import('@/views/dashboard/AdminProducts.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/hero',
        name: 'AdminHero',
        component: () => import('@/views/dashboard/AdminHero.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/guarantee',
        name: 'AdminGuarantee',
        component: () => import('@/views/dashboard/AdminGuarantee.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/shipping',
        name: 'AdminShipping',
        component: () => import('@/views/dashboard/AdminShipping.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/leads',
        name: 'AdminLeads',
        component: () => import('@/views/dashboard/AdminLeads.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/reviews',
        name: 'AdminReviews',
        component: () => import('@/views/dashboard/AdminReviews.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/sms',
        name: 'AdminSms',
        component: () => import('@/views/dashboard/AdminSms.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/settings',
        name: 'AdminSettings',
        component: () => import('@/views/dashboard/AdminSettings.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: '/cart/invoice',
    name: 'CartInvoice',
    component: () => import('@/views/CartInvoice.vue'),
    meta: { requiresAuth: true, requiresProfile: true, noIndex: true, title: 'پیش‌فاکتور' },
  },
  {
    path: '/invoice/:id',
    name: 'Invoice',
    component: () => import('@/views/InvoiceView.vue'),
    meta: { requiresAuth: true, noIndex: true, title: 'فاکتور' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes,
})

function seoPath(fullPath) {
  const base = import.meta.env.BASE_URL || '/'
  if (fullPath.startsWith(base)) return fullPath
  return `${base.replace(/\/$/, '')}${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`
}

router.beforeEach(async (to) => {
  await bootApp()
  const auth = useAuthStore()
  auth.ensureFreshSession()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresProfile && auth.isLoggedIn && !auth.profileComplete) {
    return { name: 'AccountProfile', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'Account' }
  }
  if (auth.isLoggedIn && !auth.isAdmin && to.path.startsWith('/dashboard')) {
    if (to.name === 'DashboardOrders') return { name: 'AccountOrders' }
    if (to.name === 'DashboardProfile') return { name: 'AccountProfile' }
    return { name: 'Account' }
  }
  if (to.name === 'DashboardOrders') return { name: 'AccountOrders' }
  if (to.name === 'DashboardProfile') return { name: 'AccountProfile' }
  if ((to.name === 'Login' || to.name === 'StaffLogin' || to.name === 'Register') && auth.isLoggedIn) {
    return to.name === 'StaffLogin' && auth.isAdmin
      ? { name: 'Dashboard' }
      : { name: auth.isAdmin ? 'Dashboard' : 'Account' }
  }
  return true
})

router.afterEach((to) => {
  if (to.meta.seoDynamic) return

  const nearest = [...to.matched]
    .reverse()
    .find((record) => record.meta?.title || record.meta?.description || record.meta?.noIndex)

  applySeo({
    title: to.meta.title || nearest?.meta?.title,
    description: to.meta.description || nearest?.meta?.description,
    path: seoPath(to.fullPath),
    noIndex: Boolean(to.meta.noIndex || nearest?.meta?.noIndex),
  })

  if (to.name !== 'ProductDetail') {
    setJsonLd('product-jsonld', null)
  }
})

export default router
