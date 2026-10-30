/**
 * ResearchInput.tsx — Topic box, web-search toggle, and Start / Clear buttons.
 *
 * onSubmit(topic, useWebSearch):
 *   useWebSearch = null  → let the agent decide ("Auto")
 *   useWebSearch = true  → force web search
 */
import { useState, type KeyboardEvent } from 'react'
import { Loader2, Play, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  isResearching: boolean
  onSubmit: (topic: string, useWebSearch: boolean | null) => void
  onClear: () => void
}

export function ResearchInput({ isResearching, onSubmit, onClear }: Props) {
  const [topic, setTopic] = useState('')
  const [forceWeb, setForceWeb] = useState(false)

  const submit = () => {
    const t = topic.trim()
    if (!t || isResearching) return
    onSubmit(t, forceWeb ? true : null)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isResearching}
        placeholder="Enter a research topic, e.g. Impact of AI on healthcare in 2026"
        className="flex-1 min-w-[260px] px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
      />

      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={forceWeb}
          onChange={(e) => setForceWeb(e.target.checked)}
          disabled={isResearching}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Always use web search
      </label>

      <button
        onClick={submit}
        disabled={isResearching || !topic.trim()}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition',
          isResearching || !topic.trim() ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700',
        )}
      >
        {isResearching ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        {isResearching ? 'Researching…' : 'Start Research'}
      </button>

      <button
        onClick={() => {
          setTopic('')
          onClear()
        }}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
        title="Cancel and clear everything"
      >
        <Trash2 size={15} />
        Clear
      </button>
    </div>
  )
}
