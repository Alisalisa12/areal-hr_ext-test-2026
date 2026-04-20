<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title class="text-subtitle1 text-weight-bold">Операции</q-toolbar-title>
      </teleport>

      <div class="row items-stretch">
        <q-input v-model="filter" outlined rounded dense placeholder="Поиск" style="width: 260px">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />

        <q-btn
          color="primary"
          icon="add"
          rounded
          class="text-caption"
          label="Новая операция"
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
                  icon="edit"
                  size="10px"
                  @click="editOp(props.row)"
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
                  @click="deleteOp(props.row.id)"
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
      <q-card style="min-width: 480px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Изменить' : 'Добавить' }} операцию</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-sm">
          <q-select
            v-model="newOp.type"
            :options="typeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Тип операции"
            dense
            outlined
            @update:model-value="onTypeChange"
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <q-select
            v-model="newOp.employee_id"
            :options="filteredEmployeeOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Сотрудник"
            dense
            outlined
            @update:model-value="onEmployeeChange"
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <template v-if="showJobFields">
            <q-select
              v-model="newOp.organization_id"
              :options="organizationOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Организация"
              dense
              outlined
              :disable="newOp.type === HrOperationType.TRANSFER"
              :rules="[(val) => !!val || 'Обязательное поле']"
            />

            <q-select
              v-model="newOp.department_id"
              :options="departmentOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Отдел"
              dense
              outlined
              :rules="[(val) => !!val || 'Обязательное поле']"
            />

            <q-select
              v-model="newOp.position_id"
              :options="positionOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              label="Должность"
              dense
              outlined
              :rules="[(val) => !!val || 'Обязательное поле']"
            />
          </template>

          <template v-if="showSalaryFields">
            <q-input
              v-model.number="newOp.new_salary"
              label="Новый оклад"
              type="number"
              dense
              outlined
              :rules="[(val) => val > 0 || 'Введите корректную сумму']"
            />
            <q-input
              v-model="newOp.reason"
              label="Причина изменения"
              type="textarea"
              dense
              outlined
              autogrow
              :rules="[(val) => (val && val.trim().length >= 5) || 'Минимум 5 символов']"
            />
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="grey" @click="resetForm" />
          <q-btn flat label="Сохранить" color="primary" @click="saveOperation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useHrOperationsStore } from '../stores/hr_operations';
import { useSalaryStore } from '../stores/salary_changes';
import { useEmployeesStore } from '../stores/employees';
import { useDepartmentsStore } from '../stores/departments';
import { usePositionsStore } from '../stores/positions';
import { useOrganizationsStore } from '../stores/organizations';
import {
  HrOperationType,
  HrOperationTypeLabels,
  type HrOperation,
  type CreateHrOperationDto,
} from '../models/HrOperation';

const $q = useQuasar();

const hrStore = useHrOperationsStore();
const salaryStore = useSalaryStore();
const employeesStore = useEmployeesStore();
const departmentsStore = useDepartmentsStore();
const positionsStore = usePositionsStore();
const organizationsStore = useOrganizationsStore();

const isMounted = ref(false);
const filter = ref('');
const addDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);

type HrOperationForm = CreateHrOperationDto & {
  organization_id: string;
  new_salary: number;
  reason: string;
};

const emptyOp: HrOperationForm = {
  employee_id: '',
  organization_id: '',
  department_id: '',
  position_id: '',
  type: HrOperationType.HIRE,
  new_salary: 0,
  reason: '',
};

const newOp = ref<HrOperationForm>({ ...emptyOp });

const rows = computed(() => hrStore.items);

const columns: QTableColumn<HrOperation>[] = [
  {
    name: 'type',
    label: 'Тип',
    field: (row) => HrOperationTypeLabels[row.type],
    align: 'left',
    sortable: true,
  },
  {
    name: 'organization',
    label: 'Организация',
    field: 'organization_name',
    align: 'left',
    sortable: true,
  },
  { name: 'employee', label: 'Сотрудник', field: 'employee_name', align: 'left', sortable: true },
  { name: 'position', label: 'Должность', field: 'position_name', align: 'left', sortable: true },
  { name: 'old_salary', label: 'Старый оклад', field: 'old_salary', align: 'center' },
  { name: 'new_salary', label: 'Новый оклад', field: 'new_salary', align: 'center' },
  {
    name: 'created_at',
    label: 'Дата',
    field: 'created_at',
    align: 'center',
    sortable: true,
    format: (val: string) => (val ? date.formatDate(val, 'DD.MM.YYYY') : '-'),
  },
  { name: 'actions', label: 'Действия', field: 'id', align: 'center' },
];

const hiredEmployeeId = computed(() => {
  return [...hrStore.items]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, op) => {
      if (op.type === HrOperationType.HIRE) acc.add(op.employee_id);
      else if (op.type === HrOperationType.FIRE) acc.delete(op.employee_id);
      return acc;
    }, new Set<string>());
});

const filteredEmployeeOptions = computed(() => {
  const isHire = newOp.value.type === HrOperationType.HIRE;
  const hiredIds = hiredEmployeeId.value;
  return employeesStore.items
    .filter(({ id }) => isHire !== hiredIds.has(id))
    .map(({ id, first_name, last_name }) => ({
      label: `${last_name} ${first_name}`,
      value: id,
    }));
});

const organizationOptions = computed(() =>
  organizationsStore.items.map(({ name, id }) => ({ label: name, value: id })),
);

const departmentOptions = computed(() =>
  departmentsStore.items
  .filter((d) => d.organization_id === newOp.value.organization_id)
  .map(({ name, id }) => ({ label: name, value: id })),
);

