"use client"

import { useEffect, useState } from "react"

import PlayerSnapshot from "../components/PlayerSnapshot"
import QuestProgress from "../components/QuestProgress"
import Recommendations from "../components/Recommendations"

import {
  fetchPlayer,
  fetchQuests,
  fetchRecommendations
} from "../lib/api"

export default function Dashboard() {

  const username = "ILLYA444"

  const [player, setPlayer] = useState<any>(null)

  const [quests, setQuests] = useState<any[]>([])

  const [actions, setActions] = useState<string[]>([])

  useEffect(() => {

    fetchPlayer(username).then(setPlayer)

    fetchQuests(username).then(setQuests)

    fetchRecommendations(username).then(setActions)

  }, [])

  if (!player) return <p>Loading...</p>

  return (

    <main className="space-y-6">

      <h1 className="text-3xl font-bold">
        RS3 Progression Dashboard
      </h1>

      <PlayerSnapshot player={player} />

      <QuestProgress quests={quests} />

      <Recommendations actions={actions} />

    </main>

  )

}
