/**
 * HistoryList.tsx — Past reports: view, download PDF, delete.
 */
import { useCallback, useEffect, useState } from 'react'
import { Download, Eye, Loader2, Trash2 } from 'lucide-react'
import { deleteReport, downloadPdf, getFullReport, getHistory } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import type { FullReport, HistoryItem } from '../../lib/types'

interface Props {
  onViewReport: (report: FullReport) => void
}

export function HistoryList({ onViewReport }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getHistory())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusyId(null)
    }
  }

  const handleView = (id: string) => run(id, async () => onViewReport(await getFullReport(id)))
  const handlePdf = (item: HistoryItem) => run(item.id, () => downloadPdf(item.id, item.topic))
  const handleDelete = (id: string) =>
    run(id, async () => {
      if (!window.confirm('Delete this report?')) return
      await deleteReport(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Research History</h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <p className="text-sm text-slate-500">No reports yet. Run a research and it will show up here.</p>
        )}

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{item.topic}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(item.created_at)} · {item.url_count} sources
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {busyId === item.id ? (
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                ) : (
                  <>
                    <button
                      onClick={() => handleView(item.id)}
                      className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handlePdf(item)}
                      className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-md text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
