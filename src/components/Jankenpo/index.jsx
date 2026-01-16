import React, { useRef, useEffect, useState } from 'react';
import './Jankenpo.css';

import stoneImgSrc from '/assets/1_pedra.png';
import paperImgSrc from '/assets/2_papel.png';
import scissorsImgSrc from '/assets/3_tesoura.png';
import explosionImgSrc from '/assets/explosao.gif';

const Jankenpo = ({ handleBullet, player, setPlayer, enemy, setEnemy, setdisableButtonPlayer, setScene, handleGameEnd, gameDuraction = 30 }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null); // Ref for the container
    const [enemyBullets, setEnemyBullets] = useState([]);
    const [playerBullets, setPlayerBullets] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [timeLeft, setTimeLeft] = useState(gameDuraction);
    const [loadedImages, setLoadedImages] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);

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
        // ... (image loading logic remains the same)
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
        }
    }, [player.hp, timeLeft, isGameOver, handleGameEnd, stats]);


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
                    y: 0,
                    width: 50,
                    height: 50,
                    active: true,
                    id: Date.now()
                };
                return [...prevBullets, newBullet];
            });
        }, 2000);

        return () => clearInterval(enemyShootInterval);
    }, [isGameOver, loadedImages]);

    // Player shooting logic
    useEffect(() => {
        if (isGameOver || !player.bulletType || !canvasRef.current) return;

        if (playerBullets.length < enemyBullets.length) {
            const newBullet = {
                type: player.bulletType,
                x: canvasRef.current.width / 2 - 25,
                y: canvasRef.current.height - 50,
                width: 50,
                height: 50,
                active: true,
                id: Date.now()
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
    
    // Disable player button
    useEffect(() => {
        setdisableButtonPlayer(playerBullets.length >= enemyBullets.length || isGameOver);
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

            // Move bullets by mutating refs
            playerBulletsRef.current.forEach(b => b.y -= 5);
            enemyBulletsRef.current.forEach(b => b.y += 5);

            // --- Collision Detection ---
            for (const pBullet of playerBulletsRef.current) {
                if (!pBullet.active) continue;

                for (const eBullet of enemyBulletsRef.current) {
                    if (!eBullet.active) continue;

                    if (checkCollision(pBullet, eBullet)) {
                        const result = getResult(pBullet.type, eBullet.type);
                        setExplosions(prev => [...prev, { x: pBullet.x, y: pBullet.y, anim: 0, id: Date.now() }]);

                        if (result === 'win') {
                            eBullet.active = false; // Enemy bullet destroyed
                            setStats(s => ({...s, wins: s.wins + 1}));
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
            const activePlayerBullets = playerBulletsRef.current.filter(b => b.active && b.y > -50);

            const activeEnemyBullets = [];
            enemyBulletsRef.current.forEach(eBullet => {
                if (eBullet.active) {
                    if (eBullet.y > canvas.height) {
                        eBullet.active = false; // Deactivate if it goes off-screen
                        setPlayer(p => ({ ...p, hp: p.hp - enemy.atk }));
                        setExplosions(prev => [...prev, { x: eBullet.x, y: eBullet.y - 50, anim: 0, id: Date.now() }]);
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

            // --- Drawing ---
            playerBulletsRef.current.forEach(b => context.drawImage(loadedImages[b.type], b.x, b.y, b.width, b.height));
            enemyBulletsRef.current.forEach(b => context.drawImage(loadedImages[b.type], b.x, b.y, b.width, b.height));
            
            // Explosions
            const activeExplosions = [];
            explosionsRef.current.forEach(exp => {
                if (exp.anim < 20) {
                    context.drawImage(loadedImages['explosao'], exp.x, exp.y, 50, 50);
                    exp.anim++;
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
    }, [loadedImages, isGameOver, enemy.atk, setPlayer]);


    const checkCollision = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

    const getResult = (playerChoice, enemyChoice) => {
        if (playerChoice === enemyChoice) return 'draw';
        if (
            (playerChoice === 'pedra' && enemyChoice === 'tesoura') ||
            (playerChoice === 'papel' && enemyChoice === 'pedra') ||
            (playerChoice === 'tesoura' && enemyChoice === 'papel')
        ) return 'win';
        return 'loss';
    }


    return (
        <div ref={containerRef} className="canvas-container">
            <canvas ref={canvasRef} />
            <div style={{position: 'absolute', top: 10, left: 10, color: 'black', backgroundColor: 'rgba(255,255,255,0.5)', padding: 5, borderRadius: 5}}>
                Time: {timeLeft} | Wins: {stats.wins} | Losses: {stats.losses} | Draws: {stats.draws}
            </div>
        </div>
    );
};

export default Jankenpo;
