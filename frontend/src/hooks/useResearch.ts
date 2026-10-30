/**
 * useResearch.ts — All state for one live research session (SSE streaming).
 */
import { useCallback, useRef, useState } from 'react'
import { streamResearch } from '../lib/api'
import type { ResearchStats, SSEEvent, Source, ThinkingStep } from '../lib/types'

export function useResearch() {
  const [isResearching, setIsResearching] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [report, setReport] = useState<string | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [subQuestions, setSubQuestions] = useState<string[]>([])
  const [reportId, setReportId] = useState<string | null>(null)
  const [researchStats, setResearchStats] = useState<ResearchStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const counter = useRef(0)

  const addStep = useCallback((node: ThinkingStep['node'], message: string, isHeader: boolean) => {
    counter.current += 1
    const id = `${node}-${Date.now()}-${counter.current}`
    setThinkingSteps((prev) => [...prev, { id, node, message, isHeader }])
  }, [])

  const reset = useCallback(() => {
    setThinkingSteps([])
    setReport(null)
    setSources([])
    setSubQuestions([])
    setReportId(null)
    setResearchStats(null)
    setError(null)
  }, [])

  const handleEvent = useCallback(
    (ev: SSEEvent) => {
      switch (ev.event) {
        case 'node_start':
          addStep(ev.node, ev.display, true)
          break
        case 'thinking':
          addStep(ev.node, ev.message, false)
          break
        case 'complete':
          setReport(ev.report)
          setSources(ev.sources ?? [])
          setSubQuestions(ev.sub_questions ?? [])
          setReportId(ev.report_id)
          break
        case 'summary':
          setResearchStats(ev.stats)
          break
        case 'error':
          setError(ev.message)
          break
        default:
          break // 'start' needs no UI
      }
    },
    [addStep],
  )

  const startResearch = useCallback(
    async (topic: string, useWebSearch: boolean | null) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      reset()
      setIsResearching(true)

      try {
        await streamResearch(topic, useWebSearch, handleEvent, controller.signal)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError(
            e instanceof Error
              ? `${e.message} — is the backend running on port 8002?`
              : 'Research failed',
          )
        }
      } finally {
        if (abortRef.current === controller) {
          setIsResearching(false)
          abortRef.current = null
        }
      }
    },
    [handleEvent, reset],
  )

  const cancelResearch = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsResearching(false)
  }, [])

  const clear = useCallback(() => {
    cancelResearch()
    reset()
  }, [cancelResearch, reset])

  return {
    isResearching,
    thinkingSteps,
    report,
    sources,
    subQuestions,
    reportId,
    researchStats,
    error,
    startResearch,
    cancelResearch,
    clear,
  }
}
