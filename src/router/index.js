import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductsApp from '../views/ProductsApp.vue'
import ProductDetail from '../views/ProductDetail.vue'
import LoginApp from '../views/LoginApp.vue'
import CardShop from '../views/CardShop.vue'
import ContactView from '../views/ContactView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/products',
    name: 'ProductsApp',
    component: ProductsApp,
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true,
  },
  {
    path: '/login',
    name: 'LoginApp',
    component: LoginApp,
  },
  {
    path: '/card',
    name: 'CardShop',
    component: CardShop,
  },

  {
    path: '/contact',
    name: 'ContactView',
    component: ContactView,
  },
]

const router = createRouter({
  history: createWebHistory('/imenmahdi-shop/'),
  routes,
})

export default router
