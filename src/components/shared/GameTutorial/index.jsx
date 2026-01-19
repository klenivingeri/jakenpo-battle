import React, { useState } from 'react';
import './GameTutorial.css';

const GameTutorial = () => {
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div className={`game-tutorial ${isMinimized ? 'minimized' : ''}`}>
            <div className="tutorial-header" onClick={toggleMinimize}>
                <h3>
                    {isMinimized ? '📖' : '📖 Como Jogar'}
                </h3>
                <button className="minimize-btn">
                    {isMinimized ? '▼' : '▲'}
                </button>
            </div>
            
            {!isMinimized && (
                <div className="tutorial-content">
                    <section className="tutorial-section">
                        <h4>🎮 Objetivo</h4>
                        <p>Derrote o inimigo usando o clássico Pedra, Papel e Tesoura! Gerencie seu HP e ataque estrategicamente.</p>
                    </section>

                    <section className="tutorial-section">
                        <h4>⚔️ Regras de Combate</h4>
                        <ul>
                            <li>🪨 <strong>Pedra</strong> vence Tesoura</li>
                            <li>📄 <strong>Papel</strong> vence Pedra</li>
                            <li>✂️ <strong>Tesoura</strong> vence Papel</li>
                            <li>⚖️ Mesma escolha = <strong>Empate</strong> (ambos sofrem dano)</li>
                        </ul>
                    </section>

                    <section className="tutorial-section">
                        <h4>🎯 Mecânicas</h4>
                        <ul>
                            <li><strong>HP:</strong> Seus pontos de vida. Se chegar a 0, você perde!</li>
                            <li><strong>Ataque:</strong> Dano que seus bullets causam ao inimigo</li>
                            <li><strong>Gold:</strong> Ganhe ouro derrotando bullets inimigos</li>
                            <li><strong>Raridades:</strong> Bullets inimigos mais raros têm mais HP e dão mais ouro</li>
                        </ul>
                    </section>

                    <section className="tutorial-section">
                        <h4>💎 Sistema de Raridades</h4>
                        <div className="rarity-list">
                            <div className="rarity-item">
                                <span className="rarity-badge common">Comum</span>
                                <span>Básico</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge uncommon">Incomum</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge rare">Raro</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge heroic">Heroico</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge legendary">Lendário</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge mythic">Mítico</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                            <div className="rarity-item">
                                <span className="rarity-badge immortal">Imortal</span>
                                <span>+ HP, Ataque, Gold</span>
                            </div>
                        </div>
                    </section>

                    <section className="tutorial-section">
                        <h4>🎲 Modos de Jogo</h4>
                        <ul>
                            <li><strong>Normal:</strong> Complete a fase derrotando o inimigo ou sobrevivendo até o tempo acabar</li>
                            <li><strong>Infinito:</strong> Sobreviva o máximo de fases possível. Cada fase fica mais difícil!</li>
                        </ul>
                    </section>

                    <section className="tutorial-section tips">
                        <h4>💡 Dicas</h4>
                        <ul>
                            <li>Fique de olho nas cores dos rastros - indicam raridade</li>
                            <li>Bullets com barras de HP maiores exigem múltiplos acertos</li>
                            <li>Use o ouro ganho para melhorar suas habilidades</li>
                            <li>Em modos avançados, podem vir múltiplos bullets de uma vez!</li>
                        </ul>
                    </section>
                </div>
            )}
        </div>
    );
};

export default GameTutorial;
