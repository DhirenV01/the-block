import type { AuctionStatus } from '../../types'

const pillStyles: Record<AuctionStatus, string> = {
  live: 'bg-green-100 text-green-700',
  upcoming: 'bg-amber-100 text-amber-700',
  ended: 'bg-zinc-100 text-zinc-500',
}

const pillLabels: Record<AuctionStatus, string> = {
  live: 'Live',
  upcoming: 'Upcoming',
  ended: 'Ended',
}

interface Props {
  status: AuctionStatus
}

export default function AuctionStatusPill({ status }: Props) {
  return (
    <span className={`inline-flex items-center font-medium uppercase tracking-wide text-xs rounded-full px-2 py-0.5 ${pillStyles[status]}`}>
      {pillLabels[status]}
    </span>
  )
}
