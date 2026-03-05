interface Props {
  player: any
}

export default function PlayerSnapshot({ player }: Props) {

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Player Snapshot
      </h2>

      <p>Username: {player.username}</p>

      <p>Total Level: {player.totalLevel}</p>

      <p>Total XP: {player.totalXp}</p>

    </div>

  )

}
