'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface RespondingTo {
  id: string
  title: string | null
  slug: string | null
  authorUsername: string
  authorDisplayName: string | null
}

interface WriteSheetContextType {
  isOpen:       boolean
  respondingTo: RespondingTo | null
  promptId:     string | null
  promptText:   string | null
  open:         () => void
  openWithResponse: (to: RespondingTo) => void
  close:        () => void
}

const WriteSheetContext = createContext<WriteSheetContextType>({
  isOpen:           false,
  respondingTo:     null,
  promptId:         null,
  promptText:       null,
  open:             () => {},
  openWithResponse: () => {},
  close:            () => {},
})

interface ProviderProps {
  children:   ReactNode
  promptId?:  string | null
  promptText?: string | null
}

export function WriteSheetProvider({
  children,
  promptId  = null,
  promptText = null,
}: ProviderProps) {
  const [isOpen,       setIsOpen      ] = useState(false)
  const [respondingTo, setRespondingTo] = useState<RespondingTo | null>(null)

  function open() {
    setRespondingTo(null)
    setIsOpen(true)
  }

  function openWithResponse(to: RespondingTo) {
    setRespondingTo(to)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    // Keep respondingTo until sheet fully exits so the animation doesn't jump
    setTimeout(() => setRespondingTo(null), 400)
  }

  return (
    <WriteSheetContext.Provider value={{
      isOpen,
      respondingTo,
      promptId,
      promptText,
      open,
      openWithResponse,
      close,
    }}>
      {children}
    </WriteSheetContext.Provider>
  )
}

export function useWriteSheet() {
  return useContext(WriteSheetContext)
}
