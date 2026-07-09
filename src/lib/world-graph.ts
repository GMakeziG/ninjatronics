// Derived graph view over the compiled world. Nothing here is persisted or
// written back to content/ or data/world.json — it's a pure, computed
// projection over the already-validated World shape from world.ts. Kept out
// of the compiler/schema entirely: every fact this module surfaces (which
// district a guardian/repo belongs to, which districts connect to which) is
// already fully validated by resolve.ts's generic x-ref checking. The World
// Compiler remains the only thing that writes data/world.json; this module
// never duplicates its validation logic, only reads its already-validated
// output.

import type { District, Guardian, Repository, World } from "./world.js";

export interface DistrictNode {
  id: string;
  name: string;
  slug: string;
  status: District["status"];
  guardian?: Guardian;
  repositories: Repository[];
  connections: string[]; // exactly as authored; directed, never auto-symmetrized
}

export interface GraphEdge {
  from: string;
  to: string;
}

export type GraphWarningKind = "asymmetric-connection" | "self-loop" | "unreachable-open-district";

export interface GraphWarning {
  kind: GraphWarningKind;
  districtId: string;
  message: string;
}

export interface WorldGraph {
  nodes: DistrictNode[];
  edges: GraphEdge[];
  warnings: GraphWarning[];
  /** Default start district used by getRecommendedPath when fromId is omitted. */
  entryDistrictId?: string;
}

/** BFS from startId over directed edges. Returns visited ids in traversal order. */
function reachableFrom(nodes: DistrictNode[], edges: GraphEdge[], startId: string): Set<string> {
  const adjacency = new Map<string, string[]>(nodes.map((n) => [n.id, [] as string[]]));
  for (const edge of edges) adjacency.get(edge.from)?.push(edge.to);

  const visited = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const next of adjacency.get(current) ?? []) {
      if (!visited.has(next)) queue.push(next);
    }
  }
  return visited;
}

/** First "open" district by id, else first "in-progress", else the first district by id. */
function pickEntryDistrictId(nodes: DistrictNode[]): string | undefined {
  const byId = (a: DistrictNode, b: DistrictNode) => a.id.localeCompare(b.id);
  const open = [...nodes].filter((n) => n.status === "open").sort(byId)[0];
  if (open) return open.id;
  const inProgress = [...nodes].filter((n) => n.status === "in-progress").sort(byId)[0];
  if (inProgress) return inProgress.id;
  return [...nodes].sort(byId)[0]?.id;
}

export function buildWorldGraph(world: World): WorldGraph {
  const guardianByDistrict = new Map(world.guardians.map((g) => [g.districtId, g]));
  const reposByDistrict = new Map<string, Repository[]>();
  for (const repo of world.repositories) {
    if (!reposByDistrict.has(repo.districtId)) reposByDistrict.set(repo.districtId, []);
    reposByDistrict.get(repo.districtId)!.push(repo);
  }

  const nodes: DistrictNode[] = world.districts.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    status: d.status,
    guardian: guardianByDistrict.get(d.id),
    repositories: reposByDistrict.get(d.id) ?? [],
    connections: d.connections ?? [],
  }));

  const edgeSet = new Map<string, GraphEdge>();
  for (const node of nodes) {
    for (const to of node.connections) edgeSet.set(`${node.id}->${to}`, { from: node.id, to });
  }
  const edges = [...edgeSet.values()];

  const warnings: GraphWarning[] = [];
  const connectionSets = new Map(nodes.map((n) => [n.id, new Set(n.connections)]));

  for (const node of nodes) {
    for (const to of node.connections) {
      if (to === node.id) {
        warnings.push({
          kind: "self-loop",
          districtId: node.id,
          message: `District "${node.id}" lists itself in its own connections.`,
        });
        continue;
      }
      if (!connectionSets.get(to)?.has(node.id)) {
        warnings.push({
          kind: "asymmetric-connection",
          districtId: node.id,
          message: `"${node.id}" connects to "${to}", but "${to}" does not connect back to "${node.id}".`,
        });
      }
    }
  }

  const entryDistrictId = pickEntryDistrictId(nodes);
  if (entryDistrictId) {
    const reachable = reachableFrom(nodes, edges, entryDistrictId);
    for (const node of nodes) {
      if ((node.status === "open" || node.status === "in-progress") && !reachable.has(node.id)) {
        warnings.push({
          kind: "unreachable-open-district",
          districtId: node.id,
          message: `District "${node.id}" is status "${node.status}" but is not reachable from entry district "${entryDistrictId}".`,
        });
      }
    }
  }

  return { nodes, edges, warnings, entryDistrictId };
}

/**
 * Suggested traversal order starting from fromId (or the graph's default
 * entry district). Always returns every district id: districts unreached
 * from the start are appended afterward, sorted by id, so callers never
 * have to handle a partial result.
 */
export function getRecommendedPath(graph: WorldGraph, fromId?: string): string[] {
  const startId = fromId ?? graph.entryDistrictId;
  const allIds = graph.nodes.map((n) => n.id);
  if (!startId || !graph.nodes.some((n) => n.id === startId)) return [...allIds].sort();

  const visited = reachableFrom(graph.nodes, graph.edges, startId);
  const remaining = allIds.filter((id) => !visited.has(id)).sort();
  return [...visited, ...remaining];
}
