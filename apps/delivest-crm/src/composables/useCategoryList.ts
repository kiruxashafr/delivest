import { ref } from "vue";
import { useToast } from "primevue";
import { useI18n } from "vue-i18n";
import { isAxiosError } from "axios";
import { useCategoryStore } from "@/stores/category.store";
import { useBranchStore } from "@/stores/branch.store";

export function useCategoryList() {
  const categoryStore = useCategoryStore();
  const branchStore = useBranchStore();
  const toast = useToast();
  const { t } = useI18n();
  const isLoading = ref(false);

  const handleError = (error: unknown) => {
    let detail = t("common.error");

    if (isAxiosError(error)) {
      const serverMessage = error.response?.data?.message;
      if (serverMessage) {
        detail = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      }
    }

    toast.add({
      severity: "error",
      summary: t("common.error"),
      detail,
      life: 5000,
    });
  };

  const loadCategories = async () => {
    if (!branchStore.activeBranchId) {
      categoryStore.categories = [];
      return [];
    }

    isLoading.value = true;
    try {
      await categoryStore.fetchByBranch(branchStore.activeBranchId);
      return categoryStore.categories;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return {
    categoryStore,
    isLoading,
    loadCategories,
  };
}
