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
          <div class="text-caption text-grey-6 row items-center q-gutter-x-sm q-mb-sm">
            <span>{{ positionPlaceholder }}</span>
            <q-icon name="circle" size="4px" color="grey-4" />
            <span>{{ departmentPlaceholder }}</span>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <q-badge rounded color="green-1" text-color="green-7" label="Активен" class="q-px-sm" />
            <div class="text-caption text-grey-5">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              Принят: {{ formattedHireDate }}
            </div>
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Уволить"
            color="negative"
            flat
            dense
            no-caps
            class="self-start q-mt-xs"
            @click="$emit('fire', employee)"
          />
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
        <q-tab name="files" label="Файлы" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated style="min-height: 360px">
        <q-tab-panel name="passport" class="q-pa-md q-gutter-y-md">
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
                  @click="openPassportForm(passport)"
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
                  @click="deletePassport"
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
                    <div class="text-body2 text-grey-9">
                      {{ formatDate(passport.issue_date) }}
                    </div>
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
              <div class="text-overline text-weight-bold text-grey-7">АДРЕС</div>
              <div class="text-grey-5 text-center q-py-md">Адрес регистрации не указан</div>
            </q-card-section>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog v-model="passportDialog" persistent>
      <q-card style="min-width: 450px; border-radius: 12px">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ isEditPassport ? 'Редактировать' : 'Новый' }} паспорт
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-y-sm q-pt-md">
          <q-input
            v-model="passportForm.full_passport"
            label="Серия и номер"
            mask="#### ######"
            unmasked-value
            outlined
            dense
            placeholder="0000 000000"
            :rules="[(val) => !!val || 'Обязательно', (val) => val.length === 10 || '10 цифр']"
          />
          <q-input
            v-model="passportForm.issue_date"
            label="Дата выдачи"
            type="date"
            stack-label
            outlined
            dense
            :rules="[(val) => !!val || 'Обязательно']"
          />
          <q-input
            v-model="passportForm.issuer_code"
            label="Код подразделения"
            mask="###-###"
            unmasked-value
            outlined
            dense
            placeholder="000-000"
            :rules="[(val) => !!val || 'Обязательно']"
          />
          <q-input
            v-model="passportForm.issued_by"
            label="Кем выдан"
            type="textarea"
            autogrow
            outlined
            dense
            :rules="[(val) => !!val || 'Обязательно']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
          <q-btn flat label="Отмена" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Сохранить"
            color="primary"
            @click="savePassport"
            class="q-px-lg"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { date, useQuasar } from 'quasar';
import { usePassportsStore } from '../stores/passports';
import type { Employee } from '../models/Employee';
import type { Passport, CreatePassportDto } from '../models/Passport';

const props = defineProps<{
  modelValue: boolean;
  employee: Employee | null;
}>();

defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'fire', employee: Employee | null): void;
}>();

const $q = useQuasar();
const passportsStore = usePassportsStore();

const tab = ref('passport');
const passportLoading = ref(false);
const passportDialog = ref(false);
const isEditPassport = ref(false);

const passportForm = ref<CreatePassportDto>({
  employee_id: '',
  full_passport: '',
  series: '',
  number: '',
  issue_date: '',
  issuer_code: '',
  issued_by: '',
});

const passport = computed(() => passportsStore.current);

const fullName = computed(() => {
  if (!props.employee) return '';
  return `${props.employee.last_name} ${props.employee.first_name} ${props.employee.middle_name ?? ''}`.trim();
});

const initials = computed(() => {
  if (!props.employee) return '?';
  return `${props.employee.last_name[0]}${props.employee.first_name[0]}`;
});

const formattedHireDate = computed(() => {
  return props.employee?.created_at
    ? date.formatDate(props.employee.created_at, 'DD.MM.YYYY')
    : '-';
});

const positionPlaceholder = computed(() => 'Должность не указана');
const departmentPlaceholder = computed(() => 'Отдел не указан');

function formatDate(val: string) {
  return date.formatDate(val, 'DD.MM.YYYY');
}

function formatIssuerCode(val: string) {
  if (val.length === 6) return `${val.slice(0, 3)}-${val.slice(3)}`;
  return val;
}

async function loadPassportData() {
  if (!props.employee?.id) return;
  passportLoading.value = true;
  try {
    await passportsStore.fetchByEmployee(props.employee.id);
  } finally {
    passportLoading.value = false;
  }
}

function openPassportForm(data: Passport | null = null) {
  if (data) {
    isEditPassport.value = true;
    passportForm.value = {
      employee_id: data.employee_id,
      full_passport: data.series + data.number,
      issue_date: date.formatDate(data.issue_date, 'YYYY-MM-DD'),
      issuer_code: data.issuer_code,
      issued_by: data.issued_by,
      series: data.series,
      number: data.number,
    };
  } else {
    isEditPassport.value = false;
    passportForm.value = {
      employee_id: props.employee?.id || '',
      full_passport: '',
      issue_date: '',
      issuer_code: '',
      issued_by: '',
      series: '',
      number: '',
    };
  }
  passportDialog.value = true;
}

async function savePassport() {
  try {
    if (isEditPassport.value && passport.value?.id) {
      await passportsStore.editPassport(passport.value.id, passportForm.value);
    } else {
      await passportsStore.addPassport(passportForm.value);
    }
    passportDialog.value = false;
    await loadPassportData();
  } catch (e) {
    console.error(e);
  }
}

function deletePassport() {
  $q.dialog({
    title: 'Подтверждение',
    message: 'Удалить паспортные данные?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (passport.value?.id) {
      void (async () => {
        await passportsStore.removePassport(passport.value!.id);
        await loadPassportData();
      })();
    }
  });
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.employee?.id) {
      void loadPassportData();
    } else if (!isOpen) {
      passportsStore.clearCurrent();
    }
  },
  { immediate: true },
);
</script>
