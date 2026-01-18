// Componente reutilizável que usa os CSS originais dos componentes pais
export const HPBar = ({ hp, maxHp = 10, showValue = false, hpClassName = '', ghostClassName = '' }) => {
  const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  
  return (
    <>
      <div className={hpClassName} style={{ width: `${percentage}%` }}>
        {showValue && Math.round(percentage)}
      </div>
      <div className={ghostClassName}></div>
    </>
  )
}
