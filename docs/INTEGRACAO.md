# 🎮 Guia de Integração Completa - Sistema de Economia

## 📋 Checklist de Implementação

### 1️⃣ Estado do Jogador (Gold)

Adicione o campo `gold` ao estado do jogador em [App.jsx](../src/App.jsx):

```jsx
const [gameStats, setGameStats] = useState(() => {
  const saved = localStorage.getItem('gameStats');
  return saved ? JSON.parse(saved) : {
    gold: 0,           // ← Gold atual do jogador
    wins: 0,
    losses: 0,
    draws: 0
  };
});
```

### 2️⃣ Ganho de Gold ao Derrotar Inimigos

No componente onde inimigos são derrotados, adicione a lógica de recompensa:

```jsx
const handleEnemyDefeated = (enemy) => {
  // Adiciona gold baseado na raridade do inimigo
  setGameStats(prev => ({
    ...prev,
    gold: prev.gold + enemy.gold
  }));
  
  // Feedback visual
  showGoldNotification(enemy.gold, enemy.rarity);
}
```

### 3️⃣ Sistema de Desbloqueio

Adicione validação ao selecionar uma fase:

```jsx
import { canUnlockRoom, calculateUnlockCost } from './utils/economyUtils';

const handleRoomSelect = (roomIndex) => {
  const room = rooms[roomIndex];
  const nextRoomIndex = roomCurrent + 1;
  
  // Se é uma fase já desbloqueada, apenas joga
  if (roomIndex <= roomCurrent) {
    setActiveRoomIndex(roomIndex);
    setScene('Game');
    return;
  }
  
  // Se é a próxima fase, verifica se tem gold
  if (roomIndex === nextRoomIndex) {
    const unlockCost = calculateUnlockCost(room.id);
    
    if (canUnlockRoom(gameStats.gold, room.id)) {
      // Tem gold suficiente - desbloqueia
      setGameStats(prev => ({
        ...prev,
        gold: prev.gold - unlockCost
      }));
      
      setRoomCurrent(nextRoomIndex);
      setActiveRoomIndex(roomIndex);
      setScene('Game');
      
      // SFX de desbloqueio
      playSound('unlock');
    } else {
      // Não tem gold - mostra aviso
      showNotification(`Você precisa de ${unlockCost} gold para desbloquear!`);
    }
  } else {
    // Fase muito avançada
    showNotification('Desbloqueie as fases anteriores primeiro!');
  }
};
```

### 4️⃣ UI de Seleção de Fases

Crie um componente de grid de fases:

