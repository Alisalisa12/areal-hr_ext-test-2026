<template>
  <q-layout view="lhh LpR fFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar>
        <div id="header-actions" class="row items-center q-gutter-x-md" style="flex: 1"></div>
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
import NavLink from '../components/nav/NavLink.vue';
const drawer = ref(false);
const navLinks = [
  {
    title: 'Структура',
    links: [
      { title: 'Организации', icon: 'business', link: '/' },
      { title: 'Отделы', icon: 'work_outline', link: '/dep' },
      { title: 'Должности', icon: 'badge', link: '/pos' },
    ],
  },
  {
    title: 'Управление',
    links: [
      { title: 'Сотрудники', icon: 'group', link: '/emp' },
      { title: 'Файлы', icon: 'folder_open', link: '/doc' },
      { title: 'HR операции', icon: 'swap_horiz', link: '/hr' },
      { title: 'Логи', icon: 'history', link: '/log' },
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
