<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import Dialog from "primevue/dialog";
import RoleForm from "./RoleForm.vue";
import { useRoleForm } from "@/composables/useRoleForm";
import type { RoleResponse, CreateRoleRequest, UpdateRoleRequest } from "@delivest/types";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  role: RoleResponse | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "saved"): void;
}>();

const { submit, isSubmitting } = useRoleForm();

const isEditing = computed(() => !!props.role);
const header = computed(() => (isEditing.value ? t("roles.edit.title") : t("roles.create.title")));
const submitLabel = computed(() => (isEditing.value ? t("common.save") : t("common.create")));

const close = () => emit("update:visible", false);

const handleSave = async (formData: CreateRoleRequest | UpdateRoleRequest) => {
  const { success } = await submit(props.role?.id || null, formData);

  if (success) {
    emit("saved");
    close();
  }
};
</script>

<template>
  <Dialog :visible="visible" @update:visible="close" :header="header" :modal="true" \>
    <RoleForm
      v-if="role"
      :initial-data="role"
      :loading="isSubmitting"
      :submit-label="submitLabel"
      @submit="handleSave"
      @cancel="close" />
  </Dialog>
</template>
