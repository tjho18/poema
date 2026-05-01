import { useCallback } from 'react'

// Transforms raw text to typographic equivalents.
// Returns the corrected string or null if nothing changed.
function applySmartPunctuation(text: string): string {
  let out = text

  // em-dash
  out = out.replace(/--/g, '—')
  // ellipsis
  out = out.replace(/\.\.\./g, '…')

  // Curly double quotes: replace straight " with open/close based on context
  out = out.replace(/(^|[\s\(—])"([^"]*)"([\s\),\.;:!?]|$)/gm, '$1\u201C$2\u201D$3')
  // Remaining opening " (after whitespace or start)
  out = out.replace(/(^|[\s(—])"/gm, '$1\u201C')
  // Remaining closing "
  out = out.replace(/"/g, '\u201D')

  // Apostrophe: 'tis, 'twas, contractions like it's
  out = out.replace(/(\w)'(\w)/g, '$1\u2019$2')
  // Leading apostrophe (e.g. 'tis)
  out = out.replace(/(^|[\s(—])'/gm, '$1\u2018')
  // Remaining closing '
  out = out.replace(/'/g, '\u2019')

  return out
}

export function useSmartPunctuation() {
  const transform = useCallback(
    (value: string): { changed: boolean; value: string } => {
      const transformed = applySmartPunctuation(value)
      return { changed: transformed !== value, value: transformed }
    },
    [],
  )

  return { transform }
}
