<script setup lang="ts">
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useCategoryForm } from "@/composables/useCategoryForm";
import type { CategoryResponse } from "@delivest/types";

const props = defineProps<{
  visible: boolean;
  category: CategoryResponse | null;
}>();

const emit = defineEmits<{
  (event: "update:visible", value: boolean): void;
  (event: "deleted"): void;
}>();
const { remove, isSubmitting } = useCategoryForm();

const close = () => emit("update:visible", false);

const handleDelete = async () => {
  const { success } = await remove(props.category);

  if (success) {
    emit("deleted");
    close();
  }
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="close"
    :header="`Удалить категорию`"
    :modal="true"
    :draggable="false"
    class="w-full max-w-sm">
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <i class="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
      <p v-if="props.category">
        Удалить категорию <br />
        <span class="font-bold">"{{ props.category.name }}"</span>?
      </p>
    </div>

    <template #footer>
      <div class="flex justify-center gap-2 w-full">
        <Button :label="$t('common.cancel')" icon="pi pi-times" text @click="close" :disabled="isSubmitting" />
        <Button
          :label="$t('common.delete')"
          icon="pi pi-trash"
          severity="danger"
          :loading="isSubmitting"
          @click="handleDelete" />
      </div>
    </template>
  </Dialog>
</template>
