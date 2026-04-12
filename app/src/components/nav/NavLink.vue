<template>
  <q-item clickable :to="link" active- active-class="my-active-item" class="text-white q-ma-sm rounded-borders">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});
</script>
<style scoped>
.q-item {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.my-active-item {
  background-color: white !important;
  color: #7e7bec !important;
  font-weight: bold;
}

.q-item:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.my-active-item:hover {
  background-color: white !important;
  opacity: 0.9;
}
</style>
