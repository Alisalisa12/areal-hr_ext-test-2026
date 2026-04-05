import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/dep',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DepartmentsPage.vue') }],
  },
  {
    path: '/pos',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/PositionsPage.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/OrganizationsPage.vue') }],
  },
  {
    path: '/emp',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/EmployeesPage.vue') }],
  },
  {
    path: '/hr',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/HrOperations.vue') }],
  },
  {
    path: '/log',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/AuditLogPage.vue') }],
  },
  {
    path: '/doc',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/FilesPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
