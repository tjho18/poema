'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WriteSheetContextType {
  isOpen: boolean
  open:   () => void
  close:  () => void
}

const WriteSheetContext = createContext<WriteSheetContextType>({
  isOpen: false,
  open:   () => {},
  close:  () => {},
})

export function WriteSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <WriteSheetContext.Provider value={{
      isOpen,
      open:  () => setIsOpen(true),
      close: () => setIsOpen(false),
    }}>
      {children}
    </WriteSheetContext.Provider>
  )
}

export function useWriteSheet() {
  return useContext(WriteSheetContext)
}
