<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.store';
import { useAuth } from './hooks/auth/useAuth';

const authStore = useAuthStore();
const { refreshTokens } = useAuth();

onMounted(async () => {
  if (authStore.accessToken) {
    try {
      await refreshTokens();
    } catch {
      // Ошибка обработается внутри refreshTokens (вызов logout)
    }
  }
  
  authStore.setInitialized(true);
});
</script>

<template>
  <div v-if="!authStore.isInitialized">
    Loading...
  </div>
  <template v-else>
    <Toast /> 
    <router-view />
  </template>
</template>
