<script setup lang="ts">
import type { BranchResponce } from "@delivest/types";

interface Props {
  branch?: BranchResponce;
  loading?: boolean;
  active?: boolean;
}

defineProps<Props>();
defineEmits<{
  (e: "select", id: string): void;
}>();
</script>

<template>
  <div
    v-if="loading"
    class="h-20 bg-(--surface-card) border border-(--surface-border) rounded-xl p-4 flex items-center gap-4 animate-pulse">
    <div class="w-10 h-10 rounded-lg bg-(--surface-200) shrink-0"></div>
    <div class="flex-1">
      <div class="h-4 bg-(--surface-200) rounded w-1/3 mb-2"></div>
      <div class="h-3 bg-(--surface-100) rounded w-1/4"></div>
    </div>
  </div>

  <div
    v-else-if="branch"
    @click="$emit('select', branch.id)"
    class="group relative border-2 p-4 rounded-xl flex items-center gap-4 transition-all duration-200 hover:shadow-md cursor-pointer"
    :style="{ border: active ? '3px solid' : '1px solid' }">
    <div
      class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
      <i class="pi pi-building text-xl"></i>
    </div>

    <div class="flex flex-col flex-1 min-w-0">
      <div class="flex items-center gap-2 leading-none">
        <h3 class="font-bold text-(--surface-900) truncate leading-tight">
          {{ branch.name }}
        </h3>
        <span
          class="inline-flex items-center justify-center text-[10px] px-1.5 h-4 rounded bg-(--surface-100) text-(--surface-500) font-mono uppercase shrink-0">
          {{ branch.alias }}
        </span>
      </div>
      <p v-if="branch.address" class="text-xs text-(--surface-500) truncate mt-1">
        {{ branch.address }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex items-center gap-2 ml-auto" @click.stop>
      <slot name="actions" :branch="branch" />
    </div>
  </div>
</template>
