interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPages, total, pageSize, onChange }: Props) {
  if (total === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-zinc-500">
        Showing {start}–{end} of {total} vehicle{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="border border-zinc-300 text-zinc-700 rounded-md px-4 py-2 text-sm hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-zinc-500 min-w-[4rem] text-center">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="border border-zinc-300 text-zinc-700 rounded-md px-4 py-2 text-sm hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
