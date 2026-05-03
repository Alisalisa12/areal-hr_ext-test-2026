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
      <q-card style="min-width: 800px; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ isEdit ? 'Изменить' : 'Добавить' }} сотрудника
          </div>
        </q-card-section>

        <q-scroll-area style="height: 70vh">
          <q-card-section style="display: flex; flex-direction: column; gap: 8px;">
            <div class="text-overline text-weight-bold text-grey-7">ОСНОВНЫЕ ДАННЫЕ</div>
            <q-input
              v-model="newEmployee.last_name"
              label="Фамилия"
              dense
              outlined
              hide-bottom-space
              :rules="[(val) => !!val || 'Обязательно']"
            />
            <q-input
              v-model="newEmployee.first_name"
              label="Имя"
              dense
              outlined
              hide-bottom-space
              :rules="[(val) => !!val || 'Обязательно']"
            />
            <q-input v-model="newEmployee.middle_name" label="Отчество" dense outlined />
            <q-input
              v-model="newEmployee.birth_date"
              label="Дата рождения"
              type="date"
              dense
              outlined
              stack-label
              hide-bottom-space
              :rules="[(val) => !!val || 'Обязательно']"
            />
          </q-card-section>

          <q-separator />

          <q-card-section style="display: flex; flex-direction: column; gap: 8px;">
            <div class="text-overline text-weight-bold text-grey-7">ПАСПОРТ</div>
            <q-input
              v-model="newPassport.full_passport"
              label="Серия и номер"
              mask="#### ######"
              unmasked-value
              outlined
              dense
              placeholder="0000 000000"
              hide-bottom-space
              :rules="[(val) => !val || val.length === 10 || '10 цифр']"
            />
            <q-input
              v-model="newPassport.issue_date"
              label="Дата выдачи"
              type="date"
              stack-label
              outlined
              dense
            />
            <q-input
              v-model="newPassport.issuer_code"
              label="Код подразделения"
              mask="###-###"
              unmasked-value
              outlined
              dense
              placeholder="000-000"
              hide-bottom-space
              :rules="[(val) => !val || val.length === 6 || '6 цифр']"
            />
            <q-input
              v-model="newPassport.issued_by"
              label="Кем выдан"
              type="textarea"
              autogrow
              outlined
              dense
            />
          </q-card-section>

          <q-separator />

          <q-card-section style="display: flex; flex-direction: column; gap: 8px;">
            <div class="text-overline text-weight-bold text-grey-7">АДРЕС</div>
            <q-input v-model="newAddress.region" label="Регион / Область" outlined dense />
            <q-input v-model="newAddress.city" label="Город" outlined dense />
            <q-input v-model="newAddress.street" label="Улица" outlined dense />
            <div class="row q-gutter-x-sm">
              <q-input v-model="newAddress.house" label="Дом" class="col" outlined dense />
              <q-input v-model="newAddress.block" label="Корпус" class="col" outlined dense />
              <q-input v-model="newAddress.flat" label="Кв." class="col" outlined dense />
            </div>
          </q-card-section>
        </q-scroll-area>

        <q-separator />
        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
          <q-btn flat label="Отмена" color="grey-7" @click="resetForm" />
          <q-btn
            unelevated
            label="Сохранить"
            color="primary"
            @click="saveEmployee"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useEmployeesStore } from '../stores/employees';
import { usePassportsStore } from '../stores/passports';
import { useAddressesStore } from '../stores/addresses';
import type { Employee, CreateEmployeeDto } from '../models/Employee';
import type { Passport, CreatePassportDto, UpdatePassportDto } from '../models/Passport';
import type { Address, CreateAddressDto, UpdateAddressDto } from '../models/Address';
import EmployeeViewDialog from '../components/EmployeeViewDialog.vue';

const $q = useQuasar();
const employeesStore = useEmployeesStore();
const passportsStore = usePassportsStore();
const addressesStore = useAddressesStore();

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
const pagination = ref({ rowsPerPage: 20 });
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

