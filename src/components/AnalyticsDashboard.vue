<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DepartmentStats, SpanBucket, LayerStats } from '../types'
import { formatCurrency, formatNumber } from '../utils/format'

const props = defineProps<{
  departmentStats: DepartmentStats[]
  spanDistribution: SpanBucket[]
  layerStats: LayerStats[]
  summary: {
    totalEmployees: number
    totalCost: number
    managementCost: number
    icCost: number
    avgSpan: number
    maxDepth: number
  } | null
}>()

const topDepartments = computed(() => props.departmentStats.slice(0, 8))
const maxDeptCost = computed(() => Math.max(...topDepartments.value.map((d) => d.totalCost), 1))
const maxSpanCount = computed(() => Math.max(...props.spanDistribution.map((s) => s.count), 1))
const maxLayerHeadcount = computed(() => Math.max(...props.layerStats.map((l) => l.headcount), 1))

const icShare = computed(() => {
  if (!props.summary) return 0
  const total = props.summary.managementCost + props.summary.icCost
  return total > 0 ? (props.summary.icCost / total) * 100 : 0
})

const mgmtShare = computed(() => 100 - icShare.value)

// Animated counters
const animatedHeadcount = ref(0)
const animatedCost = ref(0)
const animatedMgmtCost = ref(0)
const animatedIcCost = ref(0)

