interface Props {
  quests: any[]
}

export default function QuestProgress({ quests }: Props) {

  const completed = quests.filter(
    q => q.status === "COMPLETED"
  )

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Quest Progress
      </h2>

      <p>

        {completed.length} / {quests.length} quests completed

      </p>

    </div>

  )

}
