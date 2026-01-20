import React, { useRef, useEffect, useState } from 'react';
import './Jankenpo.css';
import { useVibration } from '../../hooks/useVibration';
import { GameStats } from '../shared/GameStats';
import { BULLET_CONFIG, GAME_IMAGES, GAME_SOUNDS, DEFAULT_GAME_CONFIG } from '../../constants/gameConfig';
import {
  checkCollision,
  getGameResult,
  selectRandomBulletType,
  selectBulletRarity,
  createBullet,
  createParticle,
  createExplosion,
  drawHPBar
} from '../../utils/gameUtils';
import { getEquippedSkills } from '../../utils/storageUtils';

// Importação das imagens
import stoneImgSrc from '/assets/1_pedra.png';
import paperImgSrc from '/assets/2_papel.png';
import scissorsImgSrc from '/assets/3_tesoura.png';
import explosionImgSrc from '/assets/explosao.png';
import explosionSoundSrc from '/assets/song/song-explosion.mp3';

// Função para encontrar o bullet inimigo mais antigo
const findOldestEnemyBullet = (enemyBullets) => {
  let oldest = null;
  let oldestTime = Infinity;
  
  enemyBullets.forEach(bullet => {
    if (bullet.active && bullet.createdAt < oldestTime) {
      oldest = bullet;
      oldestTime = bullet.createdAt;
    }
  });
  
  return oldest;
};

// Função auxiliar para renderizar um bullet no canvas
const renderBullet = (context, bullet, loadedImages, isRotated = false, hpBarOffset = 5) => {
    if (isRotated) {
        context.save();
        context.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
        context.rotate(Math.PI);
        context.drawImage(loadedImages[bullet.type], -bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        context.restore();
    } else {
        context.drawImage(loadedImages[bullet.type], bullet.x, bullet.y, bullet.width, bullet.height);
    }
    drawHPBar(context, bullet, hpBarOffset);
};

// Função auxiliar para aplicar dano e criar explosões na colisão
const applyCollisionDamage = (pBullet, eBullet, result, setStats, setExplosions, setGold, vibrateHit) => {
    let pDamage = 0;
    let eDamage = 0;

    if (result === 'win') {
        eDamage = pBullet.atk;
        setStats(s => ({...s, wins: s.wins + 1}));
        vibrateHit();
    } else if (result === 'loss') {
        pDamage = eBullet.atk;
        setStats(s => ({...s, losses: s.losses + 1}));
    } else {
        pDamage = eBullet.atk;
        eDamage = pBullet.atk;
        setStats(s => ({...s, draws: s.draws + 1}));
    }

    pBullet.hp -= pDamage;
    eBullet.hp -= eDamage;

    if (pBullet.hp <= 0) pBullet.active = false;
    if (eBullet.hp <= 0) {
        eBullet.active = false;
        if (result === 'win') {
            setGold(prevGold => prevGold + eBullet.gold);
            setExplosions(prev => [...prev, {
                ...createExplosion(pBullet.x, pBullet.y - 25),
                goldText: `+${eBullet.gold}`
            }]);
        } else if (result === 'draw') {
            const halfGold = Math.floor(eBullet.gold / 2);
            setGold(prevGold => prevGold + halfGold);
            setExplosions(prev => [...prev, {
                ...createExplosion(pBullet.x, pBullet.y - 25),
                goldText: `+${halfGold}`
            }]);
        }
    }

    return !pBullet.active;
};

// Função auxiliar para verificar limites e aplicar dano de boundary
const handleBulletBoundaryCheck = (bullets, canvas, isPlayerBullet, setEntity, setExplosions, vibrateFn = null) => {
    const activeBullets = [];
    const boundaryLimit = isPlayerBullet ? 10 : canvas.height - 10;
    const yOffset = isPlayerBullet ? -10 : -40;

    bullets.forEach(bullet => {
        if (bullet.active) {
            const outOfBounds = isPlayerBullet ? bullet.y < boundaryLimit : bullet.y > boundaryLimit;
            if (outOfBounds) {
                bullet.active = false;
                setExplosions(prev => [...prev, createExplosion(bullet.x, bullet.y + yOffset)]);
                setEntity(e => ({ ...e, hp: e.hp - bullet.atk }));
                if (vibrateFn) vibrateFn();
            } else {
                activeBullets.push(bullet);
            }
        }
    });

    return activeBullets;
};

// Função auxiliar para gerar partículas para bullets
const spawnParticlesForBullets = (bullets, particles, loadedImages, config) => {
    // Limitar quantidade de partículas geradas por frame
    if (particles.length > 150) return;
    
    bullets.forEach(bullet => {
        const dist = Math.abs(bullet.y - bullet.lastParticleY);
        if (dist > config.PARTICLE_SPAWN_DISTANCE) {
            const yOffset = bullet.isPlayer ? bullet.height * 0.75 : bullet.height * 0.25;
            const particle = createParticle(
                bullet.x + bullet.width / 2,
                bullet.y + yOffset
            );
            particle.color = bullet.isPlayer ? (loadedImages.trailColor || 'white') : (bullet.color || 'white');
            particles.push(particle);
            bullet.lastParticleY = bullet.y;
        }
    });
};

// Função auxiliar para criar gradiente baseado na cor
const createGradientForColor = (context, color, x, y, size) => {
    const gradient = context.createLinearGradient(x - size / 2, y - size / 2, x + size / 2, y + size / 2);
    
    if (color.includes('Arco-Íris') || color.includes('#FF0000')) {
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.16, '#FF7F00');
        gradient.addColorStop(0.33, '#FFFF00');
        gradient.addColorStop(0.5, '#00FF00');
        gradient.addColorStop(0.66, '#0000FF');
        gradient.addColorStop(0.83, '#4B0082');
        gradient.addColorStop(1, '#9400D3');
    } else if (color.includes('Plasma') || color.includes('#FF006E')) {
        gradient.addColorStop(0, '#FF006E');
        gradient.addColorStop(0.5, '#8338EC');
        gradient.addColorStop(1, '#3A86FF');
    }
    
    return gradient;
};