function animateValue(
  target: { value: number },
  end: number,
  duration = 800,
) {
  const start = target.value
  const diff = end - start
  const startTime = performance.now()

  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    target.value = Math.round(start + diff * eased)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

watch(
  () => props.summary,
  (s) => {
    if (!s) return
    animateValue(animatedHeadcount, s.totalEmployees)
    animateValue(animatedCost, s.totalCost)
    animateValue(animatedMgmtCost, s.managementCost)
    animateValue(animatedIcCost, s.icCost)
  },
  { immediate: true },
)

// Tooltip state
const hoveredDept = ref<string | null>(null)
const hoveredBucket = ref<string | null>(null)
</script>

<template>
  <div v-if="summary" class="space-y-6 p-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-stagger">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Headcount</p>
          <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">Live</span>
        </div>
        <p class="mt-2 text-3xl font-bold tabular-nums text-slate-900 animate-count-up">{{ formatNumber(animatedHeadcount) }}</p>
        <p class="mt-1 text-xs text-slate-500">Across {{ summary.maxDepth }} layers · Avg span {{ summary.avgSpan.toFixed(1) }}</p>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Workforce cost</p>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">Annual</span>
        </div>
        <p class="mt-2 text-3xl font-bold tabular-nums text-slate-900 animate-count-up">{{ formatCurrency(animatedCost) }}</p>
        <p class="mt-1 text-xs text-slate-500">Total salary rollup from CEO</p>
      </div>

      <div class="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-400">Management cost</p>
        <p class="mt-2 text-2xl font-bold tabular-nums text-indigo-700 animate-count-up">{{ formatCurrency(animatedMgmtCost) }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-indigo-100">
            <div class="bar-fill h-full rounded-full bg-indigo-500" :style="{ width: `${mgmtShare}%` }" />
          </div>
          <span class="text-[11px] font-semibold tabular-nums text-indigo-500">{{ mgmtShare.toFixed(1) }}%</span>
        </div>
      </div>

      <div class="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-emerald-500">IC cost</p>
        <p class="mt-2 text-2xl font-bold tabular-nums text-emerald-700 animate-count-up">{{ formatCurrency(animatedIcCost) }}</p>
        <div class="mt-3 flex items-center gap-2">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-emerald-100">
            <div class="bar-fill h-full rounded-full bg-emerald-500" :style="{ width: `${icShare}%` }" />
          </div>
          <span class="text-[11px] font-semibold tabular-nums text-emerald-500">{{ icShare.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <!-- Department Cost Chart -->
      <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Cost by department</h2>
            <p class="text-sm text-slate-500">Stacked management vs IC spend</p>
          </div>
          <!-- Legend -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              <span class="text-[11px] text-slate-500">Mgmt</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              <span class="text-[11px] text-slate-500">IC</span>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div
            v-for="dept in topDepartments"
            :key="dept.department"
            class="group"
            @mouseenter="hoveredDept = dept.department"
            @mouseleave="hoveredDept = null"
          >
            <div class="mb-1.5 flex items-center justify-between gap-3">
              <span class="truncate text-sm font-medium text-slate-700">{{ dept.department }}</span>
              <span class="shrink-0 text-xs tabular-nums text-slate-500">{{ formatNumber(dept.headcount) }} people</span>
            </div>
            <div class="relative flex h-8 overflow-hidden rounded-lg bg-slate-100">
              <div
                class="bar-fill bg-indigo-500 transition-all"
                :style="{ width: `${(dept.managementCost / maxDeptCost) * 100}%` }"
              />
              <div
                class="bar-fill bg-emerald-400 transition-all"
                :style="{ width: `${(dept.icCost / maxDeptCost) * 100}%` }"
              />
              <!-- Hover tooltip -->
              <div
                v-if="hoveredDept === dept.department"
                class="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-lg bg-slate-900/80 text-[11px] font-medium text-white backdrop-blur-sm animate-fade-in"
              >
                <span>Mgmt: {{ formatCurrency(dept.managementCost) }}</span>
                <span class="text-slate-400">·</span>
                <span>IC: {{ formatCurrency(dept.icCost) }}</span>
                <span class="text-slate-400">·</span>
                <span>Total: {{ formatCurrency(dept.totalCost) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Span of Control -->
      <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div class="mb-5">
          <h2 class="text-base font-semibold text-slate-900">Span of control</h2>
          <p class="text-sm text-slate-500">Direct reports per person</p>
        </div>
        <div class="space-y-3">
          <div
            v-for="bucket in spanDistribution"
            :key="bucket.label"
            class="group flex items-center gap-4"
            @mouseenter="hoveredBucket = bucket.label"
            @mouseleave="hoveredBucket = null"
          >
            <span class="w-14 shrink-0 text-sm font-medium text-slate-600">{{ bucket.label }}</span>
            <div class="relative flex-1">
              <div class="h-8 overflow-hidden rounded-lg bg-slate-100">
                <div
                  class="bar-fill flex h-full items-center rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 pl-2 text-xs font-medium text-white"
                  :style="{ width: `${Math.max((bucket.count / maxSpanCount) * 100, bucket.count > 0 ? 8 : 0)}%` }"
                >
                  <span v-if="bucket.count / maxSpanCount > 0.15">{{ formatNumber(bucket.count) }}</span>
                </div>
              </div>
              <!-- Hover tooltip -->
              <div
                v-if="hoveredBucket === bucket.label && bucket.count > 0"
                class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in"
              >
                {{ formatNumber(bucket.count) }} people ({{ ((bucket.count / (summary?.totalEmployees ?? 1)) * 100).toFixed(1) }}%)
                <div class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
              </div>
            </div>
            <span class="w-14 shrink-0 text-right text-sm tabular-nums text-slate-500">{{ formatNumber(bucket.count) }}</span>
          </div>
        </div>
      </section>

      <!-- Organization Pyramid -->
      <section class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md xl:col-span-2">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Organization pyramid</h2>
            <p class="text-sm text-slate-500">Headcount and cost distribution by layer</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <div class="h-2.5 w-8 rounded-sm bg-gradient-to-r from-indigo-600 to-violet-500" />
              <span class="text-[11px] text-slate-500">Headcount</span>
            </div>
          </div>
        </div>
        <div class="mx-auto flex max-w-3xl flex-col items-center gap-2">
          <div
            v-for="(layer, idx) in layerStats"
            :key="layer.level"
            class="group flex w-full items-center gap-4"
            :style="{ animationDelay: `${idx * 50}ms` }"
          >
            <span class="w-10 shrink-0 text-right text-xs font-medium text-slate-400">L{{ layer.level }}</span>
            <div class="relative flex-1">
              <div
                class="bar-fill flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-xs font-semibold text-white shadow-sm"
                :style="{ width: `${Math.max((layer.headcount / maxLayerHeadcount) * 100, 12)}%` }"
              >
                {{ formatNumber(layer.headcount) }}
              </div>
            </div>
            <div class="w-28 shrink-0 text-right">
              <p class="text-xs font-semibold tabular-nums text-slate-700">{{ formatCurrency(layer.totalCost) }}</p>
              <p class="text-[10px] tabular-nums text-slate-400">
                {{ ((layer.headcount / (summary?.totalEmployees ?? 1)) * 100).toFixed(1) }}% of org
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
