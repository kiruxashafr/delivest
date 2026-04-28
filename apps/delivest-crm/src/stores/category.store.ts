import { defineStore } from "pinia";
import api from "@/api/axios";
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@delivest/types";

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [] as CategoryResponse[],
    currentCategory: null as CategoryResponse | null,
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
        this.currentCategory = data;
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

    async updateCategory(id: string, payload: UpdateCategoryRequest) {
      try {
        const { data } = await api.patch<CategoryResponse>(`/admin/category/update/${id}`, payload);

        const index = this.categories.findIndex(category => category.id === id);
        if (index !== -1) {
          this.categories[index] = data;
        }

        if (this.currentCategory?.id === id) {
          this.currentCategory = data;
        }

        return data;
      } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        throw error;
      }
    },

    async deleteCategory(id: string) {
      try {
        await api.delete(`/admin/category/delete/${id}`);
        this.categories = this.categories.filter(category => category.id !== id);
        if (this.currentCategory?.id === id) {
          this.currentCategory = null;
        }
      } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw error;
      }
    },

    clearCategories() {
      this.categories = [];
      this.currentCategory = null;
    },
  },
});
