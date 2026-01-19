import React from 'react';
import { calculateGoldMultiplier, calculateBulletGold, calculateExpectedGold, ECONOMY_CONFIG } from '../../../utils/economyUtils';
import './EconomyDebug.css';

const EconomyDebug = ({ roomLevel, enemyDropConfig, gameDuration, spawnInterval }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const goldMultiplier = calculateGoldMultiplier(roomLevel);
  const expectedGold = calculateExpectedGold(enemyDropConfig, roomLevel, gameDuration, spawnInterval);
  const expectedEnemies = Math.floor((gameDuration * 1000) / spawnInterval);

  const rarities = ['common', 'uncommon', 'rare', 'heroic', 'legendary', 'mythic', 'immortal'];

  return (
    <div className="economy-debug">
      <button 
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Debug Economia"
      >
        💰
      </button>

      {isOpen && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>Debug Economia - Fase {roomLevel}</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="debug-content">
            <div className="debug-section">
              <h4>📊 Informações Gerais</h4>
              <p>Multiplicador de Gold: <strong>{goldMultiplier.toFixed(2)}x</strong></p>
              <p>Tempo da Fase: <strong>{gameDuration}s</strong></p>
              <p>Intervalo de Spawn: <strong>{(spawnInterval / 1000).toFixed(1)}s</strong></p>
              <p>Inimigos Esperados: <strong>~{expectedEnemies}</strong></p>
              <p>Gold Esperado: <strong>~{expectedGold} 💰</strong></p>
            </div>

            <div className="debug-section">
              <h4>💎 Gold por Raridade</h4>
              <div className="rarity-table">
                {rarities.map(rarity => {
                  const dropChance = enemyDropConfig[rarity]?.drop || 0;
                  const goldValue = calculateBulletGold(rarity, roomLevel);
                  const baseGold = {
                    common: 1, uncommon: 2, rare: 3, heroic: 4,
                    legendary: 5, mythic: 6, immortal: 7
                  }[rarity];

                  return (
                    <div key={rarity} className="rarity-row">
                      <span className="rarity-name">{rarity}</span>
                      <span className="rarity-chance">{dropChance.toFixed(1)}%</span>
                      <span className="rarity-gold">
                        {baseGold} → <strong>{goldValue}</strong> 💰
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="debug-section">
              <h4>⚙️ Configuração Atual</h4>
              <p>MIN_RUNS: <strong>{ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER}x</strong> (jogadas mínimas)</p>
              <p>GOLD_SCALE: <strong>{ECONOMY_CONFIG.GOLD_SCALE_FACTOR}</strong> (crescimento/fase)</p>
            </div>

            <div className="debug-section highlight">
              <h4>🎯 Próxima Fase</h4>
              <p>Custo Estimado: <strong>~{Math.floor(expectedGold * ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER)} 💰</strong></p>
              <p>Jogadas Necessárias: <strong>{ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomyDebug;
