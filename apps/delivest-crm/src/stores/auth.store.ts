import { defineStore } from "pinia";
import type { StaffResponse, TokenStaffResponse } from "@delivest/types";
import axios from "axios";
import api from "@/api/axios";
import { useBranchStore } from "./branch.store";
import router from "@/router";
import { Permission } from "@delivest/common";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    staff: null as StaffResponse | null,
    accessToken: "" as string,
    isInitialized: false,
    refreshPromise: null as Promise<string | null> | null,
  }),

  getters: {
    isLoggedIn: state => !!state.accessToken,

    hasPermission: state => {
      return (perm: Permission): boolean => {
        const perms = state.staff?.permissions;
        if (!perms) return false;
        return perms.includes(Permission.ADMIN) || perms.includes(perm);
      };
    },

    canAny: state => {
      return (perms: Permission[]): boolean => {
        if (!state.staff) return false;
        if (state.staff.permissions.includes("ADMIN")) return true;

        return perms.some(p => state.staff!.permissions.includes(p));
      };
    },

    canAll: state => {
      return (perms: Permission[]): boolean => {
        if (!state.staff) return false;
        if (state.staff.permissions.includes("ADMIN")) return true;

        return perms.every(p => state.staff!.permissions.includes(p));
      };
    },
  },

  actions: {
    setToken(token: string) {
      this.accessToken = token;
    },

    async logout() {
      try {
        await api.post("/staff/logout");
      } catch (error) {
        console.error("Server logout failed:", error);
      } finally {
        localStorage.clear();
        this.setToken("");
        this.staff = null;
        const branchStore = useBranchStore();
        branchStore.$reset();
        router.push({ name: "login" });
      }
    },

    async refresh(): Promise<string | null> {
      if (this.refreshPromise) return this.refreshPromise;

      this.refreshPromise = (async () => {
        try {
          const { data } = await axios.get<TokenStaffResponse>(`${import.meta.env.VITE_API_URL}/staff/refresh`, {
            withCredentials: true,
          });

          const token = data.accessToken;
          this.setToken(token);
          return token;
        } catch (e) {
          this.logout();
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();

      return this.refreshPromise;
    },

    async getMe() {
      try {
        const { data } = await api.get("/staff/me");
        this.staff = data;
        return data;
      } catch (e) {
        this.staff = null;
      }
    },

    async login(login: string, password: string) {
      try {
        const { data } = await api.post<TokenStaffResponse>("/staff/login", { login, password });
        this.setToken(data.accessToken);
        await this.getMe();
        const branchStore = useBranchStore();
        await branchStore.fetchBranches();
      } catch (e) {
        throw e;
      }
    },

    async init() {
      if (this.isInitialized) return;

      try {
        const token = await this.refresh();
        if (token) {
          await this.getMe();

          const branchStore = useBranchStore();
          await branchStore.fetchBranches();
        }
      } catch (e) {
        this.logout();
      } finally {
        this.isInitialized = true;
      }
    },
  },
  persist: {
    key: "auth-storage",
    storage: localStorage,
    pick: ["accessToken"],
  },
});
