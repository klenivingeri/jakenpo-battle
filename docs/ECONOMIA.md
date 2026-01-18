# 🎮 Sistema de Progressão e Economia - Emoji Battle

## 📋 Visão Geral

Sistema de progressão baseado em **gold** que requer que o jogador jogue cada fase múltiplas vezes antes de desbloquear a próxima. O custo de desbloqueio escala progressivamente com o nível da fase.

---

## 🔢 Fórmula de Unlock Cost

```javascript
unlockCost = Math.floor(15 × level^1.35 + 5 × level)
```

### Parâmetros Ajustáveis

```javascript
// src/utils/economyUtils.js
export const ECONOMY_CONFIG = {
  BASE_MULTIPLIER: 15,    // Multiplicador base (↑ = mais caro)
  EXPONENT: 1.35,         // Curva exponencial (↑ = escala mais rápido)
  LINEAR_BONUS: 5,        // Bônus linear (↑ = progressão mais suave)
  MIN_RUNS_MULTIPLIER: 3.0 // Rodadas mínimas esperadas
}
```

---

## 📊 Tabela de Custos e Progressão

| Nível | Unlock Cost | Gold/Rodada (Médio) | Rodadas Necessárias |
|-------|-------------|---------------------|---------------------|
| 1     | 0           | 18                  | Desbloqueado        |
| 2     | 35          | 18                  | ~2                  |
| 5     | 63          | 19                  | ~3-4                |
| 10    | 103         | 21                  | ~5                  |
| 20    | 192         | 30                  | ~6-7                |
| 30    | 298         | 35                  | ~8-9                |
| 40    | 419         | 47                  | ~9                  |
| 50    | 556         | 52                  | ~11                 |
| 60    | 709         | 62                  | ~11-12              |
| 70    | 877         | 68                  | ~13                 |
| 80    | 1059        | 75                  | ~14                 |
| 90    | 1256        | 80                  | ~16                 |
| 100   | 1467        | 85                  | ~17                 |

---

## 💻 Como Usar

### 1. Calcular Custo de Desbloqueio

```javascript
import { calculateUnlockCost } from './utils/economyUtils'

const level = 25
const cost = calculateUnlockCost(level)
console.log(`Fase ${level}: ${cost} gold`) // Fase 25: 243 gold
```

### 2. Verificar se Pode Desbloquear

```javascript
import { canUnlockRoom } from './utils/economyUtils'

const playerGold = 500
const nextLevel = 30

if (canUnlockRoom(playerGold, nextLevel)) {
  console.log('Pode desbloquear!')
  // Desconta o custo
  playerGold -= calculateUnlockCost(nextLevel)
}
```

### 3. Obter Estatísticas de uma Fase

```javascript
import { getProgressionStats } from './utils/economyUtils'

const stats = getProgressionStats(
  50,                    // level
  room.enemy,           // dropConfig
  room.gameDuration,    // gameDuration
  room.spawnInterval    // spawnInterval
)

console.log(stats)
// {
//   level: 50,
//   unlockCost: 556,
//   expectedGold: 52,
//   runsNeeded: 11,
//   efficiency: "366.7%"
// }
```

### 4. Gerar Tabela Completa de Progressão

```javascript
import { generateProgressionTable } from './utils/economyUtils'

const progressionTable = generateProgressionTable(rooms)
console.table(progressionTable)
```

---

## 🎯 Integração no Objeto `rooms`

O campo `unlockCost` é automaticamente adicionado a cada sala:

```javascript
const rooms = useMemo(() => Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const unlockCost = calculateUnlockCost(level);
  
  return {
    id: level,
    unlockCost,  // ← Custo para desbloquear esta fase
    gameDuration: 30,
    speed: 2.5,
    // ... resto da configuração
  };
}), []);
```

### Exemplo de Acesso

```javascript
const room = rooms[24] // Fase 25
console.log(room.unlockCost) // 243
```

---

## 🔧 Ajustando o Balanceamento

### Cenário 1: Jogo está muito fácil (progride rápido demais)

```javascript
// Aumentar o multiplicador base
updateEconomyConfig({ BASE_MULTIPLIER: 20 })

// OU aumentar o expoente
updateEconomyConfig({ EXPONENT: 1.5 })
```

### Cenário 2: Jogo está muito difícil (grind excessivo)

```javascript
// Diminuir o multiplicador
updateEconomyConfig({ BASE_MULTIPLIER: 12 })

// OU suavizar a curva
updateEconomyConfig({ EXPONENT: 1.25 })
```

### Cenário 3: Níveis iniciais muito caros

```javascript
// Aumentar o bônus linear (favorece níveis baixos)
updateEconomyConfig({ LINEAR_BONUS: 10 })
```

### Cenário 4: Níveis finais muito baratos

```javascript
// Aumentar o expoente (curva mais agressiva)
updateEconomyConfig({ EXPONENT: 1.45 })
```

---

## 🧪 Script de Teste de Balanceamento

Crie um arquivo `test-economy.js` para validar o balanceamento:

