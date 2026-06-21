<script setup lang="ts">
import type { OrgNode } from '../types'

defineProps<{
  items: OrgNode[]
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()
</script>

<template>
  <nav class="flex flex-wrap items-center gap-1 px-1 py-2 text-sm">
    <template v-for="(item, index) in items" :key="item.id">
      <button
        class="rounded-lg px-2.5 py-1 font-medium transition-colors"
        :class="
          index === items.length - 1
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        "
        @click="emit('navigate', item.id)"
      >
        {{ item.name.split(' ')[0] }}
      </button>
      <svg
        v-if="index < items.length - 1"
        class="h-3.5 w-3.5 shrink-0 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </template>
  </nav>
</template>
