<script setup lang="ts">
import Dialog from "primevue/dialog";
import CategoryForm from "./CategoryForm.vue";
import { useBranchStore } from "@/stores/branch.store";
import { useCategoryForm } from "@/composables/useCategoryForm";
import type { CreateCategoryRequest } from "@delivest/types";

type CategoryFormData = Omit<CreateCategoryRequest, "branchId">;

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (event: "update:visible", value: boolean): void;
  (event: "created"): void;
}>();

const branchStore = useBranchStore();
const { submit, isSubmitting } = useCategoryForm();

const close = () => emit("update:visible", false);

const handleCreate = async (formData: CategoryFormData) => {
  if (!branchStore.activeBranchId) return;

  const payload = { ...formData, branchId: branchStore.activeBranchId };
  const { success } = await submit(null, payload);

  if (success) {
    emit("created");
    close();
  }
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="close"
    :header="`Создать категорию`"
    :modal="true"
    :draggable="false"
    class="p-fluid w-full max-w-md">
    <CategoryForm :loading="isSubmitting" :submitLabel="$t('common.create')" @submit="handleCreate" @cancel="close" />
  </Dialog>
</template>
