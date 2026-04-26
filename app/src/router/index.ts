import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth';

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to) => {

    const authStore = useAuthStore(store);

    if (to.path !== '/login' && !authStore.isAuthenticated) {
      return { path: '/login' };
    }

    if (to.path === '/login' && authStore.isAuthenticated) {
      return { path: '/' };
    }
  });

  return Router;
});
