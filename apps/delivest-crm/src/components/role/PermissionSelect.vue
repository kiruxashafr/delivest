<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Checkbox from "primevue/checkbox";
import { PermissionUIConfig, type Permission } from "@delivest/common";

const props = defineProps<{
  modelValue: Permission[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Permission[]): void;
}>();

const { t } = useI18n();

const expandedGroups = ref<string[]>([]);

const toggleExpand = (groupId: string) => {
  const index = expandedGroups.value.indexOf(groupId);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(groupId);
  }
};

const groupsWithState = computed(() => {
  return PermissionUIConfig.map(group => {
    const groupPerms = group.permissions;
    const selectedInGroup = props.modelValue.filter(p => groupPerms.includes(p));

    return {
      ...group,
      label: t(group.labelKey),
      isAllSelected: groupPerms.length > 0 && selectedInGroup.length === groupPerms.length,
      isIndeterminate: selectedInGroup.length > 0 && selectedInGroup.length < groupPerms.length,
      selectedCount: selectedInGroup.length,
      isExpanded: expandedGroups.value.includes(group.id),
      items: group.permissions.map(perm => ({
        label: t(`permissions.items.${perm}`),
        value: perm,
      })),
    };
  });
});

const toggleGroup = (group: any) => {
  let newList = [...props.modelValue];
  const groupPerms = group.permissions as Permission[];
  const allSelected = groupPerms.every(p => newList.includes(p));

  if (allSelected) {
    newList = newList.filter(p => !groupPerms.includes(p));
  } else {
    groupPerms.forEach(p => {
      if (!newList.includes(p)) newList.push(p);
    });
  }
  emit("update:modelValue", newList);
};

const togglePermission = (perm: Permission) => {
  let newList = [...props.modelValue];
  const index = newList.indexOf(perm);
  if (index > -1) {
    newList.splice(index, 1);
  } else {
    newList.push(perm);
  }
  emit("update:modelValue", newList);
};
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div
      v-for="group in groupsWithState"
      :key="group.id"
      class="border border-(--surface-200) rounded-xl overflow-hidden transition-all bg-(--surface-0)"
      :class="{ 'ring-1 ring-primary-500 shadow-sm': group.isExpanded }">
      <div
        class="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-(--surface-50)"
        @click="toggleExpand(group.id)">
        <div class="flex items-center gap-3">
          <div @click.stop>
            <Checkbox
              :modelValue="group.isAllSelected"
              :binary="true"
              :indeterminate="group.isIndeterminate"
              @change="toggleGroup(group)" />
          </div>

          <div class="flex flex-col">
            <span class="font-bold text-sm text-(--surface-800)">{{ group.label }}</span>
            <span v-if="group.selectedCount > 0" class="text-xs text-primary font-medium">
              {{ t("roles.list.selected") }}: {{ group.selectedCount }} {{ t("roles.list.out-of") }}
              {{ group.items.length }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3 text-(--surface-400)">
          <i
            class="pi transition-transform duration-200"
            :class="[group.isExpanded ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
        </div>
      </div>

      <div
        v-if="group.isExpanded"
        class="bg-(--surface-50) border-t border-(--surface-100) p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="perm in group.items"
          :key="perm.value"
          class="flex items-center gap-3 p-2 rounded-md bg-white border border-(--surface-200) hover:border-primary transition-colors cursor-pointer"
          @click="togglePermission(perm.value)">
          <Checkbox :modelValue="modelValue" :value="perm.value" @click.stop />
          <span class="text-sm">{{ perm.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
