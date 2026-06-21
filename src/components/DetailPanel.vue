<script setup lang="ts">
import type { OrgNode } from '../types'
import { formatCurrency, formatNumber, formatRatio } from '../utils/format'

defineProps<{
  node: OrgNode
}>()
</script>

<template>
  <aside class="flex h-full w-80 shrink-0 flex-col border-l border-slate-200/80 bg-white">
    <div class="border-b border-slate-100 px-5 py-4">
      <p class="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Selected node</p>
      <h2 class="mt-1 text-lg font-semibold text-slate-900">{{ node.name }}</h2>
      <p class="text-sm text-slate-500">{{ node.jobTitle }}</p>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-4">
      <div class="mb-5 flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm"
          :class="node.span > 0 ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'"
        >
          {{ node.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-800">{{ node.department }}</p>
          <p class="truncate text-xs text-slate-400">{{ node.location }}</p>
        </div>
      </div>

      <div class="mb-5 grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-slate-50 px-3 py-2.5">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Salary</p>
          <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ formatCurrency(node.salary) }}</p>
        </div>
        <div class="rounded-xl bg-slate-50 px-3 py-2.5">
          <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Span</p>
          <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ node.span }} reports</p>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Hierarchy</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
            <span class="text-sm text-slate-600">Descendants</span>
            <span class="text-sm font-semibold tabular-nums text-slate-900">{{ formatNumber(node.descendantCount) }}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
            <span class="text-sm text-slate-600">Non-leaf descendants</span>
            <span class="text-sm font-semibold tabular-nums text-slate-900">{{ formatNumber(node.nonLeafDescendantCount) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Cost rollup</h3>
        <div class="overflow-hidden rounded-2xl border border-slate-100">
          <div class="flex items-center justify-between border-b border-slate-100 bg-indigo-50/50 px-4 py-3">
            <span class="text-sm text-indigo-700">Management cost</span>
            <span class="text-sm font-semibold tabular-nums text-indigo-700">{{ formatCurrency(node.managementCost) }}</span>
          </div>
          <div class="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-4 py-3">
            <span class="text-sm text-emerald-700">IC cost</span>
            <span class="text-sm font-semibold tabular-nums text-emerald-700">{{ formatCurrency(node.icCost) }}</span>
          </div>
          <div class="flex items-center justify-between bg-slate-50 px-4 py-3">
            <span class="text-sm font-medium text-slate-700">Total cost</span>
            <span class="text-sm font-bold tabular-nums text-slate-900">{{ formatCurrency(node.totalCost) }}</span>
          </div>
        </div>

        <div class="rounded-xl bg-violet-50 px-4 py-3">
          <p class="text-[10px] font-medium uppercase tracking-wide text-violet-500">IC / Mgmt ratio</p>
          <p class="mt-0.5 text-xl font-bold tabular-nums text-violet-700">{{ formatRatio(node.managementCostRatio) }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>
