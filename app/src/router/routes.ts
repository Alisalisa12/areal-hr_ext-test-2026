import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/departments',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/DepartmentsPage.vue') }],
  },
  {
    path: '/positions',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/PositionsPage.vue') }],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/OrganizationsPage.vue') }],
  },
  {
    path: '/employees',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/EmployeesPage.vue') }],
  },
  {
    path: '/hr-operation',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/HrOperations.vue') }],
  },
  {
    path: '/log',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [{ path: '', component: () => import('pages/AuditLogPage.vue') }],
  },
  {
    path: '/doc',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/FilesPage.vue') }],
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [{ path: '', component: () => import('pages/UsersPage.vue') }],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
