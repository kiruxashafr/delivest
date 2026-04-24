import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useBranchStore } from "@/stores/branch.store";

export async function branchMiddleware(to: RouteLocationNormalized, _from: RouteLocationNormalized) {
  const authStore = useAuthStore();
  const branchStore = useBranchStore();

  if (!authStore.isLoggedIn) {
    return true;
  }

  const urlAlias = to.params.branchAlias as string | undefined;
  const isSelectingPage = to.name === "select-branch";
  const hasAnyBranches = branchStore.branches.length > 0;

  if (!hasAnyBranches && !isSelectingPage) {
    return { name: "select-branch" };
  }

  if (!branchStore.isBranchSelected) {
    if (urlAlias) {
      const success = branchStore.setActiveBranchByAlias(urlAlias);
      if (success) return true;
    }
    return isSelectingPage ? true : { name: "select-branch" };
  }

  if (branchStore.isBranchSelected && isSelectingPage) {
    return { name: "dashboard", params: { branchAlias: branchStore.activeBranchAlias } };
  }

  if (urlAlias && urlAlias !== branchStore.activeBranchAlias) {
    const success = branchStore.setActiveBranchByAlias(urlAlias);
    if (!success) {
      return {
        name: "dashboard",
        params: { branchAlias: branchStore.activeBranchAlias },
      };
    }
  }

  const needsParam = to.matched.some(record => record.path.includes(":branchAlias"));
  if (needsParam && !urlAlias && branchStore.activeBranchAlias) {
    return {
      name: "dashboard",
      params: { branchAlias: branchStore.activeBranchAlias },
    };
  }

  return true;
}
