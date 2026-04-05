<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Файлы</q-toolbar-title>
        <q-space />
        <q-btn
          flat
          color="primary"
          icon="upload"
          label="Загрузить файл"
          @click="uploadDialog = true"
        />
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
          :loading="filesStore.isLoading"
          no-data-label="Файлы не найдены или ещё не загружены"
        >
          <template v-slot:top-left>
            <div class="row items-center q-gutter-sm">
              <q-select
                v-model="selectedEmployeeId"
                :options="employeeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                clearable
                dense
                outlined
                placeholder="Все сотрудники"
                style="min-width: 220px"
                @update:model-value="onEmployeeFilter"
              />
            </div>
          </template>

          <template v-slot:top-right>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Поиск">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props" class="row items-center q-gutter-xs">
              <q-icon :name="getMimeIcon(props.row.mime_type)" size="20px" color="grey-6" />
              <span>{{ props.value }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-employee_id="props">
            <q-td :props="props">
              {{ getEmployeeName(props.value as string) }}
            </q-td>
          </template>

          <template v-slot:body-cell-category_id="props">
            <q-td :props="props">
              <q-badge color="primary" class="q-pa-xs">
                {{ getCategoryName(props.value as string) }}
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
                  icon="download"
                  size="10px"
                  @click="filesStore.downloadFile(props.row.id)"
                >
                  <q-tooltip>Скачать</q-tooltip>
                </q-btn>
                <q-btn
                  outline
                  square
                  class="q-pa-xs rounded-borders"
                  color="negative"
                  icon="delete"
                  size="10px"
                  @click="confirmDelete(props.row.id)"
                >
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-page>

    <q-dialog v-model="uploadDialog" persistent @hide="resetUpload">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Загрузить файл</div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-sm">
          <q-select
            v-model="upload.employeeId"
            :options="employeeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Сотрудник"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <q-select
            v-model="upload.categoryId"
            :options="categoryOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Категория"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <q-file
            v-model="upload.file"
            label="Файл"
            dense
            outlined
            :rules="[(val) => !!val || 'Выберите файл']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" @click="resetUpload" />
          <q-btn
            flat
            label="Загрузить"
            color="primary"
            :disable="!upload.file || !upload.employeeId || !upload.categoryId"
            @click="handleUpload"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useFilesStore } from '../stores/files';
import { useEmployeesStore } from '../stores/employees';
import { useFileCategoriesStore } from '../stores/file_categories';

const $q = useQuasar();
const filesStore = useFilesStore();
const employeesStore = useEmployeesStore();
const categoriesStore = useFileCategoriesStore();

const isMounted = ref(false);
const filter = ref('');
const uploadDialog = ref(false);
const selectedEmployeeId = ref<string | null>(null);

const upload = ref<{
  employeeId: string;
  categoryId: string;
  file: File | null;
}>({
  employeeId: '',
  categoryId: '',
  file: null,
});

const rows = computed(() => filesStore.items);

const employeeOptions = computed(() =>
  employeesStore.items.map((e) => ({
    label: `${e.last_name} ${e.first_name}`,
    value: e.id,
  })),
);

const categoryOptions = computed(() =>
  categoriesStore.items.map((c) => ({
    label: c.name,
    value: c.id,
  })),
);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Файл', field: 'name', align: 'left', sortable: true },
  { name: 'employee_id', label: 'Сотрудник', field: 'employee_id', align: 'left' },
  { name: 'category_id', label: 'Категория', field: 'category_id', align: 'left' },
  { name: 'mime_type', label: 'Тип', field: 'mime_type', align: 'left' },
  {
    name: 'created_at',
    label: 'Загружен',
    field: 'created_at',
    align: 'center',
    sortable: true,
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '—'),
  },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'center' },
];

function getEmployeeName(id: string): string {
  const e = employeesStore.items.find((x) => x.id === id);
  return e ? `${e.last_name} ${e.first_name}` : '—';
}

function getCategoryName(id: string): string {
  const c = categoriesStore.items.find((x) => x.id === id);
  return c ? c.name : '—';
}

function getMimeIcon(mime: string): string {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'picture_as_pdf';
  if (mime.includes('word')) return 'description';
  if (mime.includes('sheet') || mime.includes('excel')) return 'table_chart';
  return 'insert_drive_file';
}

async function onEmployeeFilter(val: string | null) {
  if (val) {
    await filesStore.fetchByEmployee(val);
  } else {
    await filesStore.fetchFiles();
  }
}

async function handleUpload() {
  if (!upload.value.file || !upload.value.employeeId || !upload.value.categoryId) return;

  await filesStore.uploadFile(upload.value.employeeId, upload.value.categoryId, upload.value.file);

  resetUpload();
}

function confirmDelete(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить этот файл?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void filesStore.removeFile(id);
  });
}

function resetUpload() {
  uploadDialog.value = false;
  upload.value = { employeeId: '', categoryId: '', file: null };
}

onMounted(async () => {
  isMounted.value = true;
  await Promise.all([
    filesStore.fetchFiles(),
    employeesStore.fetchEmployees(),
    categoriesStore.fetchCategories(),
  ]);
});
</script>
