<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 680px; max-width: 740px; width: 100%; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">Карточка сотрудника</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="row items-center q-gutter-x-md q-pt-sm">
        <q-avatar size="80px" color="primary" text-color="white" class="text-weight-bold">
          {{ initials }}
        </q-avatar>
        <div class="col">
          <div class="text-subtitle1 text-weight-bold">{{ fullName }}</div>
          <div class="column q-gutter-y-xs">
            <div
              v-if="employee?.position_name"
              class="text-caption text-primary text-weight-medium"
            >
              {{ employee.position_name }}
            </div>

            <div class="text-caption text-grey-8" style="line-height: 1.2">
              <span v-if="employee?.organization_name">{{ employee.organization_name }}</span>
              <span v-if="employee?.department_name"> - {{ employee.department_name }}</span>
            </div>

            <div v-if="employee?.hire_date" class="text-caption text-grey-6">
              Принят: {{ formatDate(employee.hire_date) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-tabs
        v-model="tab"
        dense
        align="left"
        class="q-px-md q-mt-sm"
        indicator-color="primary"
        active-color="primary"
        narrow-indicator
      >
        <q-tab name="passport" label="Паспорт и адрес" />
      </q-tabs>

      <q-separator />

      <div class="q-pa-md q-gutter-y-md" style="min-height: 360px">
        <q-card flat bordered style="border-radius: 8px">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-overline text-weight-bold text-grey-7">ПАСПОРТНЫЕ ДАННЫЕ</div>
              <q-space />
              <q-btn
                outline
                :label="passport ? 'Изменить' : 'Добавить'"
                :icon="passport ? 'edit' : 'add'"
                :color="passport ? 'grey-7' : 'primary'"
                size="sm"
                style="width: 120px"
                class="q-ml-sm"
                @click="passportDialog = true"
              />
              <q-btn
                v-if="passport"
                outline
                label="Удалить"
                icon="delete"
                color="negative"
                size="sm"
                style="width: 120px"
                class="q-ml-sm"
                @click="confirmDelete('passport')"
              >
                <q-tooltip>Удалить данные</q-tooltip>
              </q-btn>
            </div>

            <div v-if="passport" class="column q-gutter-y-sm">
              <div>
                <div class="text-caption text-grey-6 uppercase">Серия и номер</div>
                <div class="text-body2 text-grey-9" style="line-height: 1">
                  {{ passport.series }} {{ passport.number }}
                </div>
              </div>
              <div class="row q-gutter-x-lg">
                <div>
                  <div class="text-caption text-grey-6 uppercase">Дата выдачи</div>
                  <div class="text-body2 text-grey-9">{{ formatDate(passport.issue_date) }}</div>
                </div>
                <div>
                  <div class="text-caption text-grey-6 uppercase">Код подразделения</div>
                  <div class="text-body2 text-grey-9">
                    {{ formatIssuerCode(passport.issuer_code) }}
                  </div>
                </div>
              </div>
              <div>
                <div class="text-caption text-grey-6 uppercase">Кем выдан</div>
                <div class="text-body2 text-grey-9">{{ passport.issued_by }}</div>
              </div>
            </div>
            <div v-else class="text-grey-5 text-center q-py-xl">
              <q-icon name="assignment_ind" size="48px" class="q-mb-sm" />
              <div>Данные не заполнены</div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered style="border-radius: 8px">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-overline text-weight-bold text-grey-7">АДРЕС</div>
              <q-space />
              <q-btn
                outline
                :label="address?.id ? 'Изменить' : 'Добавить'"
                :icon="address?.id ? 'edit' : 'add'"
                :color="address?.id ? 'grey-7' : 'primary'"
                size="sm"
                style="width: 120px"
                class="q-ml-sm"
                @click="addressDialog = true"
              />
              <q-btn
                v-if="address?.id"
                outline
                label="Удалить"
                icon="delete"
                color="negative"
                size="sm"
                style="width: 120px"
                class="q-ml-sm"
                @click="confirmDelete('address')"
              >
                <q-tooltip>Удалить адрес</q-tooltip>
              </q-btn>
            </div>

            <div v-if="address?.id" class="text-body2 text-grey-9">
              <span v-if="address.region">{{ address.region }}, </span>
              <span v-if="address.city">{{ address.city }}, </span>
              <span v-if="address.street">{{ address.street }}, </span>
              <span v-if="address.house">д. {{ address.house }}</span>
              <span v-if="address.block">, корп. {{ address.block }}</span>
              <span v-if="address.flat && typeof address.flat !== 'function'"
                >, кв. {{ address.flat }}</span
              >
            </div>
            <div v-else class="text-grey-5 text-center q-py-xl">
              <q-icon name="place" size="48px" class="q-mb-sm" />
              <div>Адрес регистрации не указан</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <PassportForm
        v-model="passportDialog"
        :employee-id="employee?.id || ''"
        :data="passport"
        @saved="loadData"
      />
      <AddressForm
        v-model="addressDialog"
        :employee-id="employee?.id || ''"
        :data="address"
        @saved="loadData"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { date, useQuasar } from 'quasar';
import { usePassportsStore } from '../stores/passports';
import { useAddressesStore } from '../stores/addresses';
import type { Employee } from '../models/Employee';
import PassportForm from './PassportForm.vue';
import AddressForm from './AddressForm.vue';

const props = defineProps<{
  modelValue: boolean;
  employee: Employee | null;
}>();

defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
}>();

const $q = useQuasar();
const passportsStore = usePassportsStore();
const addressStore = useAddressesStore();

const tab = ref('passport');
const passportDialog = ref(false);
const addressDialog = ref(false);

const passport = computed(() => passportsStore.current);
const address = computed(() => addressStore.current);

const fullName = computed(() => {
  if (!props.employee) return '';
  return `${props.employee.last_name} ${props.employee.first_name} ${props.employee.middle_name ?? ''}`.trim();
});

const initials = computed(() => {
  if (!props.employee) return '?';
  return `${props.employee.last_name[0]}${props.employee.first_name[0]}`.toUpperCase();
});

function formatDate(val: string) {
  return date.formatDate(val, 'DD.MM.YYYY');
}

function formatIssuerCode(val: string) {
  if (val?.length === 6) return `${val.slice(0, 3)}-${val.slice(3)}`;
  return val;
}

const loadData = async () => {
  if (!props.employee?.id) return;
  await Promise.allSettled([
    passportsStore.fetchByEmployee(props.employee.id),
    addressStore.fetchByEmployee(props.employee.id),
  ]);
};

const confirmDelete = (type: 'passport' | 'address') => {
  const isPassport = type === 'passport';
  const target = isPassport ? passport.value : address.value;

  $q.dialog({
    title: 'Подтверждение',
    message: `Удалить ${isPassport ? 'паспортные данные' : 'адрес регистрации'}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (target?.id) {
      void (async () => {
        if (isPassport) await passportsStore.removePassport(target.id);
        else await addressStore.removeAddress(target.id);
        await loadData();
      })();
    }
  });
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      void loadData();
    } else {
      passportsStore.clearCurrent();
      addressStore.clearCurrent();
    }
  },
  { immediate: true },
);
</script>
