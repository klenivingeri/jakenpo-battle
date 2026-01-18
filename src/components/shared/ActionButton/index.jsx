import { useCallback } from 'react'

// Componente reutilizável que usa as classes CSS do componente pai
export const ActionButton = ({ 
  type, 
  label, 
  icon, 
  onClick, 
  disabled = false, 
  onVibrate,
  className = 'button_control_hud'
}) => {
  const handleTouchStart = useCallback((e) => {
    if (disabled) return
    e.currentTarget.classList.add('pressed')
  }, [disabled])

  const handleTouchEnd = useCallback((e) => {
    e.currentTarget.classList.remove('pressed')
  }, [])

  const handleClick = useCallback(() => {
    if (disabled) return
    onVibrate?.()
    onClick?.(type)
  }, [disabled, onVibrate, onClick, type])

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {icon && <img src={icon} height={30} alt={label} />}
      <span>{label}</span>
    </button>
  )
}