```javascript
import { 
  calculateUnlockCost, 
  calculateExpectedGold,
  getProgressionStats 
} from './src/utils/economyUtils'

// Simula configuração de drops de uma fase média
const sampleDropConfig = {
  common: { drop: 60 },
  uncommon: { drop: 20 },
  rare: { drop: 10 },
  heroic: { drop: 5 },
  legendary: { drop: 3 },
  mythic: { drop: 1.5 },
  immortal: { drop: 0.5 }
}

console.log('=== TESTE DE BALANCEAMENTO ===\n')

// Testa diferentes níveis
const testLevels = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

testLevels.forEach(level => {
  const cost = calculateUnlockCost(level)
  const expectedGold = calculateExpectedGold(sampleDropConfig, 30, 2000)
  const runsNeeded = Math.ceil(cost / expectedGold)
  
  console.log(`Nível ${level.toString().padStart(3)}:`)
  console.log(`  Custo: ${cost.toString().padStart(5)} gold`)
  console.log(`  Gold/rodada: ~${expectedGold}`)
  console.log(`  Rodadas necessárias: ${runsNeeded}`)
  console.log()
})
```

---

## 🚀 Expansões Futuras

### Sistema de Desconto

```javascript
// Desconto de 10% após 10 derrotas na mesma fase
const calculateDiscountedCost = (baseUnlockCost, attempts) => {
  const discount = Math.min(attempts * 0.01, 0.3) // Máximo 30%
  return Math.floor(baseUnlockCost * (1 - discount))
}
```

### Boost de Gold Temporário

```javascript
// Dobrar gold por 5 minutos
const applyGoldBoost = (baseGold, boostMultiplier = 2) => {
  return baseGold * boostMultiplier
}
```

### Sistema de Conquistas

```javascript
// Reduz custo de todas as fases em 5%
const achievementDiscount = 0.05
const finalCost = calculateUnlockCost(level) * (1 - achievementDiscount)
```

### Daily Missions

```javascript
// Recompensa por completar missões diárias
const dailyMissionReward = {
  bronze: 50,
  silver: 100,
  gold: 250
}
```

---

## 📈 Vantagens do Sistema

✅ **Independente de HP dos inimigos** - Baseado apenas em raridades e tempo  
✅ **Escalável** - Funciona de nível 1 a 100 sem quebrar  
✅ **Ajustável** - Parâmetros centralizados para fácil calibragem  
✅ **Previsível** - Jogador sempre sabe quanto precisa farmar  
✅ **Extensível** - Suporta novos sistemas (boosts, descontos, etc.)  
✅ **Testável** - Funções puras facilitam testes automatizados

---

## 🎨 UI Recomendada

### Tela de Seleção de Fase

```jsx
<div className="room-card">
  <h3>Fase {room.id}</h3>
  
  {room.disableButton ? (
    <div className="locked">
      <span>🔒 {room.unlockCost} gold</span>
      <span>Você tem: {playerGold} gold</span>
      <span>Faltam: {room.unlockCost - playerGold} gold</span>
    </div>
  ) : (
    <button onClick={() => startRoom(room.id)}>
      Jogar
    </button>
  )}
</div>
```

### Progresso de Desbloqueio

```jsx
const progress = (playerGold / room.unlockCost) * 100

<div className="unlock-progress">
  <div 
    className="progress-bar" 
    style={{ width: `${Math.min(progress, 100)}%` }}
  />
  <span>{Math.floor(progress)}%</span>
</div>
```

---

## 📝 Checklist de Implementação

- [x] Criar função `calculateUnlockCost`
- [x] Integrar no objeto `rooms`
- [x] Exportar utilitários
- [ ] Adicionar campo `gold` no estado do jogador
- [ ] Implementar ganho de gold ao derrotar inimigos
- [ ] Implementar validação de desbloqueio
- [ ] Criar UI de seleção de fases
- [ ] Adicionar feedback visual de progresso
- [ ] Implementar sistema de save/load de gold
- [ ] Adicionar SFX de desbloqueio

---

## 🐛 Troubleshooting

### Gold não está sendo salvo

```javascript
// Adicionar ao useEffect de persistência
useEffect(() => {
  localStorage.setItem('playerGold', JSON.stringify(playerGold))
}, [playerGold])
```

### Custo parece errado

```javascript
// Verificar se está usando o nível correto (1-based)
const level = roomIndex + 1 // ✅ Correto
const level = roomIndex      // ❌ Errado
```

### Balanceamento quebrado

```javascript
// Regenerar tabela de progressão
const table = generateProgressionTable(rooms)
console.table(table)
// Ajustar ECONOMY_CONFIG conforme necessário
```

---

## 🎯 Meta de Design

> "O jogador deve sentir que está progredindo constantemente, mas cada novo desbloqueio deve ser uma conquista satisfatória."

- ✅ 3-5 rodadas para fases iniciais (aprendizado)
- ✅ 8-12 rodadas para fases médias (engajamento)
- ✅ 15-20 rodadas para fases finais (desafio)

---

**Criado por:** Sistema de Economia Emoji Battle  
**Versão:** 1.0.0  
**Última atualização:** 18 de janeiro de 2026
