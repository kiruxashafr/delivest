<script setup lang="ts">
import { useBranchStore } from "@/stores/branch.store";
const branchStore = useBranchStore();
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-64 bg-surface-card border-r border-surface-border">
      <nav>
        <router-link :to="{ name: 'dashboard', params: { branchAlias: branchStore.activeBranchAlias } }">
          Главная
        </router-link>
        <router-link :to="{ name: 'orders', params: { branchAlias: branchStore.activeBranchAlias } }">
          Заказы
        </router-link>
      </nav>
    </aside>

    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>
