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
  updateBulletTransform,
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
    return activeParticles;
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

// Função auxiliar para atualizar bullets
const updateBullets = (bullets, speed, now, canvasWidth, config) => {
    bullets.forEach(b => {
        updateBulletTransform(b, speed, now, canvasWidth, config.ANIMATION_DURATION);
    });
};

const Jankenpo = ({ 
    handleBullet, 
    player, 
    setPlayer, 
    enemy, 
    setEnemy, 
    setdisableButtonPlayer, 
    setScene, 
    handleGameEnd,
    handlePhaseComplete, // Nova prop para modo infinito
    gameDuration = DEFAULT_GAME_CONFIG.GAME_DURATION, 
    speed = DEFAULT_GAME_CONFIG.BULLET_SPEED, 
    spawnInterval = DEFAULT_GAME_CONFIG.SPAWN_INTERVAL,
    bulletsPerSpawn = 1, // Quantidade máxima de bullets por spawn
    roomLevel = 1, // Nível da fase atual
    isInfiniteMode = false, // Nova prop para indicar modo infinito
    currentPhase = 1, // Número da fase atual (modo infinito)
    totalTime = 0, // Tempo total acumulado (modo infinito)
    timeLeft: externalTimeLeft, // TimeLeft externo (modo infinito)
    setTimeLeft: externalSetTimeLeft, // Setter externo (modo infinito)
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
    // Usa timeLeft externo se fornecido (modo infinito), senão usa o interno
    const timeLeft = isInfiniteMode && externalTimeLeft !== undefined ? externalTimeLeft : internalTimeLeft;
    const setTimeLeft = isInfiniteMode && externalSetTimeLeft ? externalSetTimeLeft : setInternalTimeLeft;
    const [loadedImages, setLoadedImages] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gold, setGold] = useState(0); // Estado para armazenar o gold acumulado
    const [isInitialized, setIsInitialized] = useState(false); // Flag para indicar inicialização
    const explosionAudioRef = useRef(new Audio(explosionSoundSrc));
    const { vibrateHit, vibrateDamage } = useVibration();
    const [showLevelUp, setShowLevelUp] = useState(false); // Efeito de level up
    const [levelUpProgress, setLevelUpProgress] = useState(0); // Progresso do degradê
    const previousPhaseRef = useRef(currentPhase); // Ref para detectar mudança de fase
    const [showPhaseNotification, setShowPhaseNotification] = useState(false); // Notificação lateral

    // Reset completo quando a room muda (gameDuration e roomLevel são identificadores da room)
    useEffect(() => {
        // No modo infinito, detecta mudança de fase e mostra efeito visual
        if (isInfiniteMode && previousPhaseRef.current !== currentPhase && previousPhaseRef.current !== undefined) {
            // Vibração de feedback
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50, 30, 50]);
            }

            // Ativa o efeito de degradê subindo
            setShowLevelUp(true);
            setLevelUpProgress(0);
            
            // Anima o degradê subindo
            const duration = 2000; // 2 segundos para atravessar toda a tela
            const startTime = Date.now();
            const animateGradient = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                setLevelUpProgress(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateGradient);
                } else {
                    setShowLevelUp(false);
                }
            };
            requestAnimationFrame(animateGradient);

            // Mostra notificação lateral
            setShowPhaseNotification(true);
            setTimeout(() => {
                setShowPhaseNotification(false);
            }, 3000);
        }
        
        previousPhaseRef.current = currentPhase;
        
        // No modo infinito, não reseta nada, apenas atualiza o timer
        if (isInfiniteMode) {
            setTimeLeft(gameDuration);
            setIsGameOver(false);
            if (!isInitialized) {
                setTimeout(() => setIsInitialized(true), 50);
            }
        } else {
            // Modo normal: resetar todos os estados para valores iniciais
            setEnemyBullets([]);
            setPlayerBullets([]);
            setExplosions([]);
            setParticles([]);
            setStats({ wins: 0, losses: 0, draws: 0 });
            setTimeLeft(gameDuration);
            setIsGameOver(false);
            setGold(0);
            setIsInitialized(false);
            
            // Garantir que o HP do player e enemy estejam resetados
            setPlayer({ hp: 10, atk: 1 });
            setEnemy({ hp: 10, atk: 1 });
            
            setTimeout(() => setIsInitialized(true), 50);
        }
    }, [gameDuration, roomLevel, setPlayer, setEnemy, isInfiniteMode, isInitialized]); // Reage às mudanças de room

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
            // Adicionar a cor da calda
            imageObjects.trailColor = equippedSkills.calda;
            setLoadedImages(imageObjects);
        }).catch(error => {
            console.error("Error loading images:", error);
        });
    }, []);

    // Verificador de condição de fim de jogo
    useEffect(() => {
        // Não verifica fim de jogo até estar inicializado
        if (isGameOver || !isInitialized) return;

        // No modo infinito, só termina se o player morrer
        if (isInfiniteMode) {
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
                // No modo infinito, se o enemy morrer antes do tempo, continua a fase
                setEnemy({ hp: 10, atk: 1 });
            }
        } else {
            // Modo normal
            if (player.hp <= 0 || timeLeft <= 0) {
                setIsGameOver(true);
                const finalResult = player.hp > 0 ? 'win' : 'loss';
                handleGameEnd({ ...stats, result: finalResult, gold });
            } else if (enemy.hp <= 0) {
                setIsGameOver(true);
                handleGameEnd({ ...stats, result: 'win', gold });
            }
        }
    }, [player.hp, enemy.hp, timeLeft, isGameOver, handleGameEnd, handlePhaseComplete, stats, gold, isInitialized, isInfiniteMode, gameDuration, setEnemy, currentPhase, totalTime]);


    // Temporizador do jogo
     useEffect(() => {
        if (isGameOver || !loadedImages) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameOver, loadedImages]);


    // Lógica de disparo do inimigo
    useEffect(() => {
        if (isGameOver || !loadedImages || !canvasRef.current) return;

        const enemyShootInterval = setInterval(() => {
            const bulletTypes = Object.keys(BULLET_CONFIG);
            const canvas = canvasRef.current;
            const centerX = canvas.width / 2;
            const bulletSize = DEFAULT_GAME_CONFIG.BULLET_SIZE;
            
            // Determinar quantos bullets spawnar baseado em bulletsPerSpawn
            let bulletsToSpawn = 1;
            if (bulletsPerSpawn > 1) {
                const roll = Math.random() * 100;
                
                // Sistema de probabilidade progressivo
                if (bulletsPerSpawn === 2) {
                    // 40% chance de 2 bullets
                    bulletsToSpawn = roll < 40 ? 2 : 1;
                } else if (bulletsPerSpawn === 3) {
                    // 20% trio, 30% duo, 50% solo
                    if (roll < 20) bulletsToSpawn = 3;
                    else if (roll < 50) bulletsToSpawn = 2;
                    else bulletsToSpawn = 1;
                } else if (bulletsPerSpawn >= 4) {
                    // Para valores maiores, distribuir chances
                    const max = Math.min(bulletsPerSpawn, 7);
                    if (roll < 10) bulletsToSpawn = max; // 10% chance máximo
                    else if (roll < 30) bulletsToSpawn = Math.max(2, Math.floor(max * 0.7)); // 20% chance médio-alto
                    else if (roll < 60) bulletsToSpawn = Math.max(2, Math.floor(max * 0.5)); // 30% chance médio
                    else if (roll < 80) bulletsToSpawn = 2; // 20% chance duo
                    else bulletsToSpawn = 1; // 20% chance solo
                }
            }
            
            const spacing = bulletSize + 15; // Espaçamento entre bullets
            const totalWidth = (bulletsToSpawn - 1) * spacing;
            const startX = centerX - totalWidth / 2;
            
            // Spawnar bullets com delay de 0.3s entre cada um
            for (let i = 0; i < bulletsToSpawn; i++) {
                setTimeout(() => {
                    setEnemyBullets(prevBullets => {
                        const newType = selectRandomBulletType(prevBullets, bulletTypes);
                        const rarity = selectBulletRarity(enemyDropConfig);
                        const xPos = startX + (i * spacing) - bulletSize / 2;
                        
                        const newBullet = createBullet(
                            newType,
                            xPos,
                            0,
                            bulletSize,
                            bulletSize,
                            rarity,
                            roomLevel
                        );
                        
                        return [...prevBullets, newBullet];
                    });
                }, i * 300); // 300ms (0.3s) de delay entre cada bullet
            }
        }, spawnInterval);

        return () => clearInterval(enemyShootInterval);
    }, [isGameOver, loadedImages, spawnInterval, enemyDropConfig, roomLevel, bulletsPerSpawn]);

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
                'common' // Player sempre usa bullets comuns
            );
            newBullet.lastParticleY = canvasRef.current.height - 50;
            newBullet.isPlayer = true; // Marcar como bullet do player
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

            // Mover e redimensionar balas
            const now = performance.now();

            updateBullets(playerBulletsRef.current, -speed, now, canvas.width, DEFAULT_GAME_CONFIG);
            updateBullets(enemyBulletsRef.current, speed, now, canvas.width, DEFAULT_GAME_CONFIG);

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


            // Disparar re-renderização se a contagem de balas mudar
            if (activePlayerBullets.length !== playerBulletsRef.current.length) {
                setPlayerBullets(activePlayerBullets);
            }
            if (activeEnemyBullets.length !== enemyBulletsRef.current.length) {
                setEnemyBullets(activeEnemyBullets);
            }

            // --- Sistema de Partículas ---
            const particleNow = performance.now();

            // Gerar novas partículas
            spawnParticlesForBullets(playerBulletsRef.current, particlesRef.current, loadedImages, DEFAULT_GAME_CONFIG);
            spawnParticlesForBullets(enemyBulletsRef.current, particlesRef.current, loadedImages, DEFAULT_GAME_CONFIG);

            // Atualizar e desenhar partículas
            const activeParticles = renderParticles(context, particlesRef.current, particleNow, DEFAULT_GAME_CONFIG);

            if (activeParticles.length !== particlesRef.current.length) {
                setParticles(activeParticles);
            }


            // --- Desenho ---
            // Desenhar balas do jogador
            playerBulletsRef.current.forEach(b => renderBullet(context, b, loadedImages, false, 5));
            
            // Desenhar balas inimigas rotacionadas
            enemyBulletsRef.current.forEach(b => renderBullet(context, b, loadedImages, true, -63));
            
            // Explosões
            const activeExplosions = renderExplosions(context, explosionsRef.current, loadedImages);
            
            if(activeExplosions.length !== explosionsRef.current.length) {
                setExplosions(activeExplosions);
            }

            // --- Efeito de Level Up (degradê subindo) ---
            if (showLevelUp) {
                // O retângulo atravessa toda a tela - altura = tamanho da tela, percorre 2x para sair completamente
                const rectHeight = canvas.height; // Retângulo do tamanho da tela
                const yPosition = canvas.height - (levelUpProgress * canvas.height * 2); // Sobe 2x a altura para sair completamente
                
                const gradient = context.createLinearGradient(0, yPosition, 0, yPosition + rectHeight);
                
                // Cores do degradê (dourado/amarelo brilhante)
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                gradient.addColorStop(0.3, 'rgba(255, 255, 0, 0.6)');
                gradient.addColorStop(0.6, 'rgba(255, 165, 0, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                
                context.fillStyle = gradient;
                context.fillRect(0, yPosition, canvas.width, rectHeight);
                
                // Texto de "NOVA FASE" aparecendo enquanto o retângulo atravessa
                if (levelUpProgress > 0.15 && levelUpProgress < 0.75) {
                    const textAlpha = levelUpProgress < 0.35 
                        ? (levelUpProgress - 0.15) / 0.2  // Fade in
                        : levelUpProgress > 0.6 
                            ? (0.75 - levelUpProgress) / 0.15  // Fade out
                            : 1; // Totalmente visível no meio
                    
                    context.save();
                    context.globalAlpha = textAlpha;
                    context.fillStyle = 'white';
                    context.strokeStyle = 'rgba(255, 215, 0, 1)';
                    context.lineWidth = 4;
                    context.font = 'bold 48px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    
                    const text = 'NOVA FASE!';
                    context.strokeText(text, canvas.width / 2, canvas.height / 2);
                    context.fillText(text, canvas.width / 2, canvas.height / 2);
                    context.restore();
                }
            }

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, [loadedImages, isGameOver, setPlayer, setEnemy, speed, vibrateHit, vibrateDamage, showLevelUp, levelUpProgress]);

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
                        NOVA FASE
                    </div>
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
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

export default Jankenpo;
