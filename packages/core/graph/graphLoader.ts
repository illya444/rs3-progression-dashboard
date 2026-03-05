import fs from "fs"
import path from "path"
import { ProgressionGraph } from "./progressionGraph"
import { inspectGraph } from "./graphDiagnostics"

function loadJSON(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw)
}

export function loadProgressionGraph() {

  const graph = new ProgressionGraph()

  const datasets = [
    "quests/quests.json",
    "unlocks/unlocks.json",
    "activities/dailies.json",
    "methods/skill_methods.json",
    "ports/regions.json"
  ]

  const basePath = path.resolve(process.cwd(), "data")

  for (const dataset of datasets) {

    const file = path.join(basePath, dataset)

    if (!fs.existsSync(file)) continue

    const nodes = loadJSON(file)

    for (const node of nodes) {

      graph.addNode({
        id: node.id || node.name,
        type: node.type || "activity",
        requirements: node.requirements || []
      })

    }

  }

  inspectGraph(graph as any)

  return graph

}
