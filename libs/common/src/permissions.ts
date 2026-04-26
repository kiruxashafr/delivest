export const Permission = {
  ADMIN: "ADMIN",

  // Работник
  STAFF_CREATE: "STAFF_CREATE",
  STAFF_READ: "STAFF_READ",
  STAFF_UPDATE: "STAFF_UPDATE",
  STAFF_DELETE: "STAFF_DELETE",

  // Клиент
  CLIENT_CREATE: "CLIENT_CREATE",
  CLIENT_READ: "CLIENT_READ",
  CLIENT_UPDATE: "CLIENT_UPDATE",
  CLIENT_DELETE: "CLIENT_DELETE",

  // Роль
  ROLE_CREATE: "ROLE_CREATE",
  ROLE_READ: "ROLE_READ",
  ROLE_UPDATE: "ROLE_UPDATE",
  ROLE_DELETE: "ROLE_DELETE",

  // Продукт
  PRODUCT_CREATE: "PRODUCT_CREATE",
  PRODUCT_READ: "PRODUCT_READ",
  PRODUCT_UPDATE: "PRODUCT_UPDATE",
  PRODUCT_DELETE: "PRODUCT_DELETE",

  // Категория
  CATEGORY_CREATE: "CATEGORY_CREATE",
  CATEGORY_READ: "CATEGORY_READ",
  CATEGORY_UPDATE: "CATEGORY_UPDATE",
  CATEGORY_DELETE: "CATEGORY_DELETE",

  // Филиал
  BRANCH_CREATE: "BRANCH_CREATE",
  BRANCH_READ: "BRANCH_READ",
  BRANCH_UPDATE: "BRANCH_UPDATE",
  BRANCH_DELETE: "BRANCH_DELETE",

  // Заказ
  ORDER_CREATE: "ORDER_CREATE",
  ORDER_READ: "ORDER_READ",
  ORDER_UPDATE: "ORDER_UPDATE",
  ORDER_DELETE: "ORDER_DELETE",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export interface PermissionGroup {
  id: string;
  labelKey: string;
  permissions: Permission[];
}

export const PermissionUIConfig: PermissionGroup[] = [
  {
    id: "staff",
    labelKey: "permissions.groups.staff",
    permissions: [Permission.STAFF_READ, Permission.STAFF_CREATE, Permission.STAFF_UPDATE, Permission.STAFF_DELETE],
  },
  {
    id: "clients",
    labelKey: "permissions.groups.clients",
    permissions: [Permission.CLIENT_READ, Permission.CLIENT_CREATE, Permission.CLIENT_UPDATE, Permission.CLIENT_DELETE],
  },
  {
    id: "roles",
    labelKey: "permissions.groups.roles",
    permissions: [Permission.ROLE_READ, Permission.ROLE_CREATE, Permission.ROLE_UPDATE, Permission.ROLE_DELETE],
  },
  {
    id: "products",
    labelKey: "permissions.groups.products",
    permissions: [
      Permission.PRODUCT_READ,
      Permission.PRODUCT_CREATE,
      Permission.PRODUCT_UPDATE,
      Permission.PRODUCT_DELETE,
    ],
  },
  {
    id: "categories",
    labelKey: "permissions.groups.categories",
    permissions: [
      Permission.CATEGORY_READ,
      Permission.CATEGORY_CREATE,
      Permission.CATEGORY_UPDATE,
      Permission.CATEGORY_DELETE,
    ],
  },
  {
    id: "branches",
    labelKey: "permissions.groups.branches",
    permissions: [Permission.BRANCH_READ, Permission.BRANCH_CREATE, Permission.BRANCH_UPDATE, Permission.BRANCH_DELETE],
  },
  {
    id: "orders",
    labelKey: "permissions.groups.orders",
    permissions: [Permission.ORDER_READ, Permission.ORDER_CREATE, Permission.ORDER_UPDATE, Permission.ORDER_DELETE],
  },
];
