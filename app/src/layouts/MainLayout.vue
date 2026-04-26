<template>
  <q-layout view="lhh LpR fFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar>
        <div id="header-actions" class="row items-center q-gutter-x-md" style="flex: 1"></div>

        <div class="row items-center q-gutter-x-sm">
          <q-chip
            outline
            color="primary"
            icon="person"
            :label="authStore.user?.login ?? ''"
            class="q-ma-none"
          />
          <q-btn
            flat
            round
            color="negative"
            icon="logout"
            @click="handleLogout"
          >
            <q-tooltip>Выйти</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="260" :breakpoint="500">
      <q-list padding class="menu-list">
        <div class="q-px-md q-pt-md q-pb-sm">
          <div class="row items-center no-wrap">
            <q-avatar
              square
              size="38px"
              color="white"
              text-color="primary"
              icon="badge"
              class="rounded-borders q-mr-md"
            />
            <div class="column">
              <div class="text-white text-h6 text-weight-bolder" style="line-height: 1.1">
                Учет кадров
              </div>
              <div class="text-secondary text-caption text-uppercase opacity-80" style="font-size: 10px">
                Система управления
              </div>
            </div>
          </div>
        </div>

        <q-separator dark class="q-mb-sm bg-secondary q-mx-md" style="height: 1px; opacity: 0.2" />

        <template v-for="group in navLinks" :key="group.title">
          <q-item-label header class="text-secondary opacity-70 text-caption text-uppercase">
            {{ group.title }}
          </q-item-label>

          <NavLink v-for="link in group.links" :key="link.title" v-bind="link" />
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import NavLink from '../components/nav/NavLink.vue';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const drawer = ref(false);

function handleLogout() {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите выйти?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void performLogout();
  });
}

async function performLogout() {
  try {
    await authStore.logout();
    await router.push('/login');
  } catch (e) {
    console.error(e);
  }
}

const navLinks = [
  {
    title: 'Структура',
    links: [
      { title: 'Организации', icon: 'business', link: '/' },
      { title: 'Отделы', icon: 'work_outline', link: '/departments' },
      { title: 'Должности', icon: 'badge', link: '/positions' },
    ],
  },
  {
    title: 'Управление',
    links: [
      { title: 'Сотрудники', icon: 'group', link: '/employees' },
      { title: 'Файлы', icon: 'folder_open', link: '/doc' },
      { title: 'HR операции', icon: 'swap_horiz', link: '/hr-operation' },
      { title: 'Логи', icon: 'history', link: '/log' },
      { title: 'Пользователи', icon: 'person', link: '/users' },
    ],
  },
];
</script>

<style scoped>
:deep(.q-drawer) {
  background: transparent !important;
}

:deep(.q-drawer__content) {
  background: #7e7bec;
  border-radius: 0 24px 24px 0;
}
</style>