```jsx
import { UnlockCost } from '../components/shared/UnlockCost';

const RoomSelectionGrid = ({ rooms, currentRoom, playerGold, onSelectRoom }) => {
  return (
    <div className="room-grid">
      {rooms.map((room, index) => {
        const isUnlocked = index <= currentRoom;
        const isNext = index === currentRoom + 1;
        const isFuture = index > currentRoom + 1;
        
        return (
          <div 
            key={room.id}
            className={`room-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            onClick={() => onSelectRoom(index)}
          >
            {/* Header */}
            <div className="room-header">
              <span className="room-number">Fase {room.id}</span>
              {isUnlocked && (
                <span className="room-stars">
                  {'⭐'.repeat(roomStars[index] || 0)}
                </span>
              )}
            </div>

            {/* Informações da fase */}
            <div className="room-info">
              <span>⏱️ {room.gameDuration}s</span>
              <span>🎯 {room.bulletsPerAction}x ataque</span>
            </div>

            {/* Status de desbloqueio */}
            {isNext && (
              <UnlockCost
                unlockCost={room.unlockCost}
                playerGold={playerGold}
                isUnlocked={false}
              />
            )}

            {isFuture && (
              <div className="room-locked-message">
                🔒 Bloqueado
              </div>
            )}

            {isUnlocked && (
              <button className="room-play-btn">
                ▶️ Jogar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

### 5️⃣ HUD de Gold no Jogo

Adicione um indicador de gold no canto da tela:

```jsx
const GoldDisplay = ({ gold, gainedGold = 0 }) => {
  return (
    <div className="gold-display">
      <span className="gold-icon">💰</span>
      <span className="gold-amount">{gold.toLocaleString('pt-BR')}</span>
      
      {gainedGold > 0 && (
        <span className="gold-gained">+{gainedGold}</span>
      )}
    </div>
  );
};
```

### 6️⃣ Notificação de Gold Ganho

Quando derrotar um inimigo, mostre o gold ganho:

```jsx
const GoldNotification = ({ amount, rarity, x, y }) => {
  return (
    <div 
      className="gold-notification"
      style={{ 
        left: x, 
        top: y,
        color: bulletAttributes[rarity].color 
      }}
    >
      +{amount} 💰
    </div>
  );
};
```

Com CSS:

```css
.gold-notification {
  position: absolute;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  animation: float-up 1s ease-out forwards;
}

@keyframes float-up {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-50px);
  }
}
```

---

## 🎨 Exemplo de Fluxo Completo

### Estrutura em App.jsx

```jsx
function App() {
  // Estados existentes...
  const [gameStats, setGameStats] = useState(() => {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : {
      gold: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  });

  // Adicionar gold ao derrotar inimigo
  const handleBulletDefeat = (bullet) => {
    setGameStats(prev => ({
      ...prev,
      gold: prev.gold + bullet.gold
    }));
  };

  // Seleção de fase com validação
  const handleRoomSelect = (roomIndex) => {
    const room = rooms[roomIndex];
    
    if (roomIndex <= roomCurrent) {
      // Fase já desbloqueada
      setActiveRoomIndex(roomIndex);
      setScene('Game');
    } else if (roomIndex === roomCurrent + 1) {
      // Próxima fase - verifica gold
      if (canUnlockRoom(gameStats.gold, room.id)) {
        setGameStats(prev => ({
          ...prev,
          gold: prev.gold - room.unlockCost
        }));
        setRoomCurrent(roomIndex);
        setActiveRoomIndex(roomIndex);
        setScene('Game');
      } else {
        alert(`Você precisa de ${room.unlockCost} gold!`);
      }
    }
  };

  // Render
  return (
    <div className="App">
      {scene === 'Start' && (
        <InitScene
          rooms={rooms}
          currentRoom={roomCurrent}
          playerGold={gameStats.gold}
          onSelectRoom={handleRoomSelect}
        />
      )}
      
      {scene === 'Game' && (
        <GameScene
          room={rooms[activeRoomIndex]}
          playerGold={gameStats.gold}
          onBulletDefeat={handleBulletDefeat}
        />
      )}
    </div>
  );
}
```

---

## 🧪 Testando o Sistema

### Teste Manual

1. **Iniciar jogo novo**
   - Gold = 0
   - Apenas Fase 1 desbloqueada

2. **Jogar Fase 1**
   - Derrote ~15 inimigos
   - Ganhe ~18-22 gold
   - Repita 2-3 vezes

3. **Desbloquear Fase 2**
   - Custo: 35 gold
   - Clique na Fase 2
   - Confirme desconto de gold
   - Fase 2 desbloqueada

### Console Debug

```javascript
// No console do navegador
window.debugEconomy = () => {
  console.log('Gold:', gameStats.gold);
  console.log('Fase atual:', roomCurrent);
  console.log('Custo próxima:', calculateUnlockCost(roomCurrent + 2));
};

// Adicionar gold para teste
window.addGold = (amount) => {
  setGameStats(prev => ({ ...prev, gold: prev.gold + amount }));
};

// Desbloquear todas as fases
window.unlockAll = () => {
  setRoomCurrent(99);
};
```

---

## 📊 Monitoramento de Balanceamento

Adicione logs para analisar a progressão:

```javascript
// Ao desbloquear fase
const logUnlock = (level, goldSpent, runsPlayed) => {
  console.log({
    level,
    goldSpent,
    runsPlayed,
    efficiency: (runsPlayed / 3 * 100).toFixed(1) + '%'
  });
  
  // Enviar para analytics (opcional)
  if (window.gtag) {
    gtag('event', 'unlock_room', {
      room_level: level,
      gold_spent: goldSpent,
      runs_played: runsPlayed
    });
  }
};
```

---

## 🎯 Ajustes Pós-Lançamento

### Se jogadores reclamam de grind excessivo:

```javascript
// Reduzir custos em 20%
updateEconomyConfig({ 
  BASE_MULTIPLIER: 12 
});
```

### Se progressão está muito rápida:

```javascript
// Aumentar custos em 30%
updateEconomyConfig({ 
  BASE_MULTIPLIER: 20,
  EXPONENT: 1.4 
});
```

### Evento especial (dobrar gold por 24h):

```javascript
const isEventActive = checkEventStatus();

const handleBulletDefeat = (bullet) => {
  const goldEarned = bullet.gold * (isEventActive ? 2 : 1);
  setGameStats(prev => ({
    ...prev,
    gold: prev.gold + goldEarned
  }));
};
```

---

## ✅ Checklist Final

- [ ] Estado de gold implementado
- [ ] Gold persiste no localStorage
- [ ] Inimigos derrotados dão gold
- [ ] unlockCost adicionado às rooms
- [ ] Validação de desbloqueio funcionando
- [ ] UI de UnlockCost renderizando
- [ ] Feedback visual de gold ganho
- [ ] HUD de gold visível no jogo
- [ ] Teste de progressão completo (fases 1-10)
- [ ] Balanceamento validado com script de teste

---

## 🐛 Problemas Comuns

### Gold não está sendo salvo

```javascript
// Adicionar ao useEffect de persistência
useEffect(() => {
  localStorage.setItem('gameStats', JSON.stringify(gameStats));
}, [gameStats]);
```

### Fase não desbloqueia mesmo com gold

```javascript
// Verificar se está comparando level correto
const unlockCost = calculateUnlockCost(room.id); // ✅ Correto
const unlockCost = calculateUnlockCost(roomIndex); // ❌ Errado
```

### Gold fica negativo

```javascript
// Adicionar validação antes de desbloquear
if (gameStats.gold >= room.unlockCost) {
  // Desbloquear
} else {
  // Negar
}
```

---

**Pronto!** Sistema completo e testado. 🚀
