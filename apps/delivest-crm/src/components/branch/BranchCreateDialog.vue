<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import InputMask from "primevue/inputmask";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "primevue";
import { isAxiosError } from "axios";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  visible: boolean;
}>();

const { t } = useI18n();
const emit = defineEmits(["update:visible", "created"]);
const branchStore = useBranchStore();
const saving = ref(false);
const toast = useToast();

const initialForm = {
  name: "",
  alias: "",
  address: "",
  phone: "",
  description: "",
};

const form = ref({ ...initialForm });

watch(
  () => props.visible,
  isOpening => {
    if (isOpening) {
      form.value = { ...initialForm };
    }
  },
);

const close = () => emit("update:visible", false);

const handleCreate = async () => {
  saving.value = true;
  try {
    await branchStore.createBranch(form.value);

    toast.add({
      severity: "success",
      summary: t("branches.create.success_summary"),
      detail: t("branches.create.success_detail"),
      life: 3000,
    });

    emit("created");
    close();
  } catch (error: any) {
    let errorMessage = t("branches.create.error_detail");

    if (isAxiosError(error)) {
      const serverData = error.response?.data;
      if (serverData?.message) {
        errorMessage = Array.isArray(serverData.message) ? serverData.message[0] : serverData.message;
      }
    }

    toast.add({
      severity: "error",
      summary: t("branches.create.error_summary"),
      detail: errorMessage,
      life: 5000,
    });

    console.error("Ошибка при создании:", error);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    :header="t('branches.create.title')"
    :modal="true"
    :draggable="false"
    class="p-fluid w-full max-w-md">
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-2">
        <label for="new-name" class="text-sm font-bold">{{ t("branches.form.name") }}</label>
        <InputText id="new-name" v-model="form.name" :placeholder="t('branches.form.name_placeholder_new')" autofocus />
      </div>

      <div class="flex flex-col gap-2">
        <label for="new-alias" class="text-sm font-bold">{{ t("branches.form.alias") }}</label>
        <InputText id="new-alias" v-model="form.alias" :placeholder="t('branches.form.alias_placeholder')" />
        <small class="text-(--surface-500)">{{ t("branches.form.alias_hint") }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="address" class="font-semibold">{{ t("branches.form.address") }}</label>
        <Textarea
          id="address"
          v-model="form.address"
          rows="3"
          autoResize
          :placeholder="t('branches.form.address_placeholder_new')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="description" class="font-semibold">{{ t("branches.form.description") }}</label>
        <Textarea
          id="description"
          v-model="form.description"
          rows="3"
          autoResize
          :placeholder="t('branches.form.description_placeholder')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="new-phone" class="text-sm font-bold">{{ t("branches.form.phone") }}</label>
        <InputMask id="new-phone" v-model="form.phone" mask="+79999999999" placeholder="+79255355278" :unmask="false" />
        <small class="text-(--surface-500)">{{ t("branches.form.phone_format") }}</small>
      </div>
    </div>

    <template #footer>
      <Button :label="t('common.cancel')" icon="pi pi-times" text @click="close" />
      <Button
        :label="t('common.create')"
        icon="pi pi-plus"
        :loading="saving"
        :disabled="!form.name || !form.alias"
        @click="handleCreate" />
    </template>
  </Dialog>
</template>
