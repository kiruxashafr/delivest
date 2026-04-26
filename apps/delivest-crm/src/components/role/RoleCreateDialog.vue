<script setup lang="ts">
import Dialog from "primevue/dialog";
import RoleForm from "./RoleForm.vue";
import { useRoleForm } from "@/composables/useRoleForm";
import type { CreateRoleRequest } from "@delivest/types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "created"): void;
}>();

const { submit, isSubmitting } = useRoleForm();

const close = () => emit("update:visible", false);

const handleCreate = async (formData: CreateRoleRequest) => {
  const { success } = await submit(null, formData);

  if (success) {
    emit("created");
    close();
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    :header="t('roles.create.title')"
    :modal="true"
    :draggable="false"
    class="p-fluid w-full max-w-md">
    <RoleForm :loading="isSubmitting" :submit-label="t('common.create')" @submit="handleCreate" @cancel="close" />
  </Dialog>
</template>