const emptyPassport = {
  id: undefined as string | undefined,
  full_passport: '',
  issue_date: '',
  issuer_code: '',
  issued_by: '',
};

const emptyAddress = {
  id: undefined as string | undefined,
  region: '',
  city: '',
  street: '',
  house: '',
  block: '',
  flat: '',
};

const newEmployee = ref<CreateEmployeeDto>({ ...emptyEmployee });
const newPassport = ref({ ...emptyPassport });
const newAddress = ref({ ...emptyAddress });
const originalPassport = ref({ ...emptyPassport });
const originalAddress = ref({ ...emptyAddress });

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
      await savePassport(editId.value);
      await saveAddress(editId.value);
    } else {
      const createdEmployee = await employeesStore.addEmployee({ ...newEmployee.value });
      if (createdEmployee?.id) {
        await savePassport(createdEmployee.id);
        await saveAddress(createdEmployee.id);
      }
    }
    resetForm();
}

async function savePassport(employeeId: string) {
  const hasChanged = JSON.stringify(newPassport.value) !== JSON.stringify(originalPassport.value);
  if (!hasChanged) return;

  const passport = newPassport.value;
  if (!passport.issue_date || !passport.issuer_code || !passport.issued_by) return;

  const payload = {
    employee_id: employeeId,
    series: '',
    number: '',
    issue_date: passport.issue_date,
    issuer_code: passport.issuer_code,
    issued_by: passport.issued_by,
    ...(passport.full_passport ? { full_passport: passport.full_passport } : {}),
  };

  if (passport.id) {
    await passportsStore.editPassport(passport.id, payload as UpdatePassportDto);
  } else {
    await passportsStore.addPassport(payload as CreatePassportDto);
  }
}

async function saveAddress(employeeId: string) {
  const hasChanged = JSON.stringify(newAddress.value) !== JSON.stringify(originalAddress.value);
  if (!hasChanged) return;

  const address = newAddress.value;
  if (!address.region || !address.city || !address.street || !address.house) return;

  const payload = {
    employee_id: employeeId,
    region: address.region,
    city: address.city,
    street: address.street,
    house: address.house,
    ...(address.block ? { block: address.block } : {}),
    ...(address.flat ? { flat: address.flat } : {}),
  };

  if (address.id) {
    await addressesStore.editAddress(address.id, payload as UpdateAddressDto);
  } else {
    await addressesStore.addAddress(payload as CreateAddressDto);
  }
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

  const passport = passportsStore.items.find((p: Passport) => p.employee_id === row.id);
  if (passport) {
    newPassport.value = {
      id: passport.id,
      full_passport: `${passport.series}${passport.number}`,
      issue_date: date.formatDate(passport.issue_date, 'YYYY-MM-DD'),
      issuer_code: passport.issuer_code,
      issued_by: passport.issued_by,
    };
  } else {
    newPassport.value = { ...emptyPassport };
  }
  originalPassport.value = { ...newPassport.value };

  const address = addressesStore.items.find((a: Address) => a.employee_id === row.id);
  if (address) {
    newAddress.value = {
      id: address.id,
      region: address.region,
      city: address.city,
      street: address.street,
      house: address.house,
      block: address.block ?? '',
      flat: address.flat ?? '',
    };
  } else {
    newAddress.value = { ...emptyAddress };
  }
  originalAddress.value = { ...newAddress.value };

  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  viewDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  selectedEmployee.value = null;
  newEmployee.value = { ...emptyEmployee };
  newPassport.value = { ...emptyPassport };
  newAddress.value = { ...emptyAddress };
  originalPassport.value = { ...emptyPassport };
  originalAddress.value = { ...emptyAddress };
}

function openViewDialog(row: Employee) {
  selectedEmployee.value = row;
  viewDialog.value = true;
}

onMounted(async () => {
  isMounted.value = true;
  await Promise.all([
    employeesStore.fetchEmployees(),
    passportsStore.fetchPassports(),
    addressesStore.fetchAddresses()
  ]);
});
</script>
