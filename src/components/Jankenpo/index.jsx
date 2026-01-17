import React, { useRef, useEffect, useState } from 'react';
import './Jankenpo.css';

import stoneImgSrc from '/assets/1_pedra.png';
import paperImgSrc from '/assets/2_papel.png';
import scissorsImgSrc from '/assets/3_tesoura.png';
import explosionImgSrc from '/assets/explosao.png';

// Import the audio file
import explosionSoundSrc from '/assets/song/song-explosion.mp3';

// Função utilitária para facilitar
const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- NO MOMENTO DA COLISÃO ---
const handleCollisionVibration = (type) => {
  if (type === 'hit_enemy') {
    vibrate(40); // Explosão curta de sucesso
  } else if (type === 'player_damaged') {
    vibrate([100, 50, 100]); // Vibração dupla de erro/dano
  }
};

const Jankenpo = ({ handleBullet, player, setPlayer, enemy, setEnemy, setdisableButtonPlayer, setScene, handleGameEnd, gameDuration = 30, speed = 2, spawnInterval = 2000 }) => {
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

    // Audio ref


    // Helper functions
    const checkCollision = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

    const getResult = (playerChoice, enemyChoice) => {
        if (playerChoice === enemyChoice) return 'draw';
        if (
            (playerChoice === 'pedra' && enemyChoice === 'tesoura') ||
            (playerChoice === 'papel' && enemyChoice === 'pedra') ||
            (playerChoice === 'tesoura' && enemyChoice === 'papel')
        ) return 'win';
        return 'loss';
    };

    // Canvas resizing
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

    // Image loading
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

    // End game condition checker
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


    // Game Timer
     useEffect(() => {
        if (isGameOver || !loadedImages) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameOver, loadedImages]);


    // Enemy shooting logic
    useEffect(() => {
        if (isGameOver || !loadedImages || !canvasRef.current) return;

        const enemyShootInterval = setInterval(() => {
            setEnemyBullets(prevBullets => {
                const bulletTypes = ['pedra', 'papel', 'tesoura'];
                let newType;
                do {
                    newType = bulletTypes[Math.floor(Math.random() * bulletTypes.length)];
                } while (
                    prevBullets.length > 1 &&
                    prevBullets.slice(-2).every(b => b.type === newType)
                );
    
                const newBullet = {
                    type: newType,
                    x: canvasRef.current.width / 2 - 25,
                    y: 0, // spawn do inimigo
                    width: 50,
                    height: 50,
                    active: true,
                    id: Date.now(),
                    createdAt: performance.now(),
                    lastParticleY: 0
                };
                return [...prevBullets, newBullet];
            });
        }, spawnInterval);

        return () => clearInterval(enemyShootInterval);
    }, [isGameOver, loadedImages, spawnInterval]);

    // Player shooting logic
    useEffect(() => {
        if (isGameOver || !player.bulletType || !canvasRef.current) return;

        if (playerBullets.length < enemyBullets.length + 1) {
            const newBullet = {
                type: player.bulletType,
                x: canvasRef.current.width / 2 - 25,
                y: canvasRef.current.height - 120, //saida do bullet player
                width: 50,
                height: 50,
                active: true,
                id: Date.now(),
                createdAt: performance.now(),
                lastParticleY: canvasRef.current.height - 50
            };
            setPlayerBullets(prev => [...prev, newBullet]);
            handleBullet(null, 'player'); // Reset bullet type only after successfully shooting
        }
    }, [isGameOver, player.bulletType, playerBullets.length, enemyBullets.length, handleBullet]);
    
    // Refs for mutable game state
    const playerBulletsRef = useRef(playerBullets);
    playerBulletsRef.current = playerBullets;
    const enemyBulletsRef = useRef(enemyBullets);
    enemyBulletsRef.current = enemyBullets;
    const explosionsRef = useRef(explosions);
    explosionsRef.current = explosions;
    const particlesRef = useRef(particles);
    particlesRef.current = particles;
    
    // Disable player button
    useEffect(() => {
        setdisableButtonPlayer(playerBullets.length >= enemyBullets.length + 1 || isGameOver);
    }, [playerBullets, enemyBullets, setdisableButtonPlayer, isGameOver]);

    // Main game loop
    useEffect(() => {
        if (!loadedImages || isGameOver) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrameId;

        const update = () => {
            if(!canvas) return;
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Move and scale bullets
            const now = performance.now();
            const animationDuration = 200; // milliseconds

            playerBulletsRef.current.forEach(b => {
                b.y -= speed;
                const age = now - b.createdAt;
                const scale = Math.min(1, age / animationDuration);
                const currentSize = 50 * scale;

                // Adjust x to keep the bullet centered as it scales
                b.x = (canvas.width / 2) - (currentSize / 2);
                b.width = currentSize;
                b.height = currentSize;
            });

            enemyBulletsRef.current.forEach(b => {
                b.y += speed;
                const age = now - b.createdAt;
                const scale = Math.min(1, age / animationDuration);
                const currentSize = 50 * scale;

                // Adjust x to keep the bullet centered as it scales
                b.x = (canvas.width / 2) - (currentSize / 2);
                b.width = currentSize;
                b.height = currentSize;
            });

            // --- Collision Detection ---
            for (const pBullet of playerBulletsRef.current) {
                if (!pBullet.active) continue;

                for (const eBullet of enemyBulletsRef.current) {
                    if (!eBullet.active) continue;

                    if (checkCollision(pBullet, eBullet)) {
                        const result = getResult(pBullet.type, eBullet.type);
                        setExplosions(prev => [...prev, { x: pBullet.x, y: pBullet.y - 25, anim: 0, id: Date.now(), animCounter: 0, animDelay: 2 }]);
                        // Play explosion sound // 25 é a explosao pra frent do bullet do player
                        if (explosionAudioRef.current) {
                            explosionAudioRef.current.currentTime = 0; // Restart if already playing
                            explosionAudioRef.current.play().catch(e => console.error("Error playing sound:", e));
                        }

                        if (result === 'win') {
                            eBullet.active = false; // Enemy bullet destroyed
                            setStats(s => ({...s, wins: s.wins + 1}));
                            handleCollisionVibration('hit_enemy');
                        } else if (result === 'loss') {
                            pBullet.active = false; // Player bullet destroyed
                            setStats(s => ({...s, losses: s.losses + 1}));
                        } else { // draw
                            pBullet.active = false;
                            eBullet.active = false;
                            setStats(s => ({...s, draws: s.draws + 1}));
                        }
                        
                        // If player bullet was destroyed, no need to check it against other enemy bullets
                        if (!pBullet.active) {
                            break; 
                        }
                    }
                }
            }

            // --- Filtering and Boundary Checks ---
            const activePlayerBullets = [];
            playerBulletsRef.current.forEach(pBullet => {
                if (pBullet.active) {
                    if (pBullet.y < +30) { // Bullet has gone 100px off the top of the screen
                        pBullet.active = false; // Deactivate it
                        setEnemy(e => ({ ...e, hp: e.hp - player.atk })); // Enemy loses HP
                    } else {
                        activePlayerBullets.push(pBullet);
                    }
                }
            });

            const activeEnemyBullets = [];
            enemyBulletsRef.current.forEach(eBullet => {
                if (eBullet.active) {
                    if (eBullet.y > canvas.height - 100) { // Deactivate if it goes 100px off-screen
                        eBullet.active = false; // Deactivate if it goes off-screen
                        setPlayer(p => ({ ...p, hp: p.hp - enemy.atk }));
                        handleCollisionVibration('player_damaged');
                        setExplosions(prev => [...prev, { x: eBullet.x, y: eBullet.y - 50, anim: 0, id: Date.now(), animCounter: 0, animDelay: 2 }]);
                    } else {
                        activeEnemyBullets.push(eBullet);
                    }
                }
            });


            // Trigger re-render if bullet counts change
            if (activePlayerBullets.length !== playerBulletsRef.current.length) {
                setPlayerBullets(activePlayerBullets);
            }
            if (activeEnemyBullets.length !== enemyBulletsRef.current.length) {
                setEnemyBullets(activeEnemyBullets);
            }

            // --- Particle System ---
            const particleNow = performance.now();

            // Spawn new particles
            const spawnParticlesForBullet = (bullet) => {
                const dist = Math.abs(bullet.y - bullet.lastParticleY);
                if (dist > 20) {
                    particlesRef.current.push({
                        x: bullet.x + bullet.width / 2,
                        y: bullet.y + bullet.height / 2,
                        createdAt: particleNow,
                        id: Math.random()
                    });
                    bullet.lastParticleY = bullet.y;
                }
            };
            playerBulletsRef.current.forEach(spawnParticlesForBullet);
            enemyBulletsRef.current.forEach(spawnParticlesForBullet);

            // Update and draw particles
            const activeParticles = [];
            particlesRef.current.forEach(p => {
                const life = (particleNow - p.createdAt) / 500; // 0 -> 1
                if (life < 1) {
                    activeParticles.push(p);

                    const scale = 1 - life;
                    const size = (50 / 2) * scale; // 50 is bullet size

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


            // --- Drawing ---
            playerBulletsRef.current.forEach(b => context.drawImage(loadedImages[b.type], b.x, b.y, b.width, b.height));
            
            // Draw enemy bullets rotated
            enemyBulletsRef.current.forEach(b => {
                context.save(); // Save the current state
                // Translate to the center of the image
                context.translate(b.x + b.width / 2, b.y + b.height / 2);
                context.rotate(Math.PI); // Rotate 180 degrees
                // Draw the image, adjusting coordinates because of the translation
                context.drawImage(loadedImages[b.type], -b.width / 2, -b.height / 2, b.width, b.height);
                context.restore(); // Restore the state
            });
            
            // Explosions
            const activeExplosions = [];
            explosionsRef.current.forEach(exp => {
                if (exp.anim < 9) { // 9 frames for a 3x3 grid
                    const frameWidth = loadedImages['explosao'].width / 3;
                    const frameHeight = loadedImages['explosao'].height / 3;
                    
                    const frame = exp.anim;
                    const sx = (frame % 3) * frameWidth;
                    const sy = Math.floor(frame / 3) * frameHeight;

                    context.drawImage(
                        loadedImages['explosao'],
                        sx, sy, frameWidth, frameHeight, // Source rectangle
                        exp.x, exp.y, 50, 50              // Destination rectangle
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
            <div style={{position: 'absolute', display:'flex', flexDirection: 'column',top: 24, left: 10, color: 'black', padding: 5, borderRadius: 5}}>
                <div>Time: {timeLeft}</div>
                <div>Wins: {stats.wins} </div>
                <div>Losses: {stats.losses}</div>
                <div>Draws: {stats.draws}</div>
            </div>
            <canvas ref={canvasRef} />
            
        </div>
    );
};

export default Jankenpo;
