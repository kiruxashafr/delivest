import { ref } from "vue";
import { useRoleStore } from "@/stores/role.store";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { isAxiosError } from "axios";
import type { RoleResponse, CreateRoleRequest, UpdateRoleRequest } from "@delivest/types";

export function useRoleForm() {
  const { t } = useI18n();
  const roleStore = useRoleStore();
  const toast = useToast();
  const isSubmitting = ref(false);

  const handleError = (error: any, type: "create" | "update" | "delete") => {
    let errorMessage = t(`roles.${type}.error_detail`);

    if (isAxiosError(error)) {
      const serverData = error.response?.data;
      if (serverData?.message) {
        errorMessage = Array.isArray(serverData.message) ? serverData.message[0] : serverData.message;
      }
    }

    toast.add({
      severity: "error",
      summary: t(`roles.${type}.error_summary`),
      detail: errorMessage,
      life: 5000,
    });
  };

  const remove = async (role: RoleResponse | null) => {
    if (!role) return { success: false };

    isSubmitting.value = true;
    try {
      await roleStore.deleteRole(role.id);

      toast.add({
        severity: "success",
        summary: t("roles.delete.success_summary"),
        detail: t("roles.delete.success_detail", { name: role.name }),
        life: 3000,
      });
      return { success: true };
    } catch (error) {
      handleError(error, "delete");
      return { success: false, error };
    } finally {
      isSubmitting.value = false;
    }
  };

  const submit = async (id: string | null, data: CreateRoleRequest | UpdateRoleRequest) => {
    isSubmitting.value = true;
    const isUpdate = !!id;
    const action = isUpdate ? "update" : "create";

    try {
      if (isUpdate && id) {
        await roleStore.updateRole(id, data as UpdateRoleRequest);
      } else {
        await roleStore.createRole(data as CreateRoleRequest);
      }

      toast.add({
        severity: "success",
        summary: t(`roles.${action}.success_summary`),
        detail: t(`roles.${action}.success_detail`),
        life: 3000,
      });
      return { success: true, data };
    } catch (error) {
      handleError(error, action);
      return { success: false, error };
    } finally {
      isSubmitting.value = false;
    }
  };

  return { submit, remove, isSubmitting };
}
