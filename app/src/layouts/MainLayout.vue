<template>
  <q-layout view="lhh LpR fFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar>
        <div id="header-actions" class="row items-center q-gutter-x-md" style="flex: 1"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="260" :breakpoint="500" class="bg-primary">
      <q-list padding class="menu-list">
        <q-item-label header class="text-white text-h6 items-center">
          <q-icon name="people" class="q-mr-md" size="sm" />
          Учет сотрудников
        </q-item-label>
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
];
</script>
