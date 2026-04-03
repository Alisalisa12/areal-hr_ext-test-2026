<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title>Сотрудники</q-toolbar-title>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Поиск">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />

        <q-btn
          flat
          color="primary"
          icon="add"
          label="Добавить сотрудника"
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
          :rows="rows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          no-data-label="Данные не найдены или еще не загружены"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="q-gutter-sm">
                <q-btn
                  outline
                  square
                  class="q-pa-xs rounded-borders"
                  color="primary"
                  icon="visibility"
                  size="10px"
                  @click="openViewDialog(props.row)"
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
                  @click="editEmployee(props.row)"
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
                  @click="deleteEmployee(props.row.id)"
                >
                  <q-tooltip>Удалить</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-page>

    <EmployeeViewDialog v-model="viewDialog" :employee="selectedEmployee" @fire="handleFire" />

    <q-dialog v-model="addDialog" persistent @hide="resetForm">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Изменить' : 'Добавить' }} сотрудника</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-sm">
          <q-input
            v-model="newEmployee.last_name"
            label="Фамилия"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
          <q-input
            v-model="newEmployee.first_name"
            label="Имя"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
          <q-input v-model="newEmployee.middle_name" label="Отчество" dense outlined />
          <q-input
            v-model="newEmployee.birth_date"
            label="Дата рождения"
            type="date"
            dense
            outlined
            stack-label
            :rules="[(val) => !!val || 'Выберите дату']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey" @click="resetForm" />
          <q-btn flat label="Сохранить" color="primary" @click="saveEmployee" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useEmployeesStore } from '../stores/employees';
import type { Employee, CreateEmployeeDto } from '../models/Employee';
import EmployeeViewDialog from '../components/EmployeeViewDialog.vue';

const $q = useQuasar();
const employeesStore = useEmployeesStore();

const isMounted = ref(false);
const filter = ref('');
const addDialog = ref(false);
const viewDialog = ref(false);
const selectedEmployee = ref<Employee | null>(null);

const isEdit = ref(false);
const editId = ref<string | null>(null);

const emptyEmployee: CreateEmployeeDto = {
  last_name: '',
  first_name: '',
  middle_name: '',
  birth_date: '',
};

const newEmployee = ref<CreateEmployeeDto>({ ...emptyEmployee });
const rows = computed(() => employeesStore.items);

const columns: QTableColumn[] = [
  {
    name: 'full_name',
    label: 'ФИО',
    field: (row: Employee) => `${row.last_name} ${row.first_name} ${row.middle_name || ''}`,
    align: 'left',
    sortable: true,
  },
  {
    name: 'birth_date',
    label: 'Дата рождения',
    field: 'birth_date',
    align: 'center',
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY') : '-'),
  },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'center' },
];

async function saveEmployee() {
  if (isEdit.value && editId.value) {
    await employeesStore.editEmployee(editId.value, newEmployee.value);
  } else {
    await employeesStore.addEmployee(newEmployee.value);
  }
  resetForm();
}

async function confirmDelete(id: string) {
  await employeesStore.removeEmployee(id);
}

function deleteEmployee(id: string) {
  $q.dialog({
    title: 'Удаление',
    message: 'Вы уверены, что хотите удалить сотрудника?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(id);
  });
}

function editEmployee(row: Employee) {
  isEdit.value = true;
  editId.value = row.id;
  newEmployee.value = {
    last_name: row.last_name,
    first_name: row.first_name,
    middle_name: row.middle_name ?? '',
    birth_date: date.formatDate(row.birth_date, 'YYYY-MM-DD'),
  };
  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  viewDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  selectedEmployee.value = null;
  newEmployee.value = { ...emptyEmployee };
}

function openViewDialog(row: Employee) {
  selectedEmployee.value = row;
  viewDialog.value = true;
}

function handleFire(employee: Employee | null) {
  console.log('Увольнение сотрудника:', employee?.last_name);
}

onMounted(() => {
  isMounted.value = true;
  void employeesStore.fetchEmployees();
});
</script>
