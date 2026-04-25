<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import InputMask from "primevue/inputmask";
import type { BranchResponce } from "@delivest/types";
import { useBranchStore } from "@/stores/branch.store";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { isAxiosError } from "axios";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  visible: boolean;
  branch: BranchResponce | null;
}>();

const { t } = useI18n();
const emit = defineEmits(["update:visible", "saved"]);
const branchStore = useBranchStore();
const saving = ref(false);
const toast = useToast();
const router = useRouter();
const route = useRoute();

const form = ref({
  name: "",
  alias: "",
  address: "",
  description: "",
  phone: "",
});

watch(
  () => props.visible,
  isOpening => {
    if (isOpening && props.branch) {
      form.value = {
        name: props.branch.name || "",
        alias: props.branch.alias || "",
        address: props.branch.address || "",
        phone: props.branch.phone || "",
        description: props.branch.description || "",
      };
    }
  },
);

const close = () => emit("update:visible", false);

const handleSave = async () => {
  if (!props.branch) return;

  saving.value = true;
  try {
    const oldAlias = props.branch.alias;
    const newAlias = form.value.alias;

    await branchStore.updateBranch(props.branch.id, form.value);

    const isEditingCurrentUrlBranch = route.params.branchAlias === oldAlias;

    if (isEditingCurrentUrlBranch && oldAlias !== newAlias) {
      await branchStore.fetchBranches();

      branchStore.setActiveBranchByAlias(newAlias);

      await router.push({
        name: route.name || "dashboard",
        params: { ...route.params, branchAlias: newAlias },
      });
    }
    toast.add({
      severity: "success",
      summary: t("branches.update.success_summary"),
      detail: t("branches.update.success_detail"),
      life: 3000,
    });

    emit("saved");
    close();
  } catch (error) {
    let errorMessage = t("branches.update.error_detail");

    if (isAxiosError(error)) {
      const serverData = error.response?.data;

      if (serverData?.message) {
        errorMessage = Array.isArray(serverData.message) ? serverData.message[0] : serverData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    toast.add({
      severity: "error",
      summary: t("branches.update.error_summary"),
      detail: errorMessage,
      life: 5000,
    });

    console.error("[BranchUpdate] Error:", error);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="close"
    :header="t('branches.update.title')"
    :modal="true"
    :draggable="false"
    class="p-fluid w-full max-w-md">
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-2">
        <label for="name" class="text-sm font-bold">{{ t("branches.form.name") }}</label>
        <InputText id="name" v-model="form.name" autofocus :placeholder="t('branches.form.name_placeholder')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="alias" class="text-sm font-bold">{{ t("branches.form.alias") }}</label>
        <InputText id="alias" v-model="form.alias" :placeholder="t('branches.form.alias_placeholder')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="address" class="text-sm font-bold">{{ t("branches.form.address") }}</label>
        <Textarea
          id="address"
          v-model="form.address"
          rows="2"
          autoResize
          :placeholder="t('branches.form.address_placeholder')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="description" class="text-sm font-bold">{{ t("branches.form.description") }}</label>
        <Textarea
          id="description"
          v-model="form.description"
          rows="3"
          autoResize
          :placeholder="t('branches.form.description_placeholder')" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="phone" class="text-sm font-bold">{{ t("branches.form.phone") }}</label>
        <InputMask id="phone" v-model="form.phone" mask="+79999999999" placeholder="+79001234567" :unmask="false" />
        <small class="text-(--surface-500)">{{ t("branches.form.phone_format") }}</small>
      </div>
    </div>

    <template #footer>
      <Button :label="t('common.cancel')" icon="pi pi-times" text @click="close" />
      <Button
        :label="t('common.save')"
        icon="pi pi-check"
        :loading="saving"
        :disabled="!form.name || !form.alias"
        @click="handleSave" />
    </template>
  </Dialog>
</template>
