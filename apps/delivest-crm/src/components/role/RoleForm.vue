<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { type Permission } from "@delivest/common";
import type { RoleResponse, CreateRoleRequest } from "@delivest/types";

const { t } = useI18n();

const props = defineProps<{
  initialData?: RoleResponse | CreateRoleRequest | null;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: "submit", form: { name: string; permissions: Permission[] }): void;
  (e: "cancel"): void;
}>();

const form = ref({
  name: "",
  permissions: [] as Permission[],
});

watch(
  () => props.initialData,
  val => {
    if (val) {
      Object.assign(form.value, {
        name: val.name || "",
        permissions: val.permissions ? [...val.permissions] : [],
      });
    } else {
      form.value.name = "";
      form.value.permissions = [];
    }
  },
  { immediate: true },
);

const onCancel = () => emit("cancel");
const onSubmit = () => emit("submit", { ...form.value });
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2 max-w-md">
      <label class="text-sm font-bold text-(--surface-900)">
        {{ t("roles.form.name") }}
      </label>
      <InputText v-model="form.name" :placeholder="t('roles.form.name_placeholder')" />
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold">{{ t("roles.form.permissions") }}</h3>
          <p class="text-sm text-(--surface-500)">{{ t("roles.form.permissions_hint") }}</p>
        </div>
        <div class="text-sm font-medium bg-primary-100 text-primary-900 px-3 py-1 rounded-full">
          Выбрано: {{ form.permissions.length }}
        </div>
      </div>

      <PermissionSelect v-model="form.permissions" />
    </div>

    <div class="flex justify-end gap-2 mt-6 p-4 bg-(--surface-50) rounded-lg">
      <Button :label="t('common.cancel')" icon="pi pi-times" text @click="onCancel" />
      <Button
        :label="submitLabel || t('common.save')"
        icon="pi pi-check"
        :loading="loading"
        :disabled="!form.name || form.permissions.length === 0"
        @click="onSubmit" />
    </div>
  </div>
</template>
