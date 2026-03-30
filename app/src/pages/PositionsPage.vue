<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Должности</q-toolbar-title>
        <q-space />

        <q-btn
          flat
          color="primary"
          icon="add"
          label="Добавить должность"
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
          title="Должности"
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
                  color="primary"
                  icon="edit"
                  size="10px"
                  :disable="!!props.row.deleted_at"
                  @click="editDialog(props.row.id, props.row.name, props.row.comment)"
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
                  @click="deletePos(props.row.id)"
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
            v-model="newPos.name"
            label="Название"
            dense
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
          <q-input v-model="newPos.comment" label="Описание" type="textarea" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="resetForm" />
          <q-btn flat label="Сохранить" color="primary" @click="savePos()" />
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
const rows = ref<
  {
    id: string;
    name: string;
    comment?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
  }[]
>([]);
const $q = useQuasar();
const newPos = ref({ name: '', comment: '' });
const addDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);

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
    const response = await fetch('/api/positions');
    rows.value = await response.json();
  } catch {
    $q.notify({ type: 'negative', message: 'Ошибка при получении данных' });
  }
}

async function savePos() {
  const isEditing = isEdit.value;
  const url = isEditing ? `/api/positions/${editId.value}` : '/api/positions';
  try {
    const response = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPos.value),
    });
    if (!response.ok) {
      const err = await response.json();
      $q.notify({ type: 'negative', message: err.message || 'Ошибка при сохранении' });
      return;
    }
    addDialog.value = false;
    newPos.value = { name: '', comment: '' };
    $q.notify({
      type: 'positive',
      message: isEditing ? 'Должность обновлена' : 'Должность создана',
    });
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Ошибка при создании должности:', error);
    $q.notify({ type: 'negative', message: 'Ошибка при создании должности' });
  }
}

function deletePos(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить эту должность?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        await loadData();
        $q.notify({ type: 'positive', message: 'Должность удалена' });
      } catch {
        $q.notify({ type: 'negative', message: 'Ошибка при удалении должности' });
      }
    })();
  });
}

function editDialog(id: string, name: string, comment?: string) {
  isEdit.value = true;
  editId.value = id;
  newPos.value = {
    name,
    comment: comment ?? '',
  };
  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newPos.value = { name: '', comment: '' };
}

onMounted(() => {
  isMounted.value = true;
  void loadData();
});
</script>
