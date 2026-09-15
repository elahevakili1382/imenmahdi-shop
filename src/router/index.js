import { createRouter, createWebHistory } from 'vue-router'
import { bootApp } from '@/services/boot'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/ShopLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/Home.vue') },
      { path: 'products', name: 'ProductsApp', component: () => import('@/views/ProductsApp.vue') },
      {
        path: 'products/category/:categorySlug',
        name: 'ProductCategory',
        component: () => import('@/views/ProductCategory.vue'),
      },
      {
        path: 'products/:slug',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
      },
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue') },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { requiresAuth: true },
      },
      { path: 'contact', name: 'ContactView', component: () => import('@/views/ContactView.vue') },
      { path: 'login', name: 'Login', component: () => import('@/views/LoginApp.vue') },
      { path: 'register', name: 'Register', component: () => import('@/views/RegisterApp.vue') },
      {
        path: 'account',
        component: () => import('@/layouts/AccountLayout.vue'),
        meta: { requiresAuth: true },
        children: [
          { path: '', name: 'Account', component: () => import('@/views/Account.vue') },
          { path: 'orders', name: 'AccountOrders', component: () => import('@/views/AccountOrders.vue') },
          { path: 'profile', name: 'AccountProfile', component: () => import('@/views/AccountProfile.vue') },
        ],
      },
      { path: 'staff', name: 'StaffLogin', component: () => import('@/views/StaffLogin.vue') },
      {
        path: 'orders/:id',
        name: 'OrderStatus',
        component: () => import('@/views/OrderStatus.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
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
    ],
  },
  {
    path: '/cart/invoice',
    name: 'CartInvoice',
    component: () => import('@/views/CartInvoice.vue'),
  },
  {
    path: '/invoice/:id',
    name: 'Invoice',
    component: () => import('@/views/InvoiceView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes,
})

router.beforeEach(async (to) => {
  await bootApp()
  const auth = useAuthStore()
  auth.ensureFreshSession()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
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

export default router
