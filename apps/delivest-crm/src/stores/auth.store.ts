import { defineStore } from "pinia";
import router from "@/router";
import type { TokenStaffResponse } from "@delivest/types";
import axios from "axios";
import { queryClient } from "@/api/query-client";
import api from "@/api/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: "" as string,
    isInitialized: false,
    refreshPromise: null as Promise<string | null> | null,
  }),

  getters: {
    isLoggedIn: state => !!state.accessToken,
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
        this.setToken("");
        queryClient.clear();
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
    async init() {
      if (this.isInitialized) return;

      try {
        await this.refresh();
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
