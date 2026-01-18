import { useCallback } from 'react'

export const useVibration = () => {
  const vibrate = useCallback((pattern = 50) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }, [])

  const vibrateClick = useCallback(() => vibrate(10), [vibrate])
  
  const vibrateHit = useCallback(() => vibrate(40), [vibrate])
  
  const vibrateDamage = useCallback(() => vibrate([100, 50, 100]), [vibrate])

  return {
    vibrate,
    vibrateClick,
    vibrateHit,
    vibrateDamage
  }
}
