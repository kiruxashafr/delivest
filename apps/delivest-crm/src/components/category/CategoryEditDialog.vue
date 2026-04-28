<script setup lang="ts">
import Dialog from "primevue/dialog";
import CategoryForm from "./CategoryForm.vue";
import { useCategoryForm } from "@/composables/useCategoryForm";
import type { CategoryResponse, CreateCategoryRequest } from "@delivest/types";

type CategoryFormData = Omit<CreateCategoryRequest, "branchId">;

const props = defineProps<{
  visible: boolean;
  category: CategoryResponse | null;
}>();

const emit = defineEmits<{
  (event: "update:visible", value: boolean): void;
  (event: "saved"): void;
}>();
const { submit, isSubmitting } = useCategoryForm();

const close = () => emit("update:visible", false);

const handleSave = async (formData: CategoryFormData) => {
  if (!props.category) return;

  const { success } = await submit(props.category.id, formData);

  if (success) {
    emit("saved");
    close();
  }
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="close"
    :header="`Редактировать категорию`"
    :modal="true"
    :draggable="false"
    class="p-fluid w-full max-w-md">
    <CategoryForm
      :initialData="props.category"
      :loading="isSubmitting"
      :submitLabel="$t('common.save')"
      @submit="handleSave"
      @cancel="close" />
  </Dialog>
</template>
