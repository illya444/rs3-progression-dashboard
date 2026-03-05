export interface QuestNode {
  id: string
  prerequisites: string[]
}

export class QuestGraph {

  private graph: Map<string, QuestNode>

  constructor(quests: QuestNode[]) {
    this.graph = new Map()

    quests.forEach(q => {
      this.graph.set(q.id, q)
    })
  }

  getPrerequisites(questId: string): string[] {
    return this.graph.get(questId)?.prerequisites || []
  }

  getAllDependencies(questId: string): string[] {

    const visited = new Set<string>()

    const dfs = (id: string) => {
      const node = this.graph.get(id)
      if (!node) return

      for (const prereq of node.prerequisites) {

        if (!visited.has(prereq)) {
          visited.add(prereq)
          dfs(prereq)
        }

      }
    }

    dfs(questId)

    return Array.from(visited)
  }

}
