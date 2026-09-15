import { useState, type KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function FeaturesInput({ value, onChange, placeholder = 'Shtyp Enter për të shtuar' }: Props) {
  const [draft, setDraft] = useState('')

  function add() {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...value, trimmed])
    setDraft('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-white p-2 min-h-[44px]">
        {value.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-cream px-2.5 py-1 text-xs font-medium text-ink"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="rounded p-0.5 text-muted hover:bg-ink/10 hover:text-ink"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1 min-w-[140px]">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={add}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent px-1 py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          {draft.trim() && (
            <button
              type="button"
              onClick={add}
              className="rounded p-1 text-muted hover:bg-ink/5 hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {value.length === 0 ? 'Asnjë pajisje e shtuar' : `${value.length} pajisje`}
      </p>
    </div>
  )
}
