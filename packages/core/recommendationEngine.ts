import quests from "../../data/quests.json"

export interface PlayerState {

  completedQuests: string[]

  skills: Record<string, number>

}

export function recommendNextActions(player: PlayerState) {

  const actions: string[] = []

  for (const quest of quests) {

    if (!player.completedQuests.includes(quest.id)) {

      actions.push(`Complete quest: ${quest.name}`)

    }

  }

  return actions.slice(0, 5)

}
