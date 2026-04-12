<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 500px; border-radius: 12px">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? 'Редактировать' : 'Добавить' }} адрес
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-sm q-pt-md">
        <q-input
          v-model="form.region"
          label="Регион / Область"
          outlined
          dense
          :rules="[(val) => !!val || 'Обязательно']"
        />
        <q-input
          v-model="form.city"
          label="Город / Населенный пункт"
          outlined
          dense
          :rules="[(val) => !!val || 'Обязательно']"
        />
        <q-input
          v-model="form.street"
          label="Улица"
          outlined
          dense
          :rules="[(val) => !!val || 'Обязательно']"
        />

        <div class="row q-gutter-x-sm">
          <q-input
            v-model="form.house"
            label="Дом"
            class="col"
            outlined
            dense
            :rules="[(val) => !!val || 'Обязательно']"
          />
          <q-input v-model="form.block" label="Корпус" class="col" outlined dense />
          <q-input v-model="form.flat" label="Кв." class="col" outlined dense />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-gutter-x-sm">
        <q-btn flat label="Отмена" color="grey-7" @click="$emit('update:modelValue', false)" />
        <q-btn unelevated label="Сохранить" color="primary" @click="onSave" class="q-px-lg" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAddressesStore } from '../stores/addresses';
import type { Address, CreateAddressDto } from '../models/Address';

const props = defineProps<{
  modelValue: boolean;
  employeeId: string;
  data: Address | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'saved'): void;
}>();

const addressStore = useAddressesStore();
const isEdit = ref(false);

const form = ref<CreateAddressDto>({
  employee_id: '',
  region: '',
  city: '',
  street: '',
  house: '',
  block: '',
  flat: '',
  full_address: '',
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isEdit.value = !!props.data;

      if (props.data) {
        const d = props.data;
        form.value = {
          employee_id: d.employee_id,
          region: d.region || '',
          city: d.city || '',
          street: d.street || '',
          house: d.house || '',
          block: d.block ?? '',
          flat: d.flat ?? '',
          full_address: '',
        };
      } else {
        form.value = {
          employee_id: props.employeeId,
          region: '',
          city: '',
          street: '',
          house: '',
          block: '',
          flat: '',
          full_address: '',
        };
      }
    }
  },
  { immediate: true },
);

async function onSave() {
  if (!form.value.employee_id) {
    form.value.employee_id = props.employeeId;
  }

  try {
    if (isEdit.value && props.data?.id) {
      await addressStore.editAddress(props.data.id, form.value);
    } else {
      await addressStore.addAddress(form.value);
    }

    emit('saved');
    emit('update:modelValue', false);
  } catch (error) {
    console.error(error);
  }
}
</script>
