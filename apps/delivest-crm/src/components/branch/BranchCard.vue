<script setup lang="ts">
interface Props {
  branch?: {
    id: string;
    name: string;
    alias: string;
    address?: string;
  };
  loading?: boolean;
}

defineProps<Props>();
defineEmits(["select"]);
</script>

<template>
  <div
    v-if="loading"
    class="h-27.5 bg-(--surface-card) border border-(--surface-border) rounded-xl p-6 flex items-center gap-5 animate-pulse">
    <div class="w-14 h-14 rounded-xl bg-(--surface-200) shrink-0"></div>
    <div class="flex-1">
      <div class="h-5 bg-(--surface-200) rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-(--surface-100) rounded w-1/2"></div>
    </div>
  </div>

  <div
    v-else-if="branch"
    @click="$emit('select', branch.id)"
    class="group relative bg-(--surface-card) border border-(--surface-border) p-6 rounded-xl cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-lg active:scale-95 flex items-center min-h-27.5">
    <span class="absolute top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-(--surface-400)">
      {{ branch.alias }}
    </span>

    <div class="flex items-center gap-5 w-full pr-10">
      <div
        class="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
        <i class="pi pi-building text-2xl"></i>
      </div>

      <div class="flex flex-col justify-center">
        <h3 class="text-lg font-bold text-(--surface-900) group-hover:text-primary transition-colors leading-tight">
          {{ branch.name }}
        </h3>
        <p v-if="branch.address" class="text-sm text-(--surface-500) mt-1 line-clamp-1">
          {{ branch.address }}
        </p>
      </div>
    </div>

    <div
      class="absolute bottom-3 right-4 flex items-center text-[11px] font-bold uppercase tracking-widest text-primary opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <i class="pi pi-arrow-right"></i>
    </div>
  </div>
</template>
