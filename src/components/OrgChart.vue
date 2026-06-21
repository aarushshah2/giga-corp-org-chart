<script setup lang="ts">
import type { OrgNode } from '../types'
import OrgNodeComponent from './OrgNode.vue'

defineProps<{
  tree: OrgNode
  expandedIds: Set<string>
  selectedNodeId: string | null
}>()

const emit = defineEmits<{
  toggle: [id: string]
  select: [id: string]
}>()
</script>

<template>
  <div class="chart-canvas overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/60 pb-10 backdrop-blur-sm">
    <div class="inline-flex min-w-full justify-center px-10 py-8">
      <OrgNodeComponent
        :node="tree"
        :expanded-ids="expandedIds"
        :selected-node-id="selectedNodeId"
        :depth="0"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
