<template>
  <div class="row items-center justify-center" style="min-height: 100vh; background: #f4f4fb">
    <q-card flat bordered style="width: 380px; border-radius: 20px; overflow: hidden">
      <div class="q-pa-lg" style="background: #7e7bec">
        <div class="row items-center no-wrap q-mb-xs">
          <div class="column">
            <div class="text-white text-h6 text-weight-bolder" style="line-height: 1.1">
              Учет кадров
            </div>
            <div class="text-white text-caption text-uppercase opacity-80" style="font-size: 10px">
              Система управления сотрудниками
            </div>
          </div>
        </div>
      </div>

      <q-card-section class="q-pa-lg">
        <div class="text-h6 text-weight-bold q-mb-md">Вход в систему</div>

        <q-input
          v-model="form.login"
          outlined
          dense
          label="Логин"
          class="q-mb-sm"
          :rules="[(val) => !!val || 'Обязательное поле']"
          @keyup.enter="submit"
        />

        <q-input
          v-model="form.password"
          outlined
          dense
          label="Пароль"
          :type="showPassword ? 'text' : 'password'"
          class="q-mb-md"
          :rules="[(val) => !!val || 'Обязательное поле']"
          @keyup.enter="submit"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-btn
          color="primary"
          label="Войти"
          rounded
          class="full-width"
          :loading="loading"
          @click="submit"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from '../boot/axios';
import type { AuthUser } from '../models/User';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const showPassword = ref(false);
const form = ref({ login: '', password: '' });

async function submit() {
  if (!form.value.login || !form.value.password) return;

  loading.value = true;
  try {
    const { data } = await api.post<AuthUser>('/auth/login', form.value);
    authStore.setAuth(data);
    window.location.replace('/');
    await router.push('/');
  } catch {
    $q.notify({ type: 'negative', message: 'Неверный логин или пароль' });
  } finally {
    loading.value = false;
  }
}
</script>
