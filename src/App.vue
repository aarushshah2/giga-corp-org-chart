<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrgData } from './composables/useOrgData'
import OrgChart from './components/OrgChart.vue'
import AnalyticsDashboard from './components/AnalyticsDashboard.vue'
import DetailPanel from './components/DetailPanel.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
import { formatCurrency, formatNumber } from './utils/format'

const {
  loading,
  error,
  tree,
  expandedIds,
  selectedNode,
  breadcrumbs,
  searchQuery,
  searchResults,
  activeView,
  buildTimeMs,
  departmentStats,
  spanDistribution,
  layerStats,
  orgSummary,
  loadData,
  toggleExpand,
  collapseAll,
  selectNode,
  navigateTo,
} = useOrgData()

const mobileSearchOpen = ref(false)
const showMobileDetail = ref(false)

function handleSelectNode(id: string) {
  selectNode(id)
  showMobileDetail.value = true
}

function handleNavigate(id: string) {
  navigateTo(id)
  searchQuery.value = ''
  mobileSearchOpen.value = false
}

onMounted(loadData)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a] text-white shadow-lg">
      <div class="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold shadow-md">
            GC
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-tight">Giga Corp</h1>
            <p class="text-[11px] text-slate-400">Workforce hierarchy & cost intelligence</p>
          </div>
        </div>

        <div class="flex flex-1 items-center justify-end gap-3">
          <!-- Mobile search trigger -->
          <button
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:text-white md:hidden"
            @click="mobileSearchOpen = !mobileSearchOpen"
          >
            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Desktop search -->
          <div class="relative hidden md:block">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search 40,000 employees…"
              class="w-72 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <!-- Search results dropdown -->
            <div
              v-if="searchResults.length > 0 && searchQuery.length >= 2"
              class="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-fade-up"
            >
              <button
                v-for="result in searchResults"
                :key="result.id"
                class="flex w-full flex-col border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 transition-colors"
                @click="handleNavigate(result.id)"
              >
                <span class="text-sm font-medium text-slate-900">{{ result.name }}</span>
                <span class="text-xs text-slate-500">{{ result.jobTitle }}</span>
                <span class="text-[11px] text-slate-400">{{ result.department }}</span>
              </button>
            </div>
            <!-- Empty search state -->
            <div
              v-else-if="searchQuery.length >= 2 && searchResults.length === 0"
              class="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl animate-fade-up"
            >
              <svg class="mx-auto h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="mt-2 text-sm font-medium text-slate-600">No results found</p>
              <p class="mt-0.5 text-xs text-slate-400">Try a different name, title, or department</p>
            </div>
          </div>

          <!-- View toggle -->
          <div class="flex rounded-xl bg-white/5 p-1">
            <button
              class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-all"
              :class="activeView === 'chart' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'"
              @click="activeView = 'chart'"
            >
              Org Chart
            </button>
            <button
              class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-all"
              :class="activeView === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'"
              @click="activeView = 'analytics'"
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile search drawer -->
      <div
        v-if="mobileSearchOpen"
        class="border-t border-white/5 bg-[#0f172a] px-5 py-3 md:hidden animate-slide-down"
      >
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search employees…"
            class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
            autofocus
          />
        </div>
        <!-- Mobile search results -->
        <div v-if="searchResults.length > 0 && searchQuery.length >= 2" class="mt-2 space-y-1">
          <button
            v-for="result in searchResults"
            :key="result.id"
            class="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-white/5 transition-colors"
            @click="handleNavigate(result.id)"
          >
            <span class="text-sm font-medium text-white">{{ result.name }}</span>
            <span class="text-xs text-slate-400">{{ result.jobTitle }} · {{ result.department }}</span>
          </button>
        </div>
        <div
          v-else-if="searchQuery.length >= 2 && searchResults.length === 0"
          class="mt-3 text-center text-sm text-slate-400"
        >
          No results for "{{ searchQuery }}"
        </div>
      </div>

      <!-- Stats bar -->
      <div
        v-if="orgSummary && !loading"
        class="border-t border-white/5 bg-white/[0.02] px-5 py-2"
      >
        <div class="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400">
          <span><strong class="text-white">{{ formatNumber(orgSummary.totalEmployees) }}</strong> employees</span>
          <span><strong class="text-white">{{ formatCurrency(orgSummary.totalCost) }}</strong> total cost</span>
          <span>Built in <strong class="text-emerald-400">{{ buildTimeMs.toFixed(0) }}ms</strong> · O(n) single pass</span>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
      <!-- Loading state with skeleton -->
      <div v-if="loading" class="flex flex-1 flex-col items-center justify-center py-32">
        <div class="relative">
          <div class="h-14 w-14 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
        </div>
        <p class="mt-6 text-sm font-medium text-slate-700">Processing organizational data…</p>
        <p class="mt-1 text-xs text-slate-400">Parsing 40,000 records and computing rollups</p>
        <!-- Skeleton preview -->
        <div class="mt-8 flex gap-4">
          <div class="skeleton h-32 w-64" />
          <div class="skeleton h-32 w-64" />
          <div class="skeleton h-32 w-64" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center py-32">
        <div class="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-center">
          <svg class="mx-auto h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="mt-3 text-sm font-medium text-red-800">{{ error }}</p>
          <button
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            @click="loadData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Main views -->
      <template v-else-if="tree">
        <!-- Org Chart view -->
        <div v-if="activeView === 'chart'" class="flex min-h-0 flex-1">
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex items-center justify-between border-b border-slate-200/60 bg-white/50 px-5 py-2 backdrop-blur-sm">
              <Breadcrumbs :items="breadcrumbs" @navigate="handleNavigate" />
              <button
                class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
                @click="collapseAll"
              >
                Reset to CEO
              </button>
            </div>

            <div class="flex-1 overflow-auto p-5 custom-scrollbar">
              <OrgChart
                :tree="tree"
                :expanded-ids="expandedIds"
                :selected-node-id="selectedNode?.id ?? null"
                @toggle="toggleExpand"
                @select="handleSelectNode"
              />
            </div>
          </div>

          <!-- Desktop detail panel -->
          <DetailPanel v-if="selectedNode" class="hidden lg:flex" :node="selectedNode" />
        </div>

        <!-- Analytics view -->
        <AnalyticsDashboard
          v-else
          :department-stats="departmentStats"
          :span-distribution="spanDistribution"
          :layer-stats="layerStats"
          :summary="orgSummary"
        />
      </template>
    </main>

    <!-- Mobile detail sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="selectedNode && showMobileDetail && activeView === 'chart'"
          class="fixed inset-x-0 bottom-0 z-50 lg:hidden"
        >
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black/30 backdrop-blur-sm"
            @click="showMobileDetail = false"
          />
          <!-- Sheet -->
          <div class="relative max-h-[70vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl custom-scrollbar">
            <!-- Handle -->
            <div class="sticky top-0 z-10 flex justify-center bg-white pb-2 pt-3">
              <div class="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <DetailPanel :node="selectedNode" class="!border-0 !w-full" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
