<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Журнал аудита</q-toolbar-title>
        <q-space />
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Поиск">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </teleport>

      <div class="q-pa-md">
        <q-table
          :grid="$q.screen.xs"
          flat
          bordered
          :rows="rows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          no-data-label="Данные не найдены или еще не загружены"
        >
          <template v-slot:body-cell-entity_type="props">
            <q-td :props="props">
              <q-badge color="primary" class="q-pa-xs">
                {{ getLabel(props.value) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-old_value="props">
            <q-td :props="props">
              <span style="color: var(--q-negative)">{{ props.value ?? '—' }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-new_value="props">
            <q-td :props="props">
              <span style="color: var(--q-positive)">{{ props.value ?? '—' }}</span>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useAuditLogStore } from '../stores/audit_log';
import { EntityTypeLabels, type EntityType } from '../models/AuditLog';

const $q = useQuasar();
const auditStore = useAuditLogStore();
const isMounted = ref(false);
const filter = ref('');

const rows = computed(() => auditStore.items);

const columns: QTableColumn[] = [
  {
    name: 'created_at',
    label: 'Дата',
    field: 'created_at',
    align: 'center',
    sortable: true,
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '—'),
  },
  {
    name: 'entity_type',
    label: 'Сущность',
    field: 'entity_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'field_name',
    label: 'Поле',
    field: 'field_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'old_value',
    label: 'Было',
    field: 'old_value',
    align: 'left',
  },
  {
    name: 'new_value',
    label: 'Стало',
    field: 'new_value',
    align: 'left',
  },
];

function getLabel(type: EntityType): string {
  return EntityTypeLabels[type] || type;
}

onMounted(() => {
  isMounted.value = true;
  void auditStore.fetchAuditLogs();
});
</script>
