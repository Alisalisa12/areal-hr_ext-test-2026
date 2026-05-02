<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title class="text-subtitle1 text-weight-bold">Сотрудники</q-toolbar-title>
      </teleport>

      <div class="row items-stretch">
        <q-input v-model="filter" outlined rounded dense placeholder="Поиск" style="width: 260px">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />

        <div class="row q-gutter-sm">
          <q-btn-dropdown
            color="primary"
            icon="filter_alt"
            rounded
            label="Фильтры"
            class="text-caption"
          >
            <q-list style="min-width: 280px" class="q-pa-xs">
              <q-item>
                <q-item-section>
                  <q-select
                    v-model="selectedOrg"
                    :options="optionsOrgs"
                    label="Организация"
                    dense
                    style="font-size: 12px; min-height: 32px"
                    outlined
                    rounded
                    clearable
                    options-dense
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-select
                    v-model="selectedDept"
                    :options="optionsDepts"
                    label="Отдел"
                    dense
                    style="font-size: 12px; min-height: 32px"
                    outlined
                    rounded
                    clearable
                    options-dense
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-select
                    v-model="selectedPosition"
                    :options="optionsPositions"
                    label="Должность"
                    dense
                    style="font-size: 12px; min-height: 32px"
                    outlined
                    rounded
                    clearable
                    options-dense
                  />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-select
                    v-model="employeesStore.viewMode"
                    :options="optionsStatus"
                    label="Статус"
                    dense
                    outlined
                    rounded
                    emit-value
                    map-options
                    style="font-size: 12px; min-height: 32px"
                    @update:model-value="onStatusChange"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            color="primary"
            icon="add"
            rounded
            class="text-caption"
            label="Добавить сотрудника"
            @click="
              resetForm();
              addDialog = true;
            "
          />
        </div>
      </div>

      <div class="q-pa-md">
        <q-table
          :grid="$q.screen.xs"
          flat
          bordered
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          v-model:pagination="pagination"
          :rows-per-page-options="[20, 50, 100, 0]"
          :filter-method="customFilter"
          no-data-label="Данные не найдены или еще не загружены"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.row.deleted_at ? 'negative' : 'positive'" class="q-pa-xs">
                {{ props.row.deleted_at ? 'Уволен' : 'Активен' }}
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
                  icon="visibility"
                  size="10px"
                  @click="openViewDialog(props.row)"
                >
                  <q-tooltip>Просмотр</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="!props.row.deleted_at"
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
                  v-if="!props.row.deleted_at"
                  outline
                  square
                  class="q-pa-xs rounded-borders"
                  color="negative"
                  icon="delete"
                  size="10px"
                  @click="terminateEmployee(props.row.id)"
                >
                  <q-tooltip>Уволить</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-page>

    <EmployeeViewDialog v-model="viewDialog" :employee="selectedEmployee" />

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

const selectedPosition = ref<string | null>(null);
const selectedDept = ref<string | null>(null);
const selectedOrg = ref<string | null>(null);
const optionsStatus = [
  { label: 'Активные', value: 'active' },
  { label: 'Уволенные', value: 'dismissed' },
  { label: 'Все', value: 'all' },
];

const isMounted = ref(false);
const filter = ref('');
const pagination = ref({
  rowsPerPage: 20,
});
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
  {
    name: 'position_name',
    label: 'Должность',
    field: 'position_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'salary',
    label: 'Зарплата',
    field: 'salary',
    align: 'right',
    sortable: true,
    format: (val: number) => (val ? `${val.toLocaleString()} ₽` : '—'),
  },
  {
    name: 'status',
    label: 'Статус',
    field: (row) => (row.deleted_at ? 'Уволен' : 'Активен'),
    align: 'center',
  },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'center' },
];

const customFilter = (rows: readonly Employee[], terms: string): Employee[] => {
  const lowerTerms = terms.toLowerCase();
  return rows.filter((row: Employee) => {
    const fullName = `${row.last_name} ${row.first_name} ${row.middle_name || ''}`.toLowerCase();
    return fullName.includes(lowerTerms);
  });
};

const onStatusChange = async (val: 'active' | 'dismissed' | 'all') => {
  employeesStore.viewMode = val;
  await employeesStore.fetchEmployees();
};

const filteredRows = computed(() => {
  return employeesStore.items.filter((row: Employee) => {
    const matchesPos = !selectedPosition.value || row.position_name === selectedPosition.value;
    const matchesDept = !selectedDept.value || row.department_name === selectedDept.value;
    const matchesOrg = !selectedOrg.value || row.organization_name === selectedOrg.value;
    return matchesPos && matchesDept && matchesOrg;
  });
});
const optionsPositions = computed<string[]>(() => {
  const items = employeesStore.items
    .map((e) => e.position_name)
    .filter((name): name is string => !!name);
  return [...new Set(items)];
});

const optionsDepts = computed<string[]>(() => {
  const items = employeesStore.items
    .map((e) => e.department_name)
    .filter((name): name is string => !!name);
  return [...new Set(items)];
});

const optionsOrgs = computed<string[]>(() => {
  const items = employeesStore.items
    .map((e) => e.organization_name)
    .filter((name): name is string => !!name);
  return [...new Set(items)];
});

async function saveEmployee() {
  if (isEdit.value && editId.value) {
    await employeesStore.editEmployee(editId.value, { ...newEmployee.value });
  } else {
    await employeesStore.addEmployee({ ...newEmployee.value });
  }
  resetForm();
}

async function confirmTermination(id: string) {
  await employeesStore.dismissEmployee(id);
}

function terminateEmployee(id: string) {
  $q.dialog({
    title: 'Увольнение',
    message: 'Вы уверены, что хотите уволить сотрудника?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmTermination(id);
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

onMounted(() => {
  isMounted.value = true;
  void employeesStore.fetchEmployees();
});
</script>
