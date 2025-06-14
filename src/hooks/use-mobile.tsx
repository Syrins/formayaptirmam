import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = (): void => {
      if (mountedRef.current) {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
    }

    // Set initial value
    onChange()

    // Add event listener
    mql.addEventListener("change", onChange)

    return () => {
      mountedRef.current = false
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}
