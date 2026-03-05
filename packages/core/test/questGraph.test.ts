import { describe, expect, it } from "vitest";
import type { PlayerSnapshot } from "../src/models/player.js";
import { getProgressionRecommendations } from "../src/analysis/nextQuestTargets.js";
import { buildQuestGraph } from "../src/questGraph/questGraphBuilder.js";
import { parseQuestDataset } from "../src/questGraph/questDataset.js";
import { getCompletedQuestIds, resolveQuests } from "../src/questGraph/questResolver.js";
import { parseUnlockDataset } from "../src/unlocks/unlockDataset.js";
import { resolveUnlocks } from "../src/unlocks/unlockResolver.js";
import { scoreLockedUnlocks } from "../src/unlocks/unlockScoring.js";

function mockPlayer(skills: Record<string, number>): PlayerSnapshot {
  return {
    username: "mock",
    totalskill: 0,
    totalxp: 0,
    combatlevel: 3,
    skills: Object.entries(skills).map(([name, level], idx) => ({
      id: idx,
      name,
      level,
      xp: 0,
      rank: 0
    })),
    fetchedAtIso: "2026-01-01T00:00:00.000Z"
  };
}

describe("dataset validation", () => {
  it("throws actionable diagnostics for invalid quest references", () => {
    const invalid = [
      { id: "q1", name: "Q1", prereqQuests: [], skillReqs: {}, unlockTags: [] },
      { id: "q1", name: "Q2", prereqQuests: ["missing"], skillReqs: {}, unlockTags: [] }
    ];

    expect(() => parseQuestDataset(invalid)).toThrowError(/Duplicate id detected/);
    expect(() => parseQuestDataset(invalid)).toThrowError(/references missing prereq/);
  });
});

describe("resolver availability and blocked reasons", () => {
  it("returns deterministic available/blocked ordering and missing requirements", () => {
    const quests = parseQuestDataset([
      { id: "ports-a", name: "Ports A", prereqQuests: [], skillReqs: {}, unlockTags: ["ports"] },
      {
        id: "prif-a",
        name: "Prif A",
        prereqQuests: [],
        skillReqs: {},
        unlockTags: ["prifddinas"]
      },
      {
        id: "prif-b",
        name: "Prif B",
        prereqQuests: ["prif-a"],
        skillReqs: { herblore: 75 },
        unlockTags: ["prifddinas"]
      }
    ]);
    const graph = buildQuestGraph(quests);
    const player = mockPlayer({ Herblore: 70 });
    const resolved = resolveQuests(player, graph, new Set<string>());

    expect(resolved.availableQuests.map((q) => q.id)).toEqual(["prif-a", "ports-a"]);
    expect(resolved.blockedQuests.map((q) => q.id)).toEqual(["prif-b"]);
    expect(resolved.missingRequirements[0]).toEqual({
      questId: "prif-b",
      questName: "Prif B",
      missingSkills: [{ skill: "herblore", current: 70, required: 75 }],
      missingPrereqQuestIds: ["prif-a"]
    });
    expect(graph.topoSortSubgraph("prif-b")).toEqual(["prif-a", "prif-b"]);
  });
});

describe("unlock scoring and unified recommendations", () => {
  it("scores locked unlocks and emits sorted recommendation objects", () => {
    const quests = parseQuestDataset([
      { id: "q1", name: "Quest One", prereqQuests: [], skillReqs: {}, unlockTags: ["curses"] },
      {
        id: "q2",
        name: "Quest Two",
        prereqQuests: ["q1"],
        skillReqs: { construction: 75 },
        unlockTags: ["prifddinas"]
      }
    ]);
    const graph = buildQuestGraph(quests);
    const unlocks = parseUnlockDataset(
      [
        {
          id: "unlock-prif",
          name: "Prif Access",
          gateQuestId: "q2",
          weight: 100,
          category: "infrastructure",
          rationale: "Major city unlock"
        }
      ],
      new Set(graph.nodesById.keys())
    );

    const completedQuestIds = getCompletedQuestIds(undefined, graph);
    const lockedUnlocks = resolveUnlocks(unlocks, completedQuestIds).locked;
    const scored = scoreLockedUnlocks(lockedUnlocks, completedQuestIds, graph);
    const analysis = getProgressionRecommendations(mockPlayer({ Construction: 70 }), undefined, graph, unlocks);

    expect(scored[0]?.unlock.id).toBe("unlock-prif");
    expect(scored[0]?.score).toBeGreaterThan(0);
    expect(analysis.player).toBe("mock");
    expect(analysis.recommendations.length).toBeGreaterThan(0);
    expect(analysis.recommendations[0]?.score).toBeGreaterThanOrEqual(
      analysis.recommendations[analysis.recommendations.length - 1]?.score ?? 0
    );
  });
});
