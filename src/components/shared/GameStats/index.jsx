// Componente reutilizável que usa inline styles como no código original
export const GameStats = ({ timeLeft, wins, losses, draws }) => {
  return (
    <div style={{position: 'absolute', display:'flex', flexDirection: 'column', top: 24, left: 10, color: 'black', padding: 5, borderRadius: 5}}>
      <div>Time: {timeLeft}</div>
      <div>Wins: {wins}</div>
      <div>Losses: {losses}</div>
      <div>Draws: {draws}</div>
    </div>
  )
}
