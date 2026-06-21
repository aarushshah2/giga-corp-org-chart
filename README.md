# 🏢 Giga Corp Org Chart

**Interactive organizational hierarchy visualization & cost intelligence dashboard** for 40,000 employees — built with Vue 3, TypeScript, and d3-hierarchy.

> Built as a product engineering assessment for Dayforce.

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vite.dev)

---

## ✨ Features

### 📊 Org Chart
- **Expand/collapse** any node to explore reporting lines
- **Per-node metrics**: descendants, non-leaf descendants, management cost, IC cost, total cost, IC/mgmt ratio
- **Instant search** across 40k employees by name, title, or department (debounced, early-terminating)
- **Breadcrumb navigation** with auto-expand path to any node
- **Detail panel** showing full cost rollup for the selected node
- **Department-colored avatars** — consistent hue per department via string hashing
- **Status indicators** — green pulse for active employees

### 📈 Analytics Dashboard
- **KPI cards** with animated counters — headcount, total cost, management vs IC split
- **Cost by department** — stacked management vs IC bars with hover tooltips
- **Span of control** — distribution histogram of direct reports per manager
- **Organization pyramid** — headcount and cost by hierarchy layer with percentage labels
- **Interactive tooltips** — hover any bar for exact breakdowns

### 📱 Responsive
- Mobile search drawer
- Bottom-sheet detail panel on phones/tablets
- Adaptive card layouts across breakpoints

---

## 🏗 Technical Approach

### Performance — O(n) Single-Pass Metrics

The core challenge: computing recursive metrics (descendant count, management cost, IC cost, etc.)
for 40k nodes without redundant traversals.

**Solution**: `d3-hierarchy`'s `eachAfter()` post-order traversal visits each node exactly once.
Metrics computation and OrgNode construction happen in a **single unified pass** — child metrics
bubble up to parents immediately since children are always processed first.

```
CSV → PapaParse → d3.stratify() → eachAfter() [metrics + node build] → OrgNode tree
         O(n)         O(n)              O(n)                                  done
```

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| CSV parse (PapaParse) | O(n) | Streaming parser |
| Tree construction (d3 stratify) | O(n) | Hash-map based parent linking |
| Metrics + node build (eachAfter) | O(n) | Single unified pass |
| Node lookup | O(1) | Pre-built `Map<id, OrgNode>` |
| Path to node | O(depth) | Pre-built `Map<id, parentId>` |
| Search | O(n) | Debounced + early termination at 10 |
| Dept/layer analytics | O(n) | Single pass with nodeById for manager detection |

**Total build time**: ~200-400ms for 40,000 records.

### Key Optimizations

- **Merged tree walks**: Metrics and OrgNode construction happen in one `eachAfter()` instead of two separate passes
- **Iterative traversals**: Span distribution and max-depth use explicit stacks instead of recursion to avoid stack overflow
- **shallowRef for large objects**: Vue reactive proxy only wraps the ref, not the 40k-node tree structure
- **Debounced search**: 200ms debounce prevents filtering 40k records on every keystroke
- **Early termination**: Search stops scanning after finding 10 matches
- **Render depth cap**: OrgNode limits recursive rendering to 6 levels to prevent DOM explosion
- **Single-pass analytics**: Department stats use the pre-built `nodeById` map to classify managers vs ICs without building a separate set

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Tree | d3-hierarchy (stratify + eachAfter) |
| CSV | PapaParse |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/giga-corp-org-chart.git
cd giga-corp-org-chart
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📐 Architecture

```
src/
├── main.ts                    # App entry point
├── App.vue                    # Root: header, search, view toggle, mobile sheet
├── types.ts                   # TypeScript interfaces (Employee, OrgNode, etc.)
├── style.css                  # Tailwind config + animations (fade, slide, shimmer)
├── composables/
│   └── useOrgData.ts          # Central state: load, debounced search, navigate
├── utils/
│   ├── treeBuilder.ts         # CSV → d3 → OrgNode (single eachAfter pass)
│   ├── analytics.ts           # Dept stats, span distribution, layer stats
│   └── format.ts              # Currency/number formatters
└── components/
    ├── OrgChart.vue           # Chart canvas wrapper
    ├── OrgNode.vue            # Node card (dept colors, status dot, depth cap)
    ├── DetailPanel.vue        # Selected node sidebar
    ├── Breadcrumbs.vue        # Path navigation
    └── AnalyticsDashboard.vue # KPIs + animated charts with tooltips
```

---

## 📊 Metric Definitions

| Metric | Definition |
|--------|-----------|
| **Descendants** | All people reporting up through this node (excluding self) |
| **Non-leaf descendants** | Descendants who have at least one direct report |
| **Management cost** | Σ salary of descendant managers (people with reports) |
| **IC cost** | Σ salary of descendant individual contributors (people with no reports) |
| **Total cost** | Σ salary of all descendants |
| **IC/Mgmt ratio** | IC cost ÷ management cost |
| **Span** | Number of direct reports |

---

## 🎨 Design Decisions

- **DM Sans** font for a clean, modern feel with OpenType features enabled
- **Indigo → Violet gradients** as the primary brand palette
- **Department-colored avatars** using deterministic hash-to-HSL for visual distinction at a glance
- **Dot-grid canvas** behind the org chart for a drafting-board aesthetic
- **Animated counters** on KPI cards for a live-dashboard feel
- **Bottom sheet** on mobile for node details (mimics native app UX)
- **Skeleton shimmer** during loading instead of a bare spinner

---

## 📄 License

MIT
