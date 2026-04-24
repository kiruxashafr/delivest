import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useBranchStore } from "@/stores/branch.store";

export async function mainMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();
  const branchStore = useBranchStore();

  if (!authStore.isInitialized) {
    await authStore.init();
  }

  const isLoggedIn = authStore.isLoggedIn;
  const { requiresAuth, guestOnly } = to.meta;
  const urlAlias = to.params.branchAlias as string | undefined;

  if (requiresAuth && !isLoggedIn) {
    return next({ name: "login" });
  }

  if (guestOnly && isLoggedIn) {
    if (branchStore.isBranchSelected) {
      return next({ name: "dashboard", params: { branchAlias: branchStore.activeBranchAlias } });
    }
    return next({ name: "select-branch" });
  }

  if (isLoggedIn) {
    const isSelectingPage = to.name === "select-branch";
    const hasAnyBranches = branchStore.branches.length > 0;

    if (!hasAnyBranches && !isSelectingPage) {
      return next({ name: "select-branch" });
    }

    if (!branchStore.isBranchSelected) {
      if (urlAlias) {
        const success = branchStore.setActiveBranchByAlias(urlAlias);
        if (success) return next();
      }

      return isSelectingPage ? next() : next({ name: "select-branch" });
    }

    if (branchStore.isBranchSelected && isSelectingPage) {
      return next({ name: "dashboard", params: { branchAlias: branchStore.activeBranchAlias } });
    }

    if (urlAlias && urlAlias !== branchStore.activeBranchAlias) {
      const success = branchStore.setActiveBranchByAlias(urlAlias);

      if (!success) {
        return next({
          name: "dashboard",
          params: { branchAlias: branchStore.activeBranchAlias },
        });
      }
    }

    const needsParam = to.matched.some(record => record.path.includes(":branchAlias"));
    if (needsParam && !urlAlias && branchStore.activeBranchAlias) {
      return next({
        name: "dashboard",
        params: { branchAlias: branchStore.activeBranchAlias },
      } as any);
    }
  }

  next();
}
