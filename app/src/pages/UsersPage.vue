<template>
  <div>
    <q-page padding>
      <teleport to="#header-actions" v-if="isMounted">
        <q-toolbar-title class="text-subtitle1 text-weight-bold">Пользователи</q-toolbar-title>
      </teleport>

      <div class="row items-stretch q-mb-md">
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
          label="Добавить пользователя"
          @click="
            resetForm();
            addDialog = true;
          "
        />
      </div>

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
                @click="editUser(props.row)"
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
                @click="deleteUser(props.row.id)"
              >
                <q-tooltip>Удалить</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-page>

    <q-dialog v-model="addDialog" persistent @hide="resetForm">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ isEdit ? 'Изменить' : 'Добавить' }} пользователя</div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-md">
          <q-input
            v-model="newUser.login"
            label="Логин"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <q-input
            v-model="newUser.password"
            label="Пароль"
            type="password"
            dense
            outlined
            :placeholder="isEdit ? 'Оставьте пустым, если не хотите менять' : ''"
            :rules="[(val) => isEdit || !!val || 'Обязательное поле']"
          />

          <q-select
            v-model="newUser.role_id"
            :options="rolesStore.items"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Выберите роль"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />

          <q-select
            v-model="newUser.employee_id"
            :options="employeesStore.items"
            option-value="id"
            :option-label="
              (opt) => [opt.last_name, opt.first_name, opt.middle_name].filter(Boolean).join(' ')
            "
            emit-value
            map-options
            label="Привязать к сотруднику"
            dense
            outlined
            :rules="[(val) => !!val || 'Обязательное поле']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat label="Отмена" color="grey-7" @click="resetForm" />
          <q-btn unelevated label="Сохранить" color="primary" @click="saveUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { date, type QTableColumn, useQuasar } from 'quasar';
import { useUsersStore } from '../stores/users';
import type { User, CreateUserDto, UpdateUserDto } from '../models/User';
import { useRolesStore } from '../stores/roles';
import { useEmployeesStore } from '../stores/employees';
const $q = useQuasar();
const usersStore = useUsersStore();
const rolesStore = useRolesStore();
const employeesStore = useEmployeesStore();
const isMounted = ref(false);
const filter = ref('');
const addDialog = ref(false);
const isEdit = ref(false);
const editId = ref<string | null>(null);
const newUser = ref<CreateUserDto>({
  login: '',
  password: '',
  role_id: '',
  employee_id: '',
});

const rows = computed(() => usersStore.items);

const columns: QTableColumn[] = [
  {
    name: 'login',
    label: 'Логин',
    field: 'login',
    align: 'left',
    sortable: true,
  },
  {
    name: 'role_name',
    label: 'Роль',
    field: 'role_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'employee_fio',
    label: 'Сотрудник',
    field: 'employee_fio',
    align: 'left',
    sortable: true,
  },
  {
    name: 'created_at',
    label: 'Создано',
    field: 'created_at',
    align: 'center',
    sortable: true,
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '-'),
  },
  {
    name: 'updated_at',
    label: 'Обновлено',
    field: 'updated_at',
    align: 'center',
    sortable: true,
    format: (val) => (val ? date.formatDate(val as string, 'DD.MM.YYYY HH:mm') : '-'),
  },
  {
    name: 'actions',
    label: 'Действия',
    field: 'actions',
    align: 'center',
  },
];

async function saveUser() {
  if (isEdit.value && editId.value) {
    const { password, ...rest } = newUser.value;
    const updatePayload: UpdateUserDto = { ...rest };
    if (password) updatePayload.password = password;
    await usersStore.editUser(editId.value, updatePayload);
  } else {
    await usersStore.addUser(newUser.value);
  }
  await usersStore.fetchUsers();
  resetForm();
}

async function confirmDelete(id: string) {
  await usersStore.removeUser(id);
}

function deleteUser(id: string) {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите удалить этого пользователя?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(id);
  });
}
function editUser(row: User) {
  isEdit.value = true;
  editId.value = row.id;

  newUser.value = {
    login: row.login,
    role_id: row.role_id,
    employee_id: row.employee_id,
    password: '',
  };

  addDialog.value = true;
}

function resetForm() {
  addDialog.value = false;
  isEdit.value = false;
  editId.value = null;
  newUser.value = {
    login: '',
    password: '',
    role_id: '',
    employee_id: '',
  };
}

onMounted(() => {
  isMounted.value = true;
  void usersStore.fetchUsers();
  void rolesStore.fetchRoles();
  void employeesStore.fetchEmployees();
});
</script>
