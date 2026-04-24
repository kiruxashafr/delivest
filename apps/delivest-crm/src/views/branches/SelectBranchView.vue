<script setup lang="ts">
import { useBranchStore } from "@/stores/branch.store";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";

const branchStore = useBranchStore();
const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

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
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-(--surface-900) mb-2">
        {{ t("branches.select_title") }}
      </h1>
      <p class="text-(--surface-500)">
        {{ t("branches.select_subtitle") }}
      </p>
    </div>

    <div class="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="branch in branchStore.branches"
        :key="branch.id"
        @click="selectBranch(branch.id)"
        class="group relative bg-(--surface-card) border border-(--surface-border) p-6 rounded-xl cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg active:scale-95 flex items-center min-h-27.5">
        <span class="absolute top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-(--surface-400)">
          {{ branch.alias }}
        </span>

        <div class="flex items-center gap-5 w-full pr-10">
          <div
            class="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
            <i class="pi pi-building text-2xl!"></i>
          </div>

          <div class="flex flex-col justify-center">
            <h3 class="text-lg font-bold text-(--surface-900) group-hover:text-primary transition-colors leading-tight">
              {{ branch.name }}
            </h3>
            <p v-if="branch.address" class="text-sm text-(--surface-500) mt-1 line-clamp-1">
              {{ branch.address }}
            </p>
          </div>
        </div>

        <div
          class="absolute bottom-3 right-4 flex items-center text-[11px] font-bold uppercase tracking-widest text-primary opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <span>{{ t("common.select") }}</span>
          <i class="pi pi-arrow-right ml-2"></i>
        </div>
      </div>
    </div>

    <Button
      variant="text"
      severity="secondary"
      class="mt-8"
      icon="pi pi-sign-out"
      label="Выйти из аккаунта"
      @click="
        () => {
          authStore.logout();
        }
      " />
  </div>
</template>
