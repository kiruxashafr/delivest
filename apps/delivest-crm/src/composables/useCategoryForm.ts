import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { isAxiosError } from "axios";
import { useCategoryStore } from "@/stores/category.store";
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@delivest/types";

export function useCategoryForm() {
  const { t } = useI18n();
  const categoryStore = useCategoryStore();
  const toast = useToast();
  const isSubmitting = ref(false);

  const getServerMessage = (error: any) => {
    if (isAxiosError(error)) {
      const serverData = error.response?.data;
      if (serverData?.message) {
        return Array.isArray(serverData.message) ? serverData.message[0] : serverData.message;
      }
    }
    return t("common.error");
  };

  const handleError = (error: any) => {
    const detail = getServerMessage(error);

    toast.add({
      severity: "error",
      summary: t("common.error"),
      detail,
      life: 5000,
    });
  };

  const remove = async (category: CategoryResponse | null) => {
    if (!category) return { success: false };

    isSubmitting.value = true;
    try {
      await categoryStore.deleteCategory(category.id);
      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: `Категория "${category.name}" удалена`,
        life: 3000,
      });
      return { success: true };
    } catch (error) {
      handleError(error);
      return { success: false, error };
    } finally {
      isSubmitting.value = false;
    }
  };

  const submit = async (id: string | null, data: CreateCategoryRequest | UpdateCategoryRequest) => {
    isSubmitting.value = true;
    const isUpdate = !!id;

    try {
      if (isUpdate && id) {
        await categoryStore.updateCategory(data as UpdateCategoryRequest);
      } else {
        await categoryStore.createCategory(data as CreateCategoryRequest);
      }

      toast.add({
        severity: "success",
        summary: "Успешно",
        detail: isUpdate ? "Категория обновлена" : "Категория создана",
        life: 3000,
      });
      return { success: true, data };
    } catch (error) {
      handleError(error);
      return { success: false, error };
    } finally {
      isSubmitting.value = false;
    }
  };

  return { submit, remove, isSubmitting };
}
