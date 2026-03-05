import { describe, it, expect } from "vitest"
import { QuestGraph } from "../questGraph"

describe("QuestGraph", () => {

  it("resolves dependencies correctly", () => {

    const graph = new QuestGraph([
      { id: "a", prerequisites: [] },
      { id: "b", prerequisites: ["a"] },
      { id: "c", prerequisites: ["b"] }
    ])

    const deps = graph.getAllDependencies("c")

    expect(deps).toContain("a")
    expect(deps).toContain("b")

  })

})