// Função auxiliar para renderizar e atualizar partículas
const renderParticles = (context, particles, now, config) => {
    const activeParticles = [];
    
    particles.forEach(p => {
        const life = (now - p.createdAt) / config.PARTICLE_LIFETIME;
        if (life < 1) {
            activeParticles.push(p);

            const scale = 1 - life;
            const size = (50 / 2) * scale;

            context.globalAlpha = 1 - life;
            
            if (p.color && p.color.includes('gradient')) {
                context.fillStyle = createGradientForColor(context, p.color, p.x, p.y, size);
            } else {
                context.fillStyle = p.color || 'white';
            }

            context.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }
    });
    
    context.globalAlpha = 1;
    // Limitar o número de partículas ativas para evitar acúmulo
    return activeParticles.slice(-100);
};

// Função auxiliar para renderizar explosões
const renderExplosions = (context, explosions, loadedImages) => {
    const activeExplosions = [];
    
    explosions.forEach(exp => {
        if (exp.anim < 9) {
            const frameWidth = loadedImages['explosao'].width / 3;
            const frameHeight = loadedImages['explosao'].height / 3;

            const frame = exp.anim;
            const sx = (frame % 3) * frameWidth;
            const sy = Math.floor(frame / 3) * frameHeight;

            context.drawImage(
                loadedImages['explosao'],
                sx, sy, frameWidth, frameHeight,
                exp.x, exp.y, 50, 50
            );

            if (exp.goldText) {
                context.fillStyle = 'orange';
                context.font = 'bold 16px Arial';
                context.textAlign = 'center';
                context.fillText(exp.goldText, exp.x + 25, exp.y - 10);
            }

            exp.animCounter++;
            if (exp.animCounter >= exp.animDelay) {
                exp.anim++;
                exp.animCounter = 0;
            }
            activeExplosions.push(exp);
        }
    });
    
    return activeExplosions;
};

