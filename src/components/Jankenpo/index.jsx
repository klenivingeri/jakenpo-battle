import React, { useRef, useEffect, useState } from 'react';
import './Jankenpo.css';
import { useVibration } from '../../hooks/useVibration';
import { GameStats } from '../shared/GameStats';
import { BULLET_CONFIG, GAME_IMAGES, GAME_SOUNDS, DEFAULT_GAME_CONFIG } from '../../constants/gameConfig';
import {
  checkCollision,
  getGameResult,
  selectRandomBulletType,
  createBullet,
  updateBulletTransform,
  createParticle,
  createExplosion
} from '../../utils/gameUtils';

// Importação das imagens
import stoneImgSrc from '/assets/1_pedra.png';
import paperImgSrc from '/assets/2_papel.png';
import scissorsImgSrc from '/assets/3_tesoura.png';
import explosionImgSrc from '/assets/explosao.png';
import explosionSoundSrc from '/assets/song/song-explosion.mp3';

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
    spawnInterval = DEFAULT_GAME_CONFIG.SPAWN_INTERVAL 
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
        const images = {
            'pedra': stoneImgSrc,
            'papel': paperImgSrc,
            'tesoura': scissorsImgSrc,
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
            handleGameEnd({ ...stats, result: finalResult });
        } else if (enemy.hp <= 0) {
            setIsGameOver(true);
            handleGameEnd({ ...stats, result: 'win' });
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
                const newBullet = createBullet(
                    newType,
                    canvasRef.current.width / 2 - DEFAULT_GAME_CONFIG.BULLET_SIZE / 2,
                    0,
                    DEFAULT_GAME_CONFIG.BULLET_SIZE,
                    DEFAULT_GAME_CONFIG.BULLET_SIZE
                );
                return [...prevBullets, newBullet];
            });
        }, spawnInterval);

        return () => clearInterval(enemyShootInterval);
    }, [isGameOver, loadedImages, spawnInterval]);

    // Lógica de disparo do jogador
    useEffect(() => {
        if (isGameOver || !player.bulletType || !canvasRef.current) return;

        if (playerBullets.length < enemyBullets.length + 1) {
            const newBullet = createBullet(
                player.bulletType,
                canvasRef.current.width / 2 - DEFAULT_GAME_CONFIG.BULLET_SIZE / 2,
                canvasRef.current.height - 30,
                DEFAULT_GAME_CONFIG.BULLET_SIZE,
                DEFAULT_GAME_CONFIG.BULLET_SIZE
            );
            newBullet.lastParticleY = canvasRef.current.height - 50;
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

            playerBulletsRef.current.forEach(b => {
                updateBulletTransform(b, -speed, now, canvas.width, DEFAULT_GAME_CONFIG.ANIMATION_DURATION);
            });

            enemyBulletsRef.current.forEach(b => {
                updateBulletTransform(b, speed, now, canvas.width, DEFAULT_GAME_CONFIG.ANIMATION_DURATION);
            });

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

                        if (result === 'win') {
                            eBullet.active = false;
                            setStats(s => ({...s, wins: s.wins + 1}));
                            vibrateHit();
                        } else if (result === 'loss') {
                            pBullet.active = false;
                            setStats(s => ({...s, losses: s.losses + 1}));
                        } else {
                            pBullet.active = false;
                            eBullet.active = false;
                            setStats(s => ({...s, draws: s.draws + 1}));
                        }
                        
                        // Se a bala do jogador foi destruída, não é necessário verificar contra outras balas inimigas
                        if (!pBullet.active) {
                            break; 
                        }
                    }
                }
            }

            // --- Filtragem e Verificação de Limites ---
            const activePlayerBullets = [];
            playerBulletsRef.current.forEach(pBullet => {
                if (pBullet.active) {
                    if (pBullet.y < +10) { // A bala saiu 100px do topo da tela
                        pBullet.active = false; // Desativar a bala
                        setExplosions(prev => [...prev, createExplosion(pBullet.x, pBullet.y - 10)]); // Criar explosão um pouco mais abaixo
                        setEnemy(e => ({ ...e, hp: e.hp - player.atk })); // O inimigo perde HP
                    } else {
                        activePlayerBullets.push(pBullet);
                    }
                }
            });

            const activeEnemyBullets = [];
            enemyBulletsRef.current.forEach(eBullet => {
                if (eBullet.active) {
                    if (eBullet.y > canvas.height - 10) {
                        eBullet.active = false;
                        setPlayer(p => ({ ...p, hp: p.hp - enemy.atk }));
                        vibrateDamage();
                        setExplosions(prev => [...prev, createExplosion(eBullet.x, eBullet.y - 40)]);
                    } else {
                        activeEnemyBullets.push(eBullet);
                    }
                }
            });


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
            const spawnParticlesForBullet = (bullet) => {
                const dist = Math.abs(bullet.y - bullet.lastParticleY);
                if (dist > DEFAULT_GAME_CONFIG.PARTICLE_SPAWN_DISTANCE) {
                    particlesRef.current.push(
                        createParticle(
                            bullet.x + bullet.width / 2,
                            bullet.y + bullet.height / 2
                        )
                    );
                    bullet.lastParticleY = bullet.y;
                }
            };
            playerBulletsRef.current.forEach(spawnParticlesForBullet);
            enemyBulletsRef.current.forEach(spawnParticlesForBullet);

            // Atualizar e desenhar partículas
            const activeParticles = [];
            particlesRef.current.forEach(p => {
                const life = (particleNow - p.createdAt) / DEFAULT_GAME_CONFIG.PARTICLE_LIFETIME;
                if (life < 1) {
                    activeParticles.push(p);

                    const scale = 1 - life;
                    const size = (50 / 2) * scale; // 50 é o tamanho da bala

                    context.globalAlpha = 1 - life;
                    context.fillStyle = 'white';

                    context.fillRect(
                        p.x - size / 2,
                        p.y - size / 2,
                        size,
                        size
                    );
                }
            });
            context.globalAlpha = 1;

            if (activeParticles.length !== particlesRef.current.length) {
                setParticles(activeParticles);
            }


            // --- Desenho ---
            playerBulletsRef.current.forEach(b => context.drawImage(loadedImages[b.type], b.x, b.y, b.width, b.height));
            
            // Desenhar balas inimigas rotacionadas
            enemyBulletsRef.current.forEach(b => {
                context.save(); // Salvar o estado atual
                // Transladar para o centro da imagem
                context.translate(b.x + b.width / 2, b.y + b.height / 2);
                context.rotate(Math.PI); // Rotacionar 180 graus
                // Desenhar a imagem, ajustando as coordenadas devido à translação
                context.drawImage(loadedImages[b.type], -b.width / 2, -b.height / 2, b.width, b.height);
                context.restore(); // Restaurar o estado
            });
            
            // Explosões
            const activeExplosions = [];
            explosionsRef.current.forEach(exp => {
                if (exp.anim < 9) { // 9 quadros para uma grade 3x3
                    const frameWidth = loadedImages['explosao'].width / 3;
                    const frameHeight = loadedImages['explosao'].height / 3;
                    
                    const frame = exp.anim;
                    const sx = (frame % 3) * frameWidth;
                    const sy = Math.floor(frame / 3) * frameHeight;

                    context.drawImage(
                        loadedImages['explosao'],
                        sx, sy, frameWidth, frameHeight, // Retângulo de origem
                        exp.x, exp.y, 50, 50              // Retângulo de destino
                    );

                    exp.animCounter++;
                    if (exp.animCounter >= exp.animDelay) {
                        exp.anim++;
                        exp.animCounter = 0;
                    }
                    activeExplosions.push(exp);
                }
            });
            if(activeExplosions.length !== explosionsRef.current.length) {
                setExplosions(activeExplosions);
            }

            animationFrameId = requestAnimationFrame(update);
        };

        animationFrameId = requestAnimationFrame(update);

        return () => cancelAnimationFrame(animationFrameId);
    }, [loadedImages, isGameOver, enemy.atk, setPlayer, setEnemy, player.atk, speed]);

    return (
        <div ref={containerRef} className="canvas-container">
            <GameStats 
                timeLeft={timeLeft}
                wins={stats.wins}
                losses={stats.losses}
                draws={stats.draws}
            />
            <canvas ref={canvasRef} />
            
        </div>
    );
};

export default Jankenpo;