const positionOptions = computed(() =>
  positionsStore.items.map(({ name, id }) => ({ label: name, value: id })),
);

const typeOptions = Object.values(HrOperationType).map((value) => ({
  label: HrOperationTypeLabels[value],
  value,
}));

const showJobFields = computed(() =>
  [HrOperationType.HIRE, HrOperationType.TRANSFER].includes(newOp.value.type),
);

const showSalaryFields = computed(() =>
  [HrOperationType.HIRE, HrOperationType.SALARY_CHANGE].includes(newOp.value.type),
);

watch(
  () => newOp.value.organization_id,
  async (id, oldId) => {
    if (oldId && id !== oldId) {
      newOp.value.department_id = '';
    }
    if (id) await departmentsStore.fetchByOrganization(id);
  },
);

function getEmployeeCurrentSalary(empId: string): number {
  const lastSalary = [...hrStore.items]
    .filter((op) => op.employee_id === empId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((op) => salaryStore.items.find((s) => s.operation_id === op.id))
    .find(Boolean);
  return lastSalary ? Number(lastSalary.new_salary) : 0;
}

function onTypeChange() {
  const { employee_id } = newOp.value;
  if (employee_id && !filteredEmployeeOptions.value.find((e) => e.value === employee_id)) {
    newOp.value.employee_id = '';
  }
}

function onEmployeeChange() {
  const { employee_id, type } = newOp.value;
  if (!employee_id) return;

  const needLastJob = [
    HrOperationType.FIRE,
    HrOperationType.TRANSFER,
    HrOperationType.SALARY_CHANGE,
  ].includes(type);

  if (needLastJob) {
    const lastOp = [...hrStore.items]
      .reverse()
      .find(
        (op) =>
          op.employee_id === employee_id &&
          [HrOperationType.HIRE, HrOperationType.TRANSFER].includes(op.type),
      );

    if (lastOp) {
      newOp.value.department_id = lastOp.department_id;
      newOp.value.position_id = lastOp.position_id;
      const dept = departmentsStore.items.find((d) => d.id === lastOp.department_id);
      newOp.value.organization_id = dept?.organization_id || '';
    }
  }
}

async function saveOperation(): Promise<void> {
  const { type, employee_id: empId, new_salary, reason, department_id, position_id } = newOp.value;

  if (type === HrOperationType.HIRE || type === HrOperationType.SALARY_CHANGE) {
    const salaryNum = Number(new_salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      $q.notify({ type: 'negative', message: 'Введите корректное число в поле зарплаты' });
      return;
    }
    if (!reason || reason.trim().length < 5) {
      $q.notify({ type: 'negative', message: 'Причина слишком короткая' });
      return;
    }
  }

  const payload: CreateHrOperationDto = {
    employee_id: empId,
    department_id,
    position_id,
    type,
  };

  if (isEdit.value && editId.value) {
    await hrStore.editHrOperation(editId.value, payload);
    const salaryRecord = salaryStore.items.find((s) => s.operation_id === editId.value);
    if (salaryRecord) {
      await salaryStore.editSalaryChange(salaryRecord.id, {
        operation_id: editId.value,
        new_salary: Number(new_salary),
        old_salary: salaryRecord.old_salary,
        reason,
        changed_at: salaryRecord.changed_at,
      });
    }
  } else {
  const created = await hrStore.addHrOperation(payload);

  if (
    type === HrOperationType.HIRE ||
    type === HrOperationType.SALARY_CHANGE ||
    type === HrOperationType.TRANSFER
  ) {
    const currentSalary = getEmployeeCurrentSalary(empId);
    await salaryStore.addSalaryChange({
      operation_id: created.id,
      old_salary: type === HrOperationType.HIRE ? 0 : currentSalary,
      new_salary: type === HrOperationType.SALARY_CHANGE ? Number(new_salary) : currentSalary,
      reason: reason || 'Перевод',
    });
  }

  }

  await Promise.all([hrStore.fetchHrOperations(), salaryStore.fetchSalaryChanges()]);
  $q.notify({ type: 'positive', message: 'Сохранено' });
  resetForm();
}

async function confirmDelete(id: string) {
  await hrStore.removeHrOperation(id);
  await hrStore.fetchHrOperations();
}

function deleteOp(id: string) {
  $q.dialog({
    title: 'Удаление',
    message: 'Вы уверены, что хотите удалить эту операцию?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(id);
  });
}

async function editOp(row: HrOperation) {
  isEdit.value = true;
  editId.value = row.id;

  const dept = departmentsStore.items.find((d) => d.id === row.department_id);
  const orgId = dept?.organization_id || '';
  if (orgId) await departmentsStore.fetchByOrganization(orgId);

  const operationSalary = salaryStore.items.find((s) => s.operation_id === row.id);

  newOp.value = {
    employee_id: row.employee_id,
    organization_id: orgId,
    department_id: row.department_id,
    position_id: row.position_id,
    type: row.type,
    new_salary: operationSalary ? Number(operationSalary.new_salary) : 0,
    reason: operationSalary?.reason ?? '',
  };

  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newOp.value = { ...emptyOp };
}

onMounted(async () => {
  isMounted.value = true;
  await Promise.all([
    organizationsStore.fetchOrganizations(),
    hrStore.fetchHrOperations(),
    employeesStore.fetchEmployees(),
    positionsStore.fetchPositions(),
    salaryStore.fetchSalaryChanges(),
    departmentsStore.fetchAll(),
  ]);
});
</script>
