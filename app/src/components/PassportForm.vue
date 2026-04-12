<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 450px; border-radius: 12px">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-bold">{{ isEdit ? 'Редактировать' : 'Новый' }} паспорт</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm q-pt-md">
        <q-input
          v-model="form.full_passport"
          label="Серия и номер"
          mask="#### ######"
          unmasked-value
          outlined
          dense
          placeholder="0000 000000"
          :rules="[(val) => !!val || 'Обязательно', (val) => val.length === 10 || '10 цифр']"
        />
        <q-input
          v-model="form.issue_date"
          label="Дата выдачи"
          type="date"
          stack-label
          outlined
          dense
          :rules="[(val) => !!val || 'Обязательно']"
        />
        <q-input
          v-model="form.issuer_code"
          label="Код подразделения"
          mask="###-###"
          unmasked-value
          outlined
          dense
          placeholder="000-000"
          :rules="[(val) => !!val || 'Обязательно']"
        />
        <q-input
          v-model="form.issued_by"
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
        <q-btn unelevated label="Сохранить" color="primary" @click="onSave" class="q-px-lg" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { date } from 'quasar';
import { usePassportsStore } from '../stores/passports';
import type { Passport, CreatePassportDto } from '../models/Passport';

const props = defineProps<{
  modelValue: boolean;
  employeeId: string;
  data: Passport | null;
}>();

const emit = defineEmits(['update:modelValue', 'saved']);
const passportStore = usePassportsStore();
const isEdit = ref(false);

const form = ref<CreatePassportDto>({
  employee_id: '',
  full_passport: '',
  series: '',
  number: '',
  issue_date: '',
  issuer_code: '',
  issued_by: '',
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      isEdit.value = !!props.data;
      if (props.data) {
        form.value = {
          employee_id: props.data.employee_id,
          full_passport: props.data.series + props.data.number,
          issue_date: date.formatDate(props.data.issue_date, 'YYYY-MM-DD'),
          issuer_code: props.data.issuer_code,
          issued_by: props.data.issued_by,
          series: props.data.series,
          number: props.data.number,
        };
      } else {
        form.value = {
          employee_id: props.employeeId,
          series: '',
          number: '',
          issue_date: '',
          issuer_code: '',
          issued_by: '',
          full_passport: '',
        };
      }
    }
  },
);

async function onSave() {
  if (isEdit.value && props.data?.id) {
    await passportStore.editPassport(props.data.id, form.value);
  } else {
    await passportStore.addPassport(form.value);
  }
  emit('saved');
  emit('update:modelValue', false);
}
</script>
