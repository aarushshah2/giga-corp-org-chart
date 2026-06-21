import { stratify, type HierarchyNode } from 'd3-hierarchy'
import type { Employee, EmployeeRow, OrgNode } from '../types'

export interface OrgTreeResult {
  root: OrgNode
  nodeById: Map<string, OrgNode>
  parentById: Map<string, string>
  buildTimeMs: number
}

export function parseEmployees(rows: EmployeeRow[]): Employee[] {
  return rows.map((row) => ({
    id: row['Employee Id'],
    name: row.Name,
    jobTitle: row['Job Title'],
    email: row.Email,
    managerId: row.Manager?.trim() ?? '',
    status: row.Status,
    department: row.Department,
    location: row.Location,
    salary: Number(row.Salary) || 0,
    level: Number(row.level) || 0,
  }))
}

/**
 * Build the org tree in a single O(n) post-order pass.
 *
 * d3's `eachAfter()` guarantees children are visited before parents,
 * so we can compute metrics AND build the final OrgNode in one traversal
 * instead of two separate walks.
 */
export function buildOrgTree(employees: Employee[]): OrgTreeResult {
  const start = performance.now()

  // d3 stratify: build the raw hierarchy from flat employee list
  const root = stratify<Employee>()
    .id((d: Employee) => d.id)
    .parentId((d: Employee) => (d.managerId ? d.managerId : null))(employees)

  const nodeById = new Map<string, OrgNode>()
  const parentById = new Map<string, string>()

  // Single post-order pass: compute metrics + build OrgNode simultaneously
  root.eachAfter((node: HierarchyNode<Employee>) => {
    const childNodes = (node.children ?? []).map((c) => nodeById.get(c.data.id)!)

    // Aggregate metrics from already-computed children (post-order guarantees this)
    let descendantCount = 0
    let nonLeafDescendantCount = 0
    let managementCost = 0
    let icCost = 0
    let totalCost = 0

    for (const child of childNodes) {
      const isManager = child.children.length > 0

      descendantCount += child.descendantCount + 1
      nonLeafDescendantCount += (isManager ? 1 : 0) + child.nonLeafDescendantCount
      managementCost += (isManager ? child.salary : 0) + child.managementCost
      icCost += (isManager ? 0 : child.salary) + child.icCost
      totalCost += child.salary + child.totalCost
    }

    const managementCostRatio =
      managementCost > 0 ? icCost / managementCost : icCost > 0 ? Infinity : 0

    const orgNode: OrgNode = {
      ...node.data,
      descendantCount,
      nonLeafDescendantCount,
      managementCost,
      icCost,
      totalCost,
      managementCostRatio,
      span: childNodes.length,
      children: childNodes,
    }

    nodeById.set(orgNode.id, orgNode)

    // Track parent relationship
    if (node.parent) {
      parentById.set(orgNode.id, node.parent.data.id)
    }
  })

  return {
    root: nodeById.get(root.data.id)!,
    nodeById,
    parentById,
    buildTimeMs: performance.now() - start,
  }
}

/** O(1) lookup via pre-built index. */
export function findNode(nodeById: Map<string, OrgNode>, id: string): OrgNode | null {
  return nodeById.get(id) ?? null
}

/** O(depth) path reconstruction via parent map. Uses push+reverse instead of unshift. */
export function findPathToNode(
  nodeById: Map<string, OrgNode>,
  parentById: Map<string, string>,
  id: string,
): string[] {
  if (!nodeById.has(id)) return []

  const path: string[] = []
  let current: string | undefined = id

  while (current) {
    path.push(current)
    current = parentById.get(current)
  }

  return path.reverse()
}
