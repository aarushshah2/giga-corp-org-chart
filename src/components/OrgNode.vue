<script setup lang="ts">
import { computed } from 'vue'
import OrgNodeComponent from './OrgNode.vue'
import type { OrgNode as OrgNodeType } from '../types'
import { formatCurrency, formatNumber } from '../utils/format'

const props = defineProps<{
  node: OrgNodeType
  expandedIds: Set<string>
  selectedNodeId: string | null
  depth: number
}>()

const emit = defineEmits<{
  toggle: [id: string]
  select: [id: string]
}>()

/** Cap render depth to avoid rendering thousands of recursive components. */
const MAX_RENDER_DEPTH = 6

const isExpanded = computed(() => props.expandedIds.has(props.node.id))
const isSelected = computed(() => props.selectedNodeId === props.node.id)
const hasChildren = computed(() => props.node.children.length > 0)
const canRenderChildren = computed(() => props.depth < MAX_RENDER_DEPTH)

const initials = computed(() =>
  props.node.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

/** Generate a consistent HSL hue from department name for avatar color. */
const avatarHue = computed(() => {
  const dept = props.node.department || 'default'
  let hash = 0
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
})

const isActive = computed(() => props.node.status?.toLowerCase() === 'active')
</script>

<template>
  <div :id="`node-${node.id}`" class="flex flex-col items-center">
    <button
      class="group relative w-[280px] rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      :class="
        isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-200/80 shadow-md'
          : hasChildren
            ? 'border-slate-200/80'
            : 'border-slate-200/60'
      "
      @click="emit('select', node.id)"
    >
      <!-- Top accent bar -->
      <div
        class="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
        :style="hasChildren
          ? { background: `linear-gradient(to right, hsl(${avatarHue}, 65%, 55%), hsl(${(avatarHue + 30) % 360}, 60%, 50%))` }
          : undefined"
        :class="{ 'bg-slate-200': !hasChildren }"
      />

      <div class="flex items-start gap-3 p-4 pt-5">
        <!-- Department-colored avatar with status dot -->
        <div class="relative">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
            :style="{
              background: hasChildren
                ? `linear-gradient(135deg, hsl(${avatarHue}, 60%, 50%), hsl(${(avatarHue + 30) % 360}, 55%, 45%))`
                : `linear-gradient(135deg, hsl(${avatarHue}, 25%, 58%), hsl(${avatarHue}, 20%, 48%))`,
            }"
          >
            {{ initials }}
          </div>
          <!-- Status dot -->
          <div
            class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
            :class="isActive ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-300'"
            :title="isActive ? 'Active' : node.status"
          />
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="truncate text-sm font-semibold text-slate-900">{{ node.name }}</h3>
          <p class="truncate text-xs text-slate-500">{{ node.jobTitle }}</p>
          <p class="mt-1 truncate text-[11px] text-slate-400">{{ node.department }}</p>
        </div>

        <button
          v-if="hasChildren"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          :title="isExpanded ? 'Collapse team' : `Expand team (${node.span} reports)`"
          @click.stop="emit('toggle', node.id)"
        >
          <svg
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-px border-t border-slate-100 bg-slate-100">
        <div class="bg-white px-3 py-2.5 text-center">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Team</p>
          <p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">{{ formatNumber(node.descendantCount) }}</p>
        </div>
        <div class="bg-white px-3 py-2.5 text-center">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Managers</p>
          <p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">{{ formatNumber(node.nonLeafDescendantCount) }}</p>
        </div>
        <div class="bg-white px-3 py-2.5 text-center">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Cost</p>
          <p class="mt-0.5 text-sm font-semibold tabular-nums text-indigo-600">{{ formatCurrency(node.totalCost) }}</p>
        </div>
      </div>
    </button>

    <!-- Children tree -->
    <template v-if="hasChildren && isExpanded">
      <div class="relative mt-8 flex flex-col items-center animate-slide-down">
        <!-- Vertical connector -->
        <div
          class="h-8 w-px"
          :style="{ background: `linear-gradient(to bottom, hsl(${avatarHue}, 50%, 65%), hsl(0, 0%, 78%))` }"
        />

        <!-- Depth limit warning -->
        <div
          v-if="!canRenderChildren"
          class="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 shadow-sm"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ node.span }} reports · Click a node and use search to navigate deeper</span>
        </div>

        <!-- Children grid -->
        <div v-else class="relative flex flex-wrap justify-center gap-8 pt-0">
          <div
            v-for="(child, index) in node.children"
            :key="child.id"
            class="relative flex flex-col items-center animate-fade-in"
            :style="{ animationDelay: `${Math.min(index * 30, 300)}ms` }"
          >
            <!-- Horizontal connector line -->
            <div
              v-if="node.children.length > 1"
              class="absolute -top-px h-px bg-slate-300"
              :style="{
                left: index === 0 ? '50%' : '0',
                right: index === node.children.length - 1 ? '50%' : '0',
                width: index === 0 || index === node.children.length - 1 ? '50%' : '100%',
              }"
            />
            <!-- Vertical connector from horizontal line to child -->
            <div class="h-8 w-px bg-slate-300" />
            <OrgNodeComponent
              :node="child"
              :expanded-ids="expandedIds"
              :selected-node-id="selectedNodeId"
              :depth="depth + 1"
              @toggle="emit('toggle', $event)"
              @select="emit('select', $event)"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
