<script setup lang="ts">
import { useRoleStore } from "@/stores/role.store";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  user: { name?: string; roleId?: string } | null;
}>();

const { t } = useI18n();
const roleStore = useRoleStore();

const displayRoleName = computed(() => {
  if (!props.user?.roleId) return t("menu.accessYes");

  return roleStore.getRoleNameById(props.user.roleId) || t("menu.accessYes");
});
</script>

<template>
  <div
    v-if="user"
    class="flex items-center gap-3 mb-6 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
      <i class="pi pi-user text-xl"></i>
    </div>

    <div class="flex flex-col overflow-hidden">
      <span class="font-semibold truncate text-surface-900 dark:text-surface-0">
        {{ user.name || t("menu.staff") }}
      </span>
      <span class="text-xs text-surface-500 dark:text-surface-400 truncate">
        {{ displayRoleName }}
      </span>
    </div>
  </div>
</template>
