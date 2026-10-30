/**
 * Header.tsx — Gradient top bar with Research / History tab navigation.
 */
import { History, Search } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tab = 'research' | 'history'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; Icon: typeof Search }[] = [
  { id: 'research', label: 'Research', Icon: Search },
  { id: 'history', label: 'History', Icon: History },
]

export function Header({ activeTab, onTabChange }: Props) {
  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="text-lg font-bold leading-tight">Agentic Research Assistant</h1>
          <p className="text-xs text-indigo-100">Research any topic with proper Reference with your Research Assistant</p>
        </div>

        <nav className="flex gap-1 bg-white/10 rounded-lg p-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-100 hover:bg-white/10',
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
