/**
 * ReportPanel.tsx — Renders the final markdown report, sources, and PDF download.
 */
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { downloadPdf } from '../../lib/api'
import type { ResearchStats, Source } from '../../lib/types'

interface Props {
  report: string | null
  sources: Source[]
  subQuestions: string[]
  reportId: string | null
  researchStats: ResearchStats | null
  topic: string
  isResearching: boolean
}

export function ReportPanel({
  report,
  sources,
  subQuestions,
  reportId,
  researchStats,
  topic,
  isResearching,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!reportId) return
    setDownloading(true)
    setPdfError(null)
    try {
      await downloadPdf(reportId, topic || 'report')
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'PDF download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <FileText size={16} />
          Research Report
        </div>

        {report && reportId && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            Download PDF
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {pdfError && (
          <div className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
            {pdfError}
          </div>
        )}

        {!report && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            {isResearching ? (
              <>
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm">The agent is researching — the report will appear here.</p>
              </>
            ) : (
              <>
                <FileText size={36} className="mb-3" />
                <p className="text-sm">Enter a topic above and press Start Research.</p>
              </>
            )}
          </div>
        )}

        {report && (
          <>
            {researchStats && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex flex-wrap gap-x-5 gap-y-1">
                <span><b>Strategy:</b> {researchStats.strategy === 'both' ? 'Web + Knowledge Base' : 'Web only'}</span>
                <span><b>URLs found:</b> {researchStats.urls_searched}</span>
                <span><b>KB used:</b> {researchStats.kb_searched ? 'Yes' : 'No'}</span>
              </div>
            )}

            {subQuestions.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-1.5">Sub-questions investigated</h3>
                <ol className="list-decimal list-inside text-sm text-slate-600 space-y-0.5">
                  {subQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>
            )}

            <article className="prose-report">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
            </article>

            {sources.length > 0 && (
              <div className="mt-8 pt-5 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Sources ({sources.length})</h3>
                <ul className="space-y-2">
                  {sources.map((s, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {s.title || s.url}
                        <ExternalLink size={12} />
                      </a>
                      {s.content_preview && (
                        <p className="text-xs text-slate-500 line-clamp-2">{s.content_preview}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
