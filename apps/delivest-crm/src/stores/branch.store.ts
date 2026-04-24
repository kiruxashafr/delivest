import type { BranchResponce } from "@delivest/types";
import { defineStore } from "pinia";
import api from "@/api/axios";

export const useBranchStore = defineStore("branch", {
  state: () => ({
    branches: [] as BranchResponce[],
    activeBranchId: localStorage.getItem("selectedBranchId") as string | null,
  }),

  getters: {
    activeBranch: state => {
      return state.branches.find(b => b.id === state.activeBranchId) || null;
    },
    isBranchSelected: state => !!state.activeBranchId,
  },

  actions: {
    async fetchBranches() {
      try {
        const { data } = await api.get<BranchResponce[]>("/admin/branch/all");
        this.branches = data;

        if (this.branches.length === 1 && !this.activeBranchId) {
          this.setActiveBranch(this.branches[0].id);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    },

    setActiveBranch(branchId: string) {
      this.activeBranchId = branchId;
      localStorage.setItem("selectedBranchId", branchId);
    },

    clearActiveBranch() {
      this.activeBranchId = null;
      localStorage.removeItem("selectedBranchId");
    },
  },
});