// Atualiza bullets do player com targeting
const updatePlayerBulletsWithTargeting = (playerBullets, enemyBullets, speed, now, canvasWidth, config) => {
    playerBullets.forEach(pBullet => {
        if (!pBullet.active) return;
        
        // Se o alvo atual foi destruído ou não existe, busca um novo
        if (!pBullet.target || !pBullet.target.active) {
            pBullet.target = findOldestEnemyBullet(enemyBullets);
        }
        
        const target = pBullet.target;
        
        if (target && target.active) {
            // Calcular direção para o alvo
            const dx = (target.x + target.width / 2) - (pBullet.x + pBullet.width / 2);
            const dy = (target.y + target.height / 2) - (pBullet.y + pBullet.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalizar e aplicar velocidade
                const moveSpeed = Math.abs(speed);
                pBullet.x += (dx / distance) * moveSpeed;
                pBullet.y += (dy / distance) * moveSpeed;
            }
        } else {
            // Se não há alvo disponível, move em linha reta para cima
            pBullet.y += speed;
        }
        
        // Escala de crescimento baseada no tempo
        const age = now - pBullet.createdAt;
        const scale = Math.min(1, age / config.ANIMATION_DURATION);
        const currentSize = 50 * scale;
        
        pBullet.width = currentSize;
        pBullet.height = currentSize;
    });
};

// Atualiza bullets do inimigo (movimento simples para baixo)
const updateEnemyBullets = (enemyBullets, speed, now, config) => {
    enemyBullets.forEach(eBullet => {
        eBullet.y += speed;
        
        // Escala de crescimento baseada no tempo
        const age = now - eBullet.createdAt;
        const scale = Math.min(1, age / config.ANIMATION_DURATION);
        const currentSize = 50 * scale;
        
        eBullet.width = currentSize;
        eBullet.height = currentSize;
    });
};

