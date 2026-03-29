<template>
  <q-page padding>
    <teleport to="#header-actions" v-if="isMounted">
      <q-toolbar-title>Организации</q-toolbar-title>
      <q-space />
      <q-btn flat color="primary" icon="add" label="Добавить организацию" />
    </teleport>

    <div class="q-pa-md">
      <q-table
        :grid="$q.screen.xs"
        flat
        bordered
        title="Организации"
        :rows="rows"
        :columns="columns"
        row-key="name"
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Поиск">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-deleted_at="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.value ? 'negative' : 'positive'" class="q-pa-xs">
              {{ props.value ? 'Удалена' : 'Активна' }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="q-gutter-sm">
              <q-btn
                outline
                square
                class="q-pa-xs rounded-borders"
                color="info"
                icon="search"
                size="10px"
              >
                <q-tooltip>Просмотр</q-tooltip>
              </q-btn>

              <q-btn
                outline
                square
                class="q-pa-xs rounded-borders"
                color="primary"
                icon="edit"
                size="10px"
              >
                <q-tooltip>Изменить</q-tooltip>
              </q-btn>

              <q-btn
                outline
                square
                class="q-pa-xs rounded-borders"
                color="negative"
                icon="delete"
                size="10px"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { date, type QTableColumn } from 'quasar';
const filter = ref('');
const isMounted = ref(false);
const rows = ref([]);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'comment', label: 'Описание', field: 'comment', align: 'left' },
  {
    name: 'created_at',
    label: 'Создано',
    field: 'created_at',
    align: 'center',
    format: (val) => (val ? date.formatDate(val, 'DD.MM.YYYY HH:mm') : '-'),
  },
  {
    name: 'updated_at',
    label: 'Обновлено',
    field: 'updated_at',
    align: 'center',
    format: (val) => (val ? date.formatDate(val, 'DD.MM.YYYY HH:mm') : '-'),
  },
  { name: 'deleted_at', label: 'Статус', field: 'deleted_at', align: 'center' },
  {
    name: 'actions',
    label: 'Действия',
    field: 'actions',
  },
];

async function loadData() {
  try {
    const response = await fetch('/api/organizations');
    if (response.ok) {
      rows.value = await response.json();
    } else {
      console.error('Ошибка сервера:', response.status);
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
  }
}

onMounted(() => {
  isMounted.value = true;
  loadData().catch(console.error);
});
</script>
