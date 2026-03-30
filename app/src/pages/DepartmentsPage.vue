<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Отделы</q-toolbar-title>
        <q-space />

        <q-btn
          flat
          color="primary"
          icon="add"
          label="Добавить отдел"
          :disable="!selectedOrgId"
          @click="
            resetForm();
            openDialog = true;
          "
        />
      </teleport>

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
        >
          <template v-slot:top-right>
            <div class="row q-gutter-sm">
              <q-select
                v-model="selectedOrgId"
                :options="organizations.filter((o) => !o.deleted_at)"
                option-label="name"
                option-value="id"
                emit-value
                map-options
                label="Организация"
                dense
                outlined
                style="min-width: 200px"
                @update:model-value="void loadData()"
              />
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Поиск">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </template>
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
            <q-td :props="props">
              <div class="q-gutter-sm">
                <q-btn
                  outline
                  square
                  class="q-pa-xs rounded-borders"
                  color="primary"
                  icon="edit"
                  size="10px"
                  :disable="!!props.row.deleted_at"
                  @click="
                    editDialog(props.row.id, props.row.name, props.row.comment, props.row.parent_id)
                  "
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

    <q-dialog v-model="openDialog" persistent @hide="resetForm">
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
            :options="rows.filter((r) => r.id !== editId)"
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
          <q-btn flat label="Сохранить" color="primary" @click="void saveDept()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';

const filter = ref('');
const isMounted = ref(false);
const rows = ref<{ id: string; name: string; comment?: string; parent_id?: string | null }[]>([]);
const organizations = ref<{ id: string; name: string; deleted_at?: string | null }[]>([]);
const selectedOrgId = ref<string | null>(null);
const $q = useQuasar();

const newDept = ref({ name: '', comment: '', parent_id: null as string | null });
const openDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Название', field: 'name', align: 'left' },
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
  { name: 'actions', label: 'Действия', field: 'id', align: 'right' },
];

async function loadOrgs() {
  try {
    const response = await fetch('/api/organizations');
    organizations.value = await response.json();
  } catch {
    $q.notify({ type: 'negative', message: 'Ошибка при загрузке организаций' });
  }
}

async function loadData() {
  if (!selectedOrgId.value) return;
  try {
    const response = await fetch(`/api/departments/org/${selectedOrgId.value}`);
    const data = await response.json();
    rows.value = sortByHierarchy(data);
  } catch {
    rows.value = [];
    $q.notify({ type: 'negative', message: 'Ошибка при получении данных' });
  }
}

async function saveDept() {
  const isEditing = isEdit.value;
  const url = isEditing ? `/api/departments/${editId.value || ''}` : '/api/departments';

  try {
    const response = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDept.value, organization_id: selectedOrgId.value }),
    });
    if (!response.ok) {
      const err = await response.json();
      $q.notify({ type: 'negative', message: err.message || 'Ошибка при сохранении отдела' });
      return;
    }
    openDialog.value = false;
    $q.notify({ type: 'positive', message: isEditing ? 'Отдел обновлен' : 'Отдел создан' });
    resetForm();
    await loadData();
  } catch {
    $q.notify({ type: 'negative', message: 'Ошибка при сохранении отдела' });
  }
}

function deleteDept(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить этот отдел?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        await loadData();
        $q.notify({ type: 'positive', message: 'Отдел удален' });
      } catch {
        $q.notify({ type: 'negative', message: 'Ошибка при удалении отдела' });
      }
    })();
  });
}

function editDialog(id: string, name: string, comment?: string, parent_id?: string | null) {
  isEdit.value = true;
  editId.value = id;
  newDept.value = {
    name,
    comment: comment ?? '',
    parent_id: parent_id ?? null,
  };
  openDialog.value = true;
}

function resetForm() {
  openDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newDept.value = { name: '', comment: '', parent_id: null };
}

function sortByHierarchy(list: typeof rows.value, parentId: string | null = null) {
  const result: typeof rows.value = [];
  const items = list.filter((r) => r.parent_id === parentId);
  for (const item of items) {
    result.push(item);
    result.push(...sortByHierarchy(list, item.id));
  }
  return result;
}

onMounted(() => {
  isMounted.value = true;
  void loadOrgs();
});
</script>
