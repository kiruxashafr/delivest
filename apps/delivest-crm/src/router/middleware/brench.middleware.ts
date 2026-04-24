import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useBranchStore } from "@/stores/branch.store";

export async function branchMiddleware(to: RouteLocationNormalized) {
  const authStore = useAuthStore();
  const branchStore = useBranchStore();

  if (!authStore.isLoggedIn) return true;

  const urlAlias = to.params.branchAlias as string | undefined;
  const isSelectingPage = to.name === "select-branch";

  if (!urlAlias && to.name !== "select-branch") {
    if (branchStore.activeBranchAlias) {
      return {
        name: "dashboard",
        params: { branchAlias: branchStore.activeBranchAlias },
      };
    }
    return { name: "select-branch" };
  }
  if (branchStore.branches.length === 0 && !isSelectingPage) {
    await branchStore.fetchBranches();
    if (branchStore.branches.length === 0) return { name: "select-branch" };
  }

  if (isSelectingPage) {
    return true;
  }

  if (urlAlias) {
    if (urlAlias !== branchStore.activeBranchAlias) {
      const success = branchStore.setActiveBranchByAlias(urlAlias);
      if (!success) {
        return { name: "select-branch" };
      }
    }
  } else {
    if (branchStore.activeBranchAlias) {
      return { ...to, params: { ...to.params, branchAlias: branchStore.activeBranchAlias } };
    }
    return { name: "select-branch" };
  }

  return true;
}
