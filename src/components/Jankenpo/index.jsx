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
    gameDuration = DEFAULT_GAME_CONFIG.GAME_DURATION, 
    speed = DEFAULT_GAME_CONFIG.BULLET_SPEED, 
    spawnInterval = DEFAULT_GAME_CONFIG.SPAWN_INTERVAL,
    roomLevel = 1, // Nível da fase atual
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
    const [timeLeft, setTimeLeft] = useState(gameDuration);
    const [loadedImages, setLoadedImages] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gold, setGold] = useState(0); // Estado para armazenar o gold acumulado
    const explosionAudioRef = useRef(new Audio(explosionSoundSrc));
    const { vibrateHit, vibrateDamage } = useVibration();

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
        if (isGameOver) return;

        if (player.hp <= 0 || timeLeft <= 0) {
            setIsGameOver(true);
            const finalResult = player.hp > 0 ? 'win' : 'loss';
            handleGameEnd({ ...stats, result: finalResult, gold });
        } else if (enemy.hp <= 0) {
            setIsGameOver(true);
            handleGameEnd({ ...stats, result: 'win', gold });
        }
    }, [player.hp, enemy.hp, timeLeft, isGameOver, handleGameEnd, stats]);


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
            setEnemyBullets(prevBullets => {
                const bulletTypes = Object.keys(BULLET_CONFIG);
                const newType = selectRandomBulletType(prevBullets, bulletTypes);
                const rarity = selectBulletRarity(enemyDropConfig);
                const newBullet = createBullet(
                    newType,
                    canvasRef.current.width / 2 - DEFAULT_GAME_CONFIG.BULLET_SIZE / 2,
                    0,
                    DEFAULT_GAME_CONFIG.BULLET_SIZE,
                    DEFAULT_GAME_CONFIG.BULLET_SIZE,
                    rarity,
                    roomLevel // Passa o nível da fase para cálculo de gold
                );
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
            
        </div>
    );
};

export default Jankenpo;
