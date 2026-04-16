interface Props {
  onReset: () => void
}

export default function EmptyState({ onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-zinc-500 text-lg">No vehicles match your filters.</p>
      <p className="text-zinc-400 text-sm mt-1">Try adjusting your search or clearing filters.</p>
      <button
        onClick={onReset}
        className="mt-6 border border-zinc-300 text-zinc-700 rounded-md px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
      >
        Reset filters
      </button>
    </div>
  )
}
