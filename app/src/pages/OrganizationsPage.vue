<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Организации</q-toolbar-title>
        <q-space />

        <q-btn
          flat
          color="primary"
          icon="add"
          label="Добавить организацию"
          @click="
            resetForm();
            addDialog = true;
          "
        />
      </teleport>

      <div class="q-pa-md">
        <q-table
          :grid="$q.screen.xs"
          flat
          bordered
          title="Организации"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          no-data-label="Данные не найдены или еще не загружены"
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
            <q-td :props="props" class="text-center">
              <div class="q-gutter-sm">
                <q-btn
                  outline
                  square
                  class="q-pa-xs rounded-borders"
                  color="primary"
                  icon="edit"
                  size="10px"
                  :disable="!!props.row.deleted_at"
                  @click="editOrg(props.row)"
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
                  :disable="!!props.row.deleted_at"
                  @click="deleteOrg(props.row.id)"
                >
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-page>

    <q-dialog v-model="addDialog" persistent @hide="resetForm">
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Изменить' : 'Добавить' }} организацию</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newOrg.name"
            label="Название"
            dense
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
          <q-input v-model="newOrg.comment" label="Описание" type="textarea" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="resetForm" />
          <q-btn flat label="Сохранить" color="primary" @click="saveOrg" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useOrganizationsStore } from '../stores/organizations';
import type { Organization, CreateOrganizationDto } from '../models/Organization';

const $q = useQuasar();
const organizationsStore = useOrganizationsStore();
const isMounted = ref(false);
const filter = ref('');
const addDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);
const newOrg = ref<CreateOrganizationDto>({ name: '', comment: '' });

const rows = computed(() => organizationsStore.items);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Название', field: 'name', align: 'left', sortable: true },
  { name: 'comment', label: 'Описание', field: 'comment', align: 'left' },
  {
    name: 'created_at',
    label: 'Создано',
    field: 'created_at',
    align: 'center',
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '-'),
  },
  {
    name: 'updated_at',
    label: 'Обновлено',
    field: 'updated_at',
    align: 'center',
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '-'),
  },
  { name: 'deleted_at', label: 'Статус', field: 'deleted_at', align: 'center' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'center' },
];

async function saveOrg() {
  if (isEdit.value && editId.value) {
    await organizationsStore.editOrganization(editId.value, newOrg.value);
  } else {
    await organizationsStore.addOrganization(newOrg.value);
  }
  resetForm();
}

async function confirmDelete(id: string) {
  await organizationsStore.removeOrganization(id);
}

function deleteOrg(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить эту организацию?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(id);
  });
}

function editOrg(row: Organization) {
  isEdit.value = true;
  editId.value = row.id;
  newOrg.value = {
    name: row.name,
    comment: row.comment ?? '',
  };
  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newOrg.value = { name: '', comment: '' };
}

onMounted(() => {
  isMounted.value = true;
  void organizationsStore.fetchOrganizations();
});
</script>
