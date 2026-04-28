<script setup lang="ts">
import { ref, watch } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { useI18n } from "vue-i18n";
import type { CategoryResponse, CreateCategoryRequest } from "@delivest/types";

type CategoryFormData = Omit<CreateCategoryRequest, "branchId">;

const { t } = useI18n();
const props = defineProps<{
  initialData?: CategoryResponse | CategoryFormData;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (event: "submit", payload: CategoryFormData): void;
  (event: "cancel"): void;
}>();

const form = ref<{ name: string; order: number }>({
  name: "",
  order: 0,
});

watch(
  () => props.initialData,
  value => {
    if (value) {
      form.value.name = value.name || "";
      form.value.order = typeof value.order === "number" ? value.order : Number(value.order) || 0;
    } else {
      form.value.name = "";
      form.value.order = 0;
    }
  },
  { immediate: true },
);

const onCancel = () => emit("cancel");
const onSubmit = () => emit("submit", { name: form.value.name, order: form.value.order });
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-bold">{{ t("menu.categories") }}</label>
      <InputText v-model="form.name" :placeholder="t('menu.categories')" autofocus />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-bold">Порядок</label>
      <input v-model.number="form.order" type="number" class="p-inputtext w-full" :placeholder="t('common.search')" />
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <Button :label="t('common.cancel')" icon="pi pi-times" text @click="onCancel" />
      <Button
        :label="props.submitLabel || t('common.save')"
        :icon="props.loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
        :loading="props.loading"
        :disabled="!form.name"
        @click="onSubmit" />
    </div>
  </div>
</template>
