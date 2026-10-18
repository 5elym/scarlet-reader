import { useRef, useEffect } from 'react'

export const pageStack: Array<() => void> = []

export function useHardwareBack(isActive: boolean, closeAction: () => void): void {
  // Ref so the function is always fresh without re-triggering the useEffect
  const actionRef = useRef(closeAction)

  useEffect(() => {
    actionRef.current = closeAction
  }, [closeAction])

  useEffect(() => {
    if (!isActive) return

    const handler = (): void => actionRef.current()
    pageStack.push(handler)

    // When the component unmounts or isActive becomes false, remove it
    return () => {
      const index = pageStack.indexOf(handler)
      if (index > -1) {
        pageStack.splice(index, 1)
      }
    }
  }, [isActive])
}
