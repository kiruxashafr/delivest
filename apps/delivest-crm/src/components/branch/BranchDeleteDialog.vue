<script setup lang="ts">
import { ref } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import { isAxiosError } from "axios";
import { useBranchStore } from "@/stores/branch.store";
import type { BranchResponce } from "@delivest/types";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
  branch: BranchResponce | null;
}>();

const { t } = useI18n();
const emit = defineEmits(["update:visible", "deleted"]);

const branchStore = useBranchStore();
const toast = useToast();
const deleting = ref(false);

const close = () => emit("update:visible", false);

const handleDelete = async () => {
  if (!props.branch) return;

  deleting.value = true;
  try {
    await branchStore.deleteBranch(props.branch.id);

    toast.add({
      severity: "success",
      summary: t("branches.delete.success_summary"),
      detail: t("branches.delete.success_detail", { name: props.branch.name }),
      life: 3000,
    });

    emit("deleted");
    close();
  } catch (error) {
    let detail = t("branches.delete.error_detail");

    if (isAxiosError(error)) {
      const serverMessage = error.response?.data?.message;
      detail = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage || detail;
    }

    toast.add({
      severity: "error",
      summary: t("branches.delete.error_summary"),
      detail: detail,
      life: 5000,
    });
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    :header="t('branches.delete.title')"
    :modal="true"
    :draggable="false"
    class="w-full max-w-sm">
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <i class="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
      <p v-if="branch">
        {{ t("branches.delete.confirmation_text") }} <br />
        <span class="font-bold">"{{ branch.name }}"</span>?
      </p>
    </div>

    <template #footer>
      <div class="flex justify-center gap-2 w-full">
        <Button :label="t('common.cancel')" icon="pi pi-times" text @click="close" :disabled="deleting" />
        <Button
          :label="t('common.delete')"
          icon="pi pi-trash"
          severity="danger"
          :loading="deleting"
          @click="handleDelete" />
      </div>
    </template>
  </Dialog>
</template>
