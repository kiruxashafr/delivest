import { defineStore } from "pinia";
import api from "@/api/axios";
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@delivest/types";
import { useBranchStore } from "./branch.store";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [] as CategoryResponse[],
    isLoading: false,
  }),

  getters: {
    getCategoryById: state => {
      return (id: string) => state.categories.find(c => c.id === id) || null;
    },
    sortedCategories: state => {
      return [...state.categories].sort((a, b) => a.order - b.order);
    },
  },

  actions: {
    async fetchByActiveBranch() {
      const branchStore = useBranchStore();
      const activeBranch = branchStore.activeBranch;

      if (!activeBranch) {
        console.warn("Попытка загрузить категории без активного филиала");
        return;
      }

      return await this.fetchByBranch(activeBranch.id);
    },

    async fetchByBranch(branchId: string) {
      this.isLoading = true;
      try {
        const { data } = await api.get<CategoryResponse[]>(`/category/filial/${branchId}`);
        this.categories = data;
        return data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOne(id: string) {
      this.isLoading = true;
      try {
        const { data } = await api.get<CategoryResponse>(`/category/${id}`);
        return data;
      } catch (error) {
        console.error(`Error fetching category ${id}:`, error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createCategory(payload: CreateCategoryRequest) {
      try {
        const { data } = await api.post<CategoryResponse>("/admin/category/create", payload);
        this.categories.push(data);
        return data;
      } catch (error) {
        console.error("Error creating category:", error);
        throw error;
      }
    },

    async updateCategory(payload: UpdateCategoryRequest) {
      try {
        const { data } = await api.patch<CategoryResponse>(`/admin/category/update/${payload.categoryId}`, payload);

        const index = this.categories.findIndex(category => category.id === payload.categoryId);
        if (index !== -1) {
          this.categories[index] = data;
        }

        return data;
      } catch (error) {
        console.error(`Error updating category ${payload.categoryId}:`, error);
        throw error;
      }
    },

    async deleteCategory(id: string) {
      try {
        await api.delete(`/admin/category/delete/${id}`);
        this.categories = this.categories.filter(category => category.id !== id);
      } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw error;
      }
    },

    clearCategories() {
      this.categories = [];
    },
  },
});
