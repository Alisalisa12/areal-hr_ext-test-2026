<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title class="text-subtitle1 text-weight-bold">Отделы</q-toolbar-title>
      </teleport>

      <div class="row items-stretch">
        <q-input v-model="filter" outlined rounded dense placeholder="Поиск" style="width: 260px">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />

        <q-select
          v-model="selectedOrgId"
          :options="organizationsStore.items.filter((o) => !o.deleted_at)"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          label="Организация"
          standout="bg-primary text-white"
          bg-color="primary"
          label-color="white"
          dense
          rounded
          clearable
          options-dense
          style="min-width: 200px"
          class="text-caption q-mr-sm custom-select-white"
          @update:model-value="loadDepartments"
          )
        />

        <q-btn
          color="primary"
          icon="add"
          rounded
          class="text-caption"
          label="Добавить отдел"
          :disable="!selectedOrgId"
          @click="
            resetForm();
            addDialog = true;
          "
        />
      </div>

      <div class="q-pa-md">
        <q-table
          :grid="$q.screen.xs"
          flat
          bordered
          title="Отделы"
          :rows="rows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="departmentsStore.isLoading"
          no-data-label="Данные не найдены или еще не загружены"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div
                :style="{ paddingLeft: props.row.parent_id ? '24px' : '0px' }"
                class="row items-center no-wrap"
              >
                <q-icon
                  v-if="props.row.parent_id"
                  name="subdirectory_arrow_right"
                  color="grey-6"
                  class="q-mr-xs"
                />
                <span :class="{ 'text-weight-bold': !props.row.parent_id }">
                  {{ props.value }}
                </span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-deleted_at="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.value ? 'negative' : 'positive'" class="q-pa-xs">
                {{ props.value ? 'Удален' : 'Активен' }}
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
                  @click="editDept(props.row)"
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
                  @click="deleteDept(props.row.id)"
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
          <div class="text-h6">{{ isEdit ? 'Изменить' : 'Добавить' }} отдел</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newDept.name"
            label="Название"
            dense
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
          <q-select
            v-model="newDept.parent_id"
            :options="departmentsStore.items.filter((r) => r.id !== editId)"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            label="Родительский отдел"
            dense
            clearable
            class="q-mt-sm"
          />
          <q-input v-model="newDept.comment" label="Описание" type="textarea" class="q-mt-sm" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="resetForm" />
          <q-btn flat label="Сохранить" color="primary" @click="saveDept" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useOrganizationsStore } from '../stores/organizations';
import { useDepartmentsStore } from '../stores/departments';
import type { Department, CreateDepartmentDto } from '../models/Department';

const $q = useQuasar();
const organizationsStore = useOrganizationsStore();
const departmentsStore = useDepartmentsStore();

const isMounted = ref(false);
const filter = ref('');
const addDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);
const selectedOrgId = ref<string | null>(null);

const newDept = ref<CreateDepartmentDto>({
  name: '',
  comment: '',
  parent_id: null,
  organization_id: '',
});

const rows = computed(() => {
  return sortByHierarchy(departmentsStore.items);
});

function sortByHierarchy(list: Department[], parentId: string | null = null) {
  const result: Department[] = [];
  const items = list.filter((r) => r.parent_id === parentId);
  for (const item of items) {
    result.push(item);
    result.push(...sortByHierarchy(list, item.id));
  }
  return result;
}

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

async function loadDepartments() {
  if (selectedOrgId.value) {
    await departmentsStore.fetchByOrganization(selectedOrgId.value);
  }
}

async function saveDept() {
  if (!selectedOrgId.value) return;

  const payload = { ...newDept.value, organization_id: selectedOrgId.value };

  if (isEdit.value && editId.value) {
    await departmentsStore.editDepartment(editId.value, payload);
  } else {
    await departmentsStore.addDepartment(payload);
  }
  resetForm();
}
async function confirmDelete(id: string) {
  await departmentsStore.removeDepartment(id);
}

function deleteDept(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить эту организацию?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(id);
  });
}

function editDept(row: Department) {
  isEdit.value = true;
  editId.value = row.id;
  newDept.value = {
    name: row.name,
    comment: row.comment ?? '',
    parent_id: row.parent_id,
    organization_id: row.organization_id,
  };
  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newDept.value = { name: '', comment: '', parent_id: null, organization_id: '' };
}

onMounted(async () => {
  isMounted.value = true;
  await organizationsStore.fetchOrganizations();
});
</script>
