export interface EmployeeRow {
  'Employee Id': string
  Name: string
  'Job Title': string
  Email: string
  Manager: string
  Status: string
  Department: string
  Location: string
  Salary: string
  level: string
}

export interface Employee {
  id: string
  name: string
  jobTitle: string
  email: string
  managerId: string
  status: string
  department: string
  location: string
  salary: number
  level: number
}

export interface NodeMetrics {
  descendantCount: number
  nonLeafDescendantCount: number
  managementCost: number
  icCost: number
  totalCost: number
  managementCostRatio: number
}

export interface OrgNode extends Employee, NodeMetrics {
  children: OrgNode[]
  span: number
}

export interface DepartmentStats {
  department: string
  headcount: number
  managementCost: number
  icCost: number
  totalCost: number
}

export interface SpanBucket {
  label: string
  count: number
}

export interface LayerStats {
  level: number
  headcount: number
  totalCost: number
}
