'use client'

interface Props {
  title: string
}

export default function DeletePoemButton({ title }: Props) {
  return (
    <button
      type="submit"
      className="font-body text-sm text-ink-muted/50 hover:text-red-700 transition-colors"
      onClick={e => {
        if (!confirm(`Delete "${title || 'untitled'}"?`)) e.preventDefault()
      }}
    >
      delete
    </button>
  )
}
