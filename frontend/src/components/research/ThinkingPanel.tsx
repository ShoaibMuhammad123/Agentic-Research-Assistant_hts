/**
 * ThinkingPanel.tsx — Dark "terminal" showing the agent's steps live.
 */
import { useEffect, useRef } from 'react'
import { NODE_CONFIG } from '../../lib/constants'
import type { ThinkingStep } from '../../lib/types'

interface Props {
  steps: ThinkingStep[]
  isLive: boolean
}

export function ThinkingPanel({ steps, isLive }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the newest step
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps.length])

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden bg-terminal-bg border border-terminal-border">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-terminal-surface border-b border-terminal-border">
        <span
          className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-terminal-green animate-pulse-dot' : 'bg-terminal-dim'}`}
        />
        <span className="text-xs font-mono text-terminal-dim">agent thinking</span>
      </div>

      <div className="flex-1 overflow-y-auto terminal-scrollbar p-4 font-mono text-xs space-y-1.5">
        {steps.length === 0 && (
          <p className="text-terminal-dim">Waiting for a research topic…</p>
        )}

        {steps.map((step) => {
          const cfg = NODE_CONFIG[step.node]
          const Icon = cfg?.Icon
          const color = cfg?.color ?? '#8b949e'

          if (step.isHeader) {
            return (
              <div
                key={step.id}
                className="flex items-center gap-2 pt-3 first:pt-0 font-semibold"
                style={{ color }}
              >
                {Icon && <Icon size={14} />}
                <span>{cfg?.label ?? step.node}</span>
                <span className="text-terminal-dim font-normal">— {step.message}</span>
              </div>
            )
          }

          return (
            <div
              key={step.id}
              className="pl-3 text-terminal-text leading-relaxed whitespace-pre-wrap break-words"
              style={{ borderLeft: `2px solid ${color}` }}
            >
              {step.message}
            </div>
          )
        })}

        {isLive && <div className="text-terminal-green animate-pulse-dot">▍</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
