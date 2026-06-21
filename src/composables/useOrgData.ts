import { ref, shallowRef, computed, watch } from 'vue'
import Papa from 'papaparse'
import type { Employee, EmployeeRow, OrgNode } from '../types'
import { parseEmployees, buildOrgTree, findPathToNode } from '../utils/treeBuilder'
import {
  computeDepartmentStats,
  computeSpanDistribution,
  computeLayerStats,
  computeOrgSummary,
} from '../utils/analytics'

export function useOrgData() {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const employees = shallowRef<Employee[]>([])
  const tree = shallowRef<OrgNode | null>(null)
  const nodeById = shallowRef(new Map<string, OrgNode>())
  const parentById = shallowRef(new Map<string, string>())
  const buildTimeMs = ref(0)
  // shallowRef avoids deep-proxying the Set on every toggle
  const expandedIds = shallowRef<Set<string>>(new Set())
  const selectedNodeId = ref<string | null>(null)
  const searchQuery = ref('')
  const activeView = ref<'chart' | 'analytics'>('chart')

  // Debounced search: avoid filtering 40k employees on every keystroke
  const debouncedQuery = ref('')
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  watch(searchQuery, (q) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      debouncedQuery.value = q
    }, 200)
  })

  async function loadData() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data.csv')
      const text = await response.text()

      const parsed = await new Promise<EmployeeRow[]>((resolve, reject) => {
        Papa.parse<EmployeeRow>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: reject,
        })
      })

      const emps = parseEmployees(parsed)
      const result = buildOrgTree(emps)

      employees.value = emps
      tree.value = result.root
      nodeById.value = result.nodeById
      parentById.value = result.parentById
      buildTimeMs.value = result.buildTimeMs
      expandedIds.value = new Set([result.root.id])
      selectedNodeId.value = result.root.id
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load data'
    } finally {
      loading.value = false
    }
  }

  function toggleExpand(id: string) {
    const next = new Set(expandedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedIds.value = next
  }

  function collapseAll() {
    if (!tree.value) return
    expandedIds.value = new Set([tree.value.id])
    selectedNodeId.value = tree.value.id
  }

  function selectNode(id: string) {
    selectedNodeId.value = id
  }

  function navigateTo(id: string) {
    if (!tree.value) return

    const path = findPathToNode(nodeById.value, parentById.value, id)
    const next = new Set(expandedIds.value)
    for (const nodeId of path.slice(0, -1)) {
      next.add(nodeId)
    }
    expandedIds.value = next
    selectedNodeId.value = id
    activeView.value = 'chart'

    requestAnimationFrame(() => {
      document.getElementById(`node-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const selectedNode = computed(() =>
    selectedNodeId.value ? nodeById.value.get(selectedNodeId.value) ?? null : null,
  )

  const breadcrumbs = computed(() => {
    if (!selectedNodeId.value) return []
    const path = findPathToNode(nodeById.value, parentById.value, selectedNodeId.value)
    return path.map((id) => nodeById.value.get(id)!)
  })

  const searchResults = computed(() => {
    const q = debouncedQuery.value.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const results: Employee[] = []
    // Early termination: stop scanning once we have 10 results
    for (const e of employees.value) {
      if (
        e.name.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      ) {
        results.push(e)
        if (results.length >= 10) break
      }
    }
    return results
  })

  // Pass nodeById to computeDepartmentStats for single-pass manager detection
  const departmentStats = computed(() =>
    tree.value ? computeDepartmentStats(employees.value, nodeById.value) : [],
  )

  const spanDistribution = computed(() =>
    tree.value ? computeSpanDistribution(tree.value) : [],
  )

  const layerStats = computed(() => computeLayerStats(employees.value))

  const orgSummary = computed(() =>
    tree.value ? computeOrgSummary(tree.value, employees.value.length) : null,
  )

  return {
    loading,
    error,
    tree,
    employees,
    expandedIds,
    selectedNodeId,
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
  }
}
