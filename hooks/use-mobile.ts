'use client'

import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getIsMobile = React.useCallback(() => {
    // Guard for SSR environments.
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  const [isMobile, setIsMobile] = React.useState<boolean>(() => getIsMobile())

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(getIsMobile())
    }

    // Initialize once from the current matchMedia state.
    onChange()

    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [getIsMobile])

  return isMobile
}

