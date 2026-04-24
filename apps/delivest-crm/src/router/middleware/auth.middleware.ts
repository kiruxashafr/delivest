import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useBranchStore } from "@/stores/branch.store";

export async function authMiddleware(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
  const authStore = useAuthStore();
  const branchStore = useBranchStore();

  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const { requiresAuth, guestOnly } = to.meta;

  if (requiresAuth && !isLoggedIn) {
    return { name: "login" };
  }

  if (guestOnly && isLoggedIn) {
    if (branchStore.isBranchSelected) {
      return {
        name: "dashboard",
        params: { branchAlias: branchStore.activeBranchAlias },
      };
    }
    return { name: "select-branch" };
  }

  return true;
}
