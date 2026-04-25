<script setup lang="ts">
import { onMounted } from "vue";
import { useBranchStore } from "@/stores/branch.store";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";

const branchStore = useBranchStore();
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

onMounted(async () => {
  if (branchStore.branches.length === 0) {
    await branchStore.fetchBranches();
  }
});

const selectBranch = (id: string) => {
  branchStore.setActiveBranch(id);
  router.push({
    name: "dashboard",
    params: { branchAlias: branchStore.activeBranchAlias },
  });
};
</script>

<template>
  <div class="min-h-dvh bg-(--surface-ground) p-6 flex flex-col items-center justify-center">
    <div class="text-center mb-8" v-if="branchStore.branches.length > 0 || branchStore.isLoading">
      <h1 class="text-3xl font-bold text-(--surface-900) mb-2">
        {{ t("branches.select_title") }}
      </h1>
      <p class="text-(--surface-500)">
        {{ t("branches.select_subtitle") }}
      </p>
    </div>

    <div class="w-full max-w-2xl">
      <div
        class="grid gap-4"
        :class="[branchStore.branches.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto']">
        <template v-if="branchStore.isLoading && branchStore.branches.length === 0">
          <BranchSelectCard v-for="i in 4" :key="i" loading />
        </template>

        <template v-else-if="branchStore.branches.length > 0">
          <BranchSelectCard
            v-for="branch in branchStore.branches"
            :key="branch.id"
            :branch="branch"
            @select="selectBranch" />
        </template>

        <div
          v-else
          class="col-span-full text-center p-12 bg-(--surface-card) border border-dashed border-(--surface-border) rounded-2xl shadow-sm">
          <div class="w-20 h-20 bg-(--surface-100) rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="pi pi-lock text-4xl! text-(--surface-400)"></i>
          </div>
          <h2 class="text-xl font-bold text-(--surface-900) mb-2">
            {{ t("branches.no_branches_title") }}
          </h2>
          <p class="text-(--surface-500) max-w-sm mx-auto mb-8">
            {{ t("branches.no_branches_found") }}
          </p>
          <Button
            :label="t('branches.logout')"
            icon="pi pi-arrow-left"
            @click="authStore.logout()"
            class="p-button-outlined p-button-secondary" />
        </div>
      </div>
    </div>

    <Button
      v-if="branchStore.branches.length > 0"
      variant="text"
      severity="secondary"
      class="mt-8 opacity-60 hover:opacity-100 transition-opacity"
      icon="pi pi-sign-out"
      :label="t('branches.logout')"
      @click="authStore.logout()" />
  </div>
</template>
