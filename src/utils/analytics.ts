import type { Employee, OrgNode, DepartmentStats, SpanBucket, LayerStats } from '../types'

/**
 * Single-pass department stats using the nodeById map to determine
 * manager/IC status instead of building a separate managerIds set.
 */
export function computeDepartmentStats(
  employees: Employee[],
  nodeById: Map<string, OrgNode>,
): DepartmentStats[] {
  const map = new Map<string, DepartmentStats>()

  for (const emp of employees) {
    const dept = emp.department || 'Unknown'
    let stats = map.get(dept)
    if (!stats) {
      stats = { department: dept, headcount: 0, managementCost: 0, icCost: 0, totalCost: 0 }
      map.set(dept, stats)
    }

    stats.headcount += 1
    stats.totalCost += emp.salary

    // Use the pre-built OrgNode to check if this person is a manager
    const orgNode = nodeById.get(emp.id)
    if (orgNode && orgNode.children.length > 0) {
      stats.managementCost += emp.salary
    } else {
      stats.icCost += emp.salary
    }
  }

  return [...map.values()].sort((a, b) => b.totalCost - a.totalCost)
}

export function computeSpanDistribution(root: OrgNode): SpanBucket[] {
  const buckets = new Map<string, number>([
    ['0 (IC)', 0],
    ['1–2', 0],
    ['3–5', 0],
    ['6–9', 0],
    ['10–15', 0],
    ['16+', 0],
  ])

  // Iterative walk using a stack to avoid deep recursion on 40k nodes
  const stack: OrgNode[] = [root]
  while (stack.length > 0) {
    const node = stack.pop()!
    const span = node.span

    if (span === 0) buckets.set('0 (IC)', (buckets.get('0 (IC)') ?? 0) + 1)
    else if (span <= 2) buckets.set('1–2', (buckets.get('1–2') ?? 0) + 1)
    else if (span <= 5) buckets.set('3–5', (buckets.get('3–5') ?? 0) + 1)
    else if (span <= 9) buckets.set('6–9', (buckets.get('6–9') ?? 0) + 1)
    else if (span <= 15) buckets.set('10–15', (buckets.get('10–15') ?? 0) + 1)
    else buckets.set('16+', (buckets.get('16+') ?? 0) + 1)

    for (const child of node.children) stack.push(child)
  }

  return [...buckets.entries()].map(([label, count]) => ({ label, count }))
}

export function computeLayerStats(employees: Employee[]): LayerStats[] {
  const map = new Map<number, LayerStats>()

  for (const emp of employees) {
    const existing = map.get(emp.level) ?? { level: emp.level, headcount: 0, totalCost: 0 }
    existing.headcount += 1
    existing.totalCost += emp.salary
    map.set(emp.level, existing)
  }

  return [...map.values()].sort((a, b) => a.level - b.level)
}

export function computeOrgSummary(root: OrgNode, employeeCount: number) {
  return {
    totalEmployees: employeeCount,
    totalCost: root.totalCost + root.salary,
    managementCost: root.managementCost,
    icCost: root.icCost,
    avgSpan:
      root.descendantCount > 0
        ? root.descendantCount / (root.nonLeafDescendantCount || 1)
        : 0,
    maxDepth: getMaxDepth(root),
  }
}

/** Iterative max depth to avoid Math.max(...spread) stack overflow on wide nodes. */
function getMaxDepth(root: OrgNode): number {
  let max = 0
  const stack: Array<{ node: OrgNode; depth: number }> = [{ node: root, depth: 1 }]

  while (stack.length > 0) {
    const { node, depth } = stack.pop()!
    if (depth > max) max = depth
    for (const child of node.children) {
      stack.push({ node: child, depth: depth + 1 })
    }
  }

  return max
}
