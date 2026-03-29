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
                  @click="editDialog(props.row)"
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
          <q-btn flat label="Сохранить" color="primary" @click="saveOrg()" />
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
const rows = ref([]);
const $q = useQuasar();
const newOrg = ref({ name: '', comment: '' });
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
    const response = await fetch('/api/organizations');
    rows.value = await response.json();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    $q.notify({ type: 'negative', message: 'Ошибка при получении данных' });
  }
}

async function saveOrg() {
  const isEditing = isEdit.value;
  const url = isEditing ? `/api/organizations/${editId.value}` : '/api/organizations';
  try {
    const response = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrg.value),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при сохранении организации');
    }
    addDialog.value = false;
    newOrg.value = { name: '', comment: '' };
    $q.notify({
      type: 'positive',
      message: isEditing ? 'Организация обновлена' : 'Организация создана',
    });
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Ошибка при создании организации:', error);
    $q.notify({ type: 'negative', message: 'Ошибка при создании организации' });
  }
}

function deleteOrg(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить эту организацию?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/organizations/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при удалении организации)');
        }
        await loadData();
        $q.notify({ type: 'positive', message: 'Организация удалена' });
      } catch (error) {
        console.error('Ошибка при удалении организации:', error);
        $q.notify({ type: 'negative', message: 'Ошибка при удалении организации' });
      }
    })();
  });
}

function editDialog(org: any) {
  isEdit.value = true;
  editId.value = org.id;
  newOrg.value = {
    name: org.name,
    comment: org.comment,
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
  loadData().catch(console.error);
});
</script>
