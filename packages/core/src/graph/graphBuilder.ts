import questsData from "../../../../data/quests/quests.json" with { type: "json" };
import unlocksData from "../../../../data/unlocks/unlocks.json" with { type: "json" };
import methodsData from "../../../../data/methods/methods.json" with { type: "json" };
import skillMethodsData from "../../../../data/methods/skill_methods.json" with { type: "json" };
import trainingMethodsData from "../../../../data/methods/trainingMethods.json" with { type: "json" };
import dailiesData from "../../../../data/activities/dailies.json" with { type: "json" };
import weekliesData from "../../../../data/activities/weeklies.json" with { type: "json" };

export type GraphNodeType = "quest" | "skill" | "unlock" | "activity";
export type GraphEdgeType = "requirements" | "dependencies" | "unlocks";

export type GraphNode = {
  id: string;
  type: GraphNodeType;
  requirements: string[];
  metadata?: Record<string, unknown>;
};

export type GraphEdge = {
  from: string;
  to: string;
  type: GraphEdgeType;
};

export type ProgressionGraph = {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
};

type RequirementRow = {
  id?: unknown;
  type?: unknown;
  requirements?: unknown;
  [key: string]: unknown;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter((item) => item.length > 0);
}

export function buildProgressionGraphFromData(): ProgressionGraph {
  const questRows = Array.isArray(questsData) ? (questsData as RequirementRow[]) : [];
  const unlockRows = Array.isArray(unlocksData) ? (unlocksData as RequirementRow[]) : [];
  const methodsRows = Array.isArray(methodsData) ? (methodsData as RequirementRow[]) : [];
  const skillRows = Array.isArray(skillMethodsData) ? (skillMethodsData as RequirementRow[]) : [];
  const trainingRows =
    typeof trainingMethodsData === "object" && trainingMethodsData !== null
      ? (trainingMethodsData as Record<string, unknown>)
      : {};
  const dailyRows = Array.isArray(dailiesData) ? (dailiesData as RequirementRow[]) : [];
  const weeklyRows = Array.isArray(weekliesData) ? (weekliesData as RequirementRow[]) : [];

  const nodes: Record<string, GraphNode> = {};
  const edges: GraphEdge[] = [];

  const upsertNode = (node: GraphNode): void => {
    const existing = nodes[node.id];
    if (!existing) {
      nodes[node.id] = node;
      return;
    }

    nodes[node.id] = {
      ...existing,
      ...node,
      requirements: Array.from(new Set([...(existing.requirements ?? []), ...node.requirements]))
    };
  };

  const ingestRows = (rows: RequirementRow[], fallbackType: GraphNodeType): void => {
    for (const row of rows) {
      const id = String(row.id ?? "").trim();
      if (!id) continue;
      const requirements = asStringArray(row.requirements);
      const rowType = String(row.type ?? fallbackType);
      const type: GraphNodeType =
        rowType === "quest" || rowType === "skill" || rowType === "unlock" ? rowType : fallbackType;

      upsertNode({
        id,
        type,
        requirements,
        metadata: row as Record<string, unknown>
      });
    }
  };

  ingestRows(questRows, "quest");
  ingestRows(unlockRows, "unlock");
  ingestRows(skillRows, "skill");
  ingestRows(methodsRows, "activity");
  ingestRows(dailyRows, "activity");
  ingestRows(weeklyRows, "activity");

  for (const [skillId, trainingMeta] of Object.entries(trainingRows)) {
    upsertNode({
      id: skillId,
      type: "skill",
      requirements: [],
      metadata: { ...(nodes[skillId]?.metadata ?? {}), training: trainingMeta }
    });
  }

  for (const node of Object.values(nodes)) {
    for (const requirementId of node.requirements) {
      if (!nodes[requirementId]) {
        upsertNode({
          id: requirementId,
          type: "skill",
          requirements: []
        });
      }

      edges.push({
        from: node.id,
        to: requirementId,
        type: "requirements"
      });

      edges.push({
        from: requirementId,
        to: node.id,
        type: "dependencies"
      });

      if (node.type === "unlock") {
        edges.push({
          from: requirementId,
          to: node.id,
          type: "unlocks"
        });
      }
    }
  }

  return { nodes, edges };
}
