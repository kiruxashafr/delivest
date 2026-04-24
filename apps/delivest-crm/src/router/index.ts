import { createRouter, createWebHistory } from "vue-router";
import { mainMiddleware } from "./middleware/main.middleware";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { guestOnly: true },
    },

    {
      path: "/:branchAlias",
      component: () => import("../layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: "orders",
          name: "orders",

          component: () => import("../views/dashboard/OrdersView.vue"),
        },
      ],
    },
    {
      path: "/select-branch",
      name: "select-branch",
      component: () => import("../views/SelectBranchView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach(mainMiddleware);

export default router;
