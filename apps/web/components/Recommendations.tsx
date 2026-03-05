interface Props {
  actions: string[]
}

export default function Recommendations({ actions }: Props) {

  return (

    <div className="bg-white p-6 rounded shadow">

      <h2 className="text-xl font-bold mb-4">
        Recommended Actions
      </h2>

      <ul className="space-y-2">

        {actions.map((action, index) => (

          <li key={index}>
            {index + 1}. {action}
          </li>

        ))}

      </ul>

    </div>

  )

}