const JankenpoChaos = ({ 
    handleBullet, 
    player, 
    setPlayer, 
    enemy, 
    setEnemy, 
    setdisableButtonPlayer, 
    handleGameEnd,
    handlePhaseComplete,
    gameDuration = DEFAULT_GAME_CONFIG.GAME_DURATION, 
    speed = DEFAULT_GAME_CONFIG.BULLET_SPEED, 
    spawnInterval = DEFAULT_GAME_CONFIG.SPAWN_INTERVAL,
    roomLevel = 1,
    currentPhase = 1,
    totalTime = 0,
    timeLeft: externalTimeLeft,
    setTimeLeft: externalSetTimeLeft,
    enemyDropConfig = {
        common: { drop: 100 },
        uncommon: { drop: 0 },
        rare: { drop: 0 },
        heroic: { drop: 0 },
        legendary: { drop: 0 },
        mythic: { drop: 0 },
        immortal: { drop: 0 }
    }
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [enemyBullets, setEnemyBullets] = useState([]);
    const [playerBullets, setPlayerBullets] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [particles, setParticles] = useState([]);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [internalTimeLeft, setInternalTimeLeft] = useState(gameDuration);
    const timeLeft = externalTimeLeft !== undefined ? externalTimeLeft : internalTimeLeft;
    const setTimeLeft = externalSetTimeLeft ? externalSetTimeLeft : setInternalTimeLeft;
    const [loadedImages, setLoadedImages] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gold, setGold] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const explosionAudioRef = useRef(new Audio(explosionSoundSrc));
    const { vibrateHit, vibrateDamage } = useVibration();
    const previousPhaseRef = useRef(currentPhase);
    const [showPhaseNotification, setShowPhaseNotification] = useState(false);

    // Reset/inicialização quando muda de fase
    useEffect(() => {
        // Detecta mudança de fase e mostra efeito visual
        if (previousPhaseRef.current !== currentPhase && previousPhaseRef.current !== undefined) {
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50, 30, 50]);
            }

            setShowPhaseNotification(true);
            setTimeout(() => {
                setShowPhaseNotification(false);
            }, 3000);
        }
        
        previousPhaseRef.current = currentPhase;
        
        setTimeLeft(gameDuration);
        setIsGameOver(false);
        if (!isInitialized) {
            setTimeout(() => setIsInitialized(true), 50);
        }
    }, [gameDuration, roomLevel, isInitialized, currentPhase, setTimeLeft]);

    // Redimensionamento do Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height;
            }
        });

        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, []);

    // Carregamento das imagens
    useEffect(() => {
        const equippedSkills = getEquippedSkills();
        
        const images = {
            'pedra': equippedSkills.pedra,
            'papel': equippedSkills.papel,
            'tesoura': equippedSkills.tesoura,
            'explosao': explosionImgSrc
        };
        
        const imagePromises = Object.keys(images).map(key => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = images[key];
                img.onload = () => resolve({key, img});
                img.onerror = (err) => reject(`Failed to load ${images[key]}: ${err}`);
            });
        });

        Promise.all(imagePromises).then(results => {
            const imageObjects = results.reduce((acc, {key, img}) => {
                acc[key] = img;
                return acc;
            }, {});
            imageObjects.trailColor = equippedSkills.calda;
            setLoadedImages(imageObjects);
        }).catch(error => {
            console.error("Error loading images:", error);
        });
    }, []);

    // Verificador de condição de fim de jogo (modo caos = infinito)
    useEffect(() => {
        if (isGameOver || !isInitialized) return;

        if (player.hp <= 0) {
            setIsGameOver(true);
            handleGameEnd({ 
                ...stats, 
                result: 'loss', 
                gold,
                phasesCompleted: currentPhase,
                totalTime: totalTime + (gameDuration - timeLeft)
            });
        } else if (timeLeft <= 0) {
            // Fase completada, passar para próxima
            if (handlePhaseComplete) {
                handlePhaseComplete();
            }
        } else if (enemy.hp <= 0) {
            // No modo caos, se o enemy morrer antes do tempo, continua a fase
            setEnemy({ hp: 10, atk: 1 });
        }
    }, [player.hp, enemy.hp, timeLeft, isGameOver, handleGameEnd, handlePhaseComplete, stats, gold, isInitialized, gameDuration, setEnemy, currentPhase, totalTime]);

    // Temporizador do jogo
    useEffect(() => {
        if (isGameOver || !loadedImages) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameOver, loadedImages, setTimeLeft]);

    // Lógica de disparo do inimigo - SPAWN ALEATÓRIO EM X
    useEffect(() => {
        if (isGameOver || !loadedImages || !canvasRef.current) return;

        const enemyShootInterval = setInterval(() => {
            setEnemyBullets(prevBullets => {
                const bulletTypes = Object.keys(BULLET_CONFIG);
                const newType = selectRandomBulletType(prevBullets, bulletTypes);
                const rarity = selectBulletRarity(enemyDropConfig);
                
                // POSIÇÃO X ALEATÓRIA - MODO CAOS
                const bulletWidth = DEFAULT_GAME_CONFIG.BULLET_SIZE;
                const randomX = Math.random() * (canvasRef.current.width - bulletWidth);
                
                const newBullet = createBullet(
                    newType,
                    randomX, // Posição X aleatória ao invés de centro
                    0,
                    bulletWidth,
                    DEFAULT_GAME_CONFIG.BULLET_SIZE,
                    rarity,
                    roomLevel
                );
                
                // Armazenar posição X inicial do spawn
                newBullet.spawnX = randomX;
                
                return [...prevBullets, newBullet];
            });
        }, spawnInterval);

        return () => clearInterval(enemyShootInterval);
    }, [isGameOver, loadedImages, spawnInterval, enemyDropConfig, roomLevel]);

    // Lógica de disparo do jogador
    useEffect(() => {
        if (isGameOver || !player.bulletType || !canvasRef.current) return;

        if (playerBullets.length < enemyBullets.length + 1) {
            const newBullet = createBullet(
                player.bulletType,
                canvasRef.current.width / 2 - DEFAULT_GAME_CONFIG.BULLET_SIZE / 2,
                canvasRef.current.height - 30,
                DEFAULT_GAME_CONFIG.BULLET_SIZE,
                DEFAULT_GAME_CONFIG.BULLET_SIZE,
                'common'
            );
            newBullet.lastParticleY = canvasRef.current.height - 50;
            newBullet.isPlayer = true;
            setPlayerBullets(prev => [...prev, newBullet]);
            handleBullet(null, 'player');
        }
    }, [isGameOver, player.bulletType, playerBullets.length, enemyBullets.length, handleBullet]);
    
    // Referências para estado mutável do jogo
    const playerBulletsRef = useRef(playerBullets);
    playerBulletsRef.current = playerBullets;
    const enemyBulletsRef = useRef(enemyBullets);
    enemyBulletsRef.current = enemyBullets;
    const explosionsRef = useRef(explosions);
    explosionsRef.current = explosions;
    const particlesRef = useRef(particles);
    particlesRef.current = particles;
    
    // Desabilitar botão do jogador
    useEffect(() => {
        setdisableButtonPlayer(playerBullets.length >= enemyBullets.length + 1 || isGameOver);
    }, [playerBullets, enemyBullets, setdisableButtonPlayer, isGameOver]);

    // Loop principal do jogo
    useEffect(() => {
        if (!loadedImages || isGameOver) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrameId;

        const update = () => {
            if(!canvas) return;
            context.clearRect(0, 0, canvas.width, canvas.height);

            const now = performance.now();

            // Mover bullets com targeting para player, movimento linear para inimigo
            updatePlayerBulletsWithTargeting(playerBulletsRef.current, enemyBulletsRef.current, -speed, now, canvas.width, DEFAULT_GAME_CONFIG);
            updateEnemyBullets(enemyBulletsRef.current, speed, now, DEFAULT_GAME_CONFIG);

            // --- Detecção de Colisão ---
            for (const pBullet of playerBulletsRef.current) {
                if (!pBullet.active) continue;

                for (const eBullet of enemyBulletsRef.current) {
                    if (!eBullet.active) continue;

                    if (checkCollision(pBullet, eBullet)) {
                        const result = getGameResult(pBullet.type, eBullet.type);
                        setExplosions(prev => [...prev, createExplosion(pBullet.x, pBullet.y - 25)]);
                        
                        if (explosionAudioRef.current) {
                            explosionAudioRef.current.currentTime = 0;
                            explosionAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
                        }

                        const shouldBreak = applyCollisionDamage(
                            pBullet, eBullet, result, setStats, 
                            setExplosions, setGold, vibrateHit
                        );
                        
                        if (shouldBreak) {
                            break; 
                        }
                    }
                }
            }

            // --- Filtragem e Verificação de Limites ---
            const activePlayerBullets = handleBulletBoundaryCheck(
                playerBulletsRef.current, canvas, true, setEnemy, setExplosions
            );

            const activeEnemyBullets = handleBulletBoundaryCheck(
                enemyBulletsRef.current, canvas, false, setPlayer, setExplosions, vibrateDamage
            );

            if (activePlayerBullets.length !== playerBulletsRef.current.length) {
                setPlayerBullets(activePlayerBullets);
            }
            if (activeEnemyBullets.length !== enemyBulletsRef.current.length) {
                setEnemyBullets(activeEnemyBullets);
            }

            // --- Sistema de Partículas ---
            const particleNow = performance.now();

            spawnParticlesForBullets(playerBulletsRef.current, particlesRef.current, loadedImages, DEFAULT_GAME_CONFIG);
            spawnParticlesForBullets(enemyBulletsRef.current, particlesRef.current, loadedImages, DEFAULT_GAME_CONFIG);

            const activeParticles = renderParticles(context, particlesRef.current, particleNow, DEFAULT_GAME_CONFIG);

            if (activeParticles.length !== particlesRef.current.length) {
                setParticles(activeParticles);
            }

            // --- Desenho ---
            playerBulletsRef.current.forEach(b => renderBullet(context, b, loadedImages, false, 5));
            enemyBulletsRef.current.forEach(b => renderBullet(context, b, loadedImages, true, -63));
            
            const activeExplosions = renderExplosions(context, explosionsRef.current, loadedImages);
            
            if(activeExplosions.length !== explosionsRef.current.length) {
                setExplosions(activeExplosions);
            }

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, [loadedImages, isGameOver, setPlayer, setEnemy, speed, vibrateHit, vibrateDamage]);

    return (
        <div ref={containerRef} className="canvas-container">
            <GameStats 
                timeLeft={timeLeft}
                wins={stats.wins}
                losses={stats.losses}
                draws={stats.draws}
                gold={gold}
            />
            <canvas ref={canvasRef} />
            
            {/* Notificação lateral de nova fase */}
            {showPhaseNotification && (
                <div className="phase-notification">
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textShadow: '2px 2px 0 #000000',
                        marginBottom: '5px',
                        textAlign: 'center',
                    }}>
                        NOVA FASE - CAOS
                    </div>
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: '#ff0000',
                        textShadow: '3px 3px 0 #000000',
                        textAlign: 'center',
                    }}>
                        {currentPhase}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JankenpoChaos;
