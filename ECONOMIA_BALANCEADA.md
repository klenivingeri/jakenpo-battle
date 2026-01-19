# Sistema de Economia Balanceada - Emoji Battle

## ✅ Implementação Completa

O sistema econômico foi completamente reformulado para garantir que o jogador precise jogar **no mínimo 2 vezes** cada fase para desbloquear a próxima.

## 🎯 Como Funciona

### 1. **Gold Escalado por Fase**
O gold que cada bullet dá aumenta conforme você progride nas fases:

| Fase | Multiplicador | Common | Uncommon | Rare | Heroic | Legendary | Mythic | Immortal |
|------|---------------|--------|----------|------|--------|-----------|--------|----------|
| 1    | 1.0x          | 1      | 2        | 3    | 4      | 5         | 6      | 7        |
| 10   | 2.35x         | 2      | 5        | 7    | 9      | 12        | 14     | 16       |
| 20   | 3.85x         | 4      | 8        | 12   | 15     | 19        | 23     | 27       |
| 50   | 8.35x         | 8      | 17       | 25   | 33     | 42        | 50     | 58       |
| 100  | 15.85x        | 16     | 32       | 48   | 63     | 79        | 95     | 111      |

**Fórmula do Multiplicador:**
```
multiplicador = 1.0 + (nível - 1) × 0.15
```

### 2. **Custo de Desbloqueio Dinâmico**
O custo para desbloquear cada fase é calculado automaticamente baseado no **gold esperado da fase anterior × 2**.

Isso garante que:
- ✅ Você sempre precisa jogar **no mínimo 2 vezes** a fase atual
- ✅ A progressão é consistente em todas as fases
- ✅ Não há "gargalos" econômicos

**Fórmula do Custo:**
```javascript
custoDesbloqueio = goldEsperadoDaFaseAnterior × 2
```

### 3. **Cálculo do Gold Esperado**
O sistema calcula automaticamente quanto gold você deve ganhar em média por partida, considerando:

- **Tempo da fase** (gameDuration)
- **Intervalo de spawn** (spawnInterval) → define quantos inimigos aparecem
- **Chances de raridade** (dropConfig) → probabilidade de cada tipo de bullet
- **Nível da fase** (roomLevel) → multiplicador de gold

**Fórmula:**
```javascript
inimigosEsperados = (tempoFase × 1000) / intervalSpawn
goldMédioPorInimigo = Σ(chanceRaridade × goldDaRaridade × multiplicadorFase)
goldEsperado = inimigosEsperados × goldMédioPorInimigo
```

## 📊 Exemplo Prático

### Fase 5 → Fase 6

**Configuração da Fase 5:**
- Tempo: 35 segundos
- Spawn: 2.4 segundos
- Inimigos esperados: ~14
- Drop config: mix de common, uncommon, rare
- Multiplicador: 1.6x
- **Gold esperado por partida: ~35 gold**

**Custo para desbloquear Fase 6:**
```
custo = 35 × 2 = 70 gold
```

**Resultado:**
- 1 partida = ~35 gold (não desbloqueou)
- 2 partidas = ~70 gold (✅ desbloqueou!)
- 3 partidas = ~105 gold (sobrou para outras compras)

## 🔧 Parâmetros de Ajuste

Se quiser modificar o balanceamento, edite `economyUtils.js`:

```javascript
export const ECONOMY_CONFIG = {
  BASE_MULTIPLIER: 6,           // Multiplicador base para fallback
  EXPONENT: 1.2,                // Expoente da curva de crescimento
  LINEAR_BONUS: 2,              // Bônus linear por nível
  MIN_RUNS_MULTIPLIER: 2.0,     // ⚠️ PRINCIPAL: quantas jogadas mínimas (2x = 2 jogadas)
  GOLD_SCALE_FACTOR: 0.15,      // ⚠️ CRESCIMENTO: quanto o gold aumenta por fase
  GOLD_BASE_MULTIPLIER: 1.0     // Multiplicador inicial
}
```

### Ajustes Recomendados:

**Para tornar mais fácil:**
```javascript
MIN_RUNS_MULTIPLIER: 1.5,  // 1.5 jogadas (mais fácil)
GOLD_SCALE_FACTOR: 0.20,   // Gold cresce 20% por fase
```

**Para tornar mais difícil:**
```javascript
MIN_RUNS_MULTIPLIER: 3.0,  // 3 jogadas mínimas
GOLD_SCALE_FACTOR: 0.10,   // Gold cresce 10% por fase
```

## 🎮 Arquivos Modificados

1. **`src/utils/economyUtils.js`**
   - ✅ Adicionado `calculateGoldMultiplier(level)`
   - ✅ Adicionado `calculateBulletGold(rarity, level)`
   - ✅ Modificado `calculateUnlockCost(level, previousLevelConfig)`
   - ✅ Atualizado `calculateExpectedGold()` para usar nível

2. **`src/utils/gameUtils.js`**
   - ✅ Import de `calculateBulletGold`
   - ✅ Modificado `createBullet()` para aceitar `level` e calcular gold dinamicamente

3. **`src/components/Jankenpo/index.jsx`**
   - ✅ Adicionado prop `roomLevel = 1`
   - ✅ Passando `roomLevel` para `createBullet()`

4. **`src/Game.jsx`**
   - ✅ Separado cálculo de rooms em dois `useMemo`
   - ✅ Custos calculados baseados na fase anterior (`roomsWithCosts`)
   - ✅ Passando `roomLevel` para `GameScene`

## 🧪 Como Testar

1. Inicie o jogo e jogue a **Fase 1**
2. Anote quanto gold você ganhou
3. Veja o custo da **Fase 2** no botão de desbloqueio
4. O custo deve ser aproximadamente **2x o gold que você ganhou**
5. Repita o teste em fases diferentes (5, 10, 20, etc.)

## 🎯 Benefícios do Sistema

✅ **Progressão Consistente:** Sempre 2 jogadas por fase  
✅ **Escalável:** Funciona de forma automática para 100 fases  
✅ **Recompensador:** Gold aumenta conforme você progride  
✅ **Balanceado:** Sem "gargalos" ou fases impossíveis  
✅ **Ajustável:** Fácil de modificar os parâmetros  
✅ **Automático:** Custos se ajustam baseados na dificuldade real da fase

## 📈 Progressão de Gold nas Fases

```
Fase 1:  ~15 gold/partida → Custo próxima: ~30
Fase 5:  ~35 gold/partida → Custo próxima: ~70
Fase 10: ~65 gold/partida → Custo próxima: ~130
Fase 20: ~150 gold/partida → Custo próxima: ~300
Fase 50: ~500 gold/partida → Custo próxima: ~1000
```

*Valores aproximados que variam baseado nas chances de drop e tempo de jogo.*
