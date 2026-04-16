interface Props {
  grade: number
}

export default function ConditionBadge({ grade }: Props) {
  let dotColor: string
  if (grade >= 4.0) dotColor = 'bg-green-500'
  else if (grade >= 2.5) dotColor = 'bg-amber-400'
  else dotColor = 'bg-red-500'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
      <span className="font-mono text-sm text-zinc-700">{grade.toFixed(1)}</span>
    </span>
  )
}
