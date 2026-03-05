export interface ProgressionNode {
  id: string
  type: "quest" | "skill" | "unlock" | "activity"
  requirements: string[]
}

export class ProgressionGraph {

  private nodes: Map<string, ProgressionNode> = new Map()

  addNode(node: ProgressionNode) {
    this.nodes.set(node.id, node)
  }

  getNode(id: string) {
    return this.nodes.get(id)
  }

  getDependencies(id: string): string[] {
    return this.nodes.get(id)?.requirements ?? []
  }

}
