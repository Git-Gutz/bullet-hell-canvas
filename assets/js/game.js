/**
 * ARCHIVO: assets/js/game.js
 * FASE: 11 (Coordinación de Hordas, God Mode y Anti-Encimamiento)
 * PROYECTO: Automata Hell - I.T. Pachuca
 */

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;

        this.input = new InputHandler(this.canvas);
        this.player = new Player(this); 
        
        // --- ESTADO Y MODO DE PRUEBAS ---
        this.lives = 3;
        this.score = 0;
        this.highScore = localStorage.getItem('automata_highscore') || 0;
        
        /** * 🛡️ MODO DIOS (GOD MODE)
         * Cambia a 'false' para activar la dificultad real del juego.
         */
        this.godMode = true; 

        // --- POOLS DE ENTIDADES ---
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemies = []; 
        this.powerUps = []; 

        // --- SISTEMA DE OLEADAS ---
        this.waveManager = new WaveManager(this);

        this.stars = [];
        this.initBackground();
        this.updateUI();
    }

    initBackground() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2,
                speed: Math.random() * 3 + 1
            });
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            
            // REGLA DE ORO 4: Solo inicia si los assets están en memoria
            if (window.Assets && window.Assets.isLoaded) {
                this.waveManager.startLevel(); 
            } else {
                console.error("ERROR CRÍTICO: Assets no cargados. Abortando inicio.");
                return;
            }
            
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        let deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaTime) {
        if (this.isPaused) return;

        // 1. Fondo (Parallax)
        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.height) { s.y = 0; s.x = Math.random() * this.width; }
        });

        // 2. Control de Oleadas
        this.waveManager.update(deltaTime);

        // 3. Jugador y Proyectiles
        this.player.update(this.input, deltaTime);
        this.playerBullets.forEach(b => b.update());
        this.enemyBullets.forEach(b => b.update());
        
        // 4. Power-Ups
        this.powerUps.forEach(pu => {
            pu.update();
            if (this.getDist(this.player, pu) < 40) {
                this.applyPowerUp(pu.type);
                pu.markedForDeletion = true;
            }
        });

        // 5. Enemigos Autónomos
        this.enemies.forEach(e => e.update(deltaTime));

        // 6. Colisiones y Resolución de Físicas
        this.handleCollisions();
        this.resolveEnemyCollisions(); // <--- SISTEMA ANTI-ENCIMAMIENTO APLICADO AQUÍ

        // 7. Garbage Collection (Filtro de borrado)
        this.playerBullets = this.playerBullets.filter(b => !b.markedForDeletion);
        this.enemyBullets = this.enemyBullets.filter(b => !b.markedForDeletion);
        this.powerUps = this.powerUps.filter(pu => !pu.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    }

    handleCollisions() {
        // Colisiones Láser
        if (this.player.isLaserActive) {
            const lLeft = this.player.x - 15;
            const lRight = this.player.x + 15;
            this.enemies.forEach(e => {
                if (e.x + e.width/2 > lLeft && e.x - e.width/2 < lRight && e.y < this.player.y) {
                    e.hp -= 0.5;
                    if (e.hp <= 0 && !e.markedForDeletion) {
                        e.markedForDeletion = true;
                        this.addScore(e.scoreValue);
                    }
                }
            });
        }

        // Balas Jugador vs Enemigos
        this.enemies.forEach(e => {
            this.playerBullets.forEach(b => {
                if (this.checkCollision(b, e)) {
                    b.markedForDeletion = true;
                    e.hp--;
                    if (e.hp <= 0 && !e.markedForDeletion) {
                        e.markedForDeletion = true;
                        this.addScore(e.scoreValue);
                        this.checkDrop(e);
                    }
                }
            });
        });

        // Daño al Jugador (Afectado por God Mode)
        this.enemies.forEach(e => {
            if (this.getDist(this.player, e) < 40) this.handlePlayerHit(e);
        });
        this.enemyBullets.forEach(b => {
            if (this.getDist(this.player, b) < 30) this.handlePlayerHit(b);
        });
    }

    // --- NUEVO: SISTEMA ANTI-ENCIMAMIENTO ---
    // --- SISTEMA ANTI-ENCIMAMIENTO (PULIDO) ---
    resolveEnemyCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = i + 1; j < this.enemies.length; j++) {
                const e1 = this.enemies[i];
                const e2 = this.enemies[j];

                const dx = e2.x - e1.x;
                const dy = e2.y - e1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 1. RADIO FANTASMA: Usamos solo el 45% de su tamaño (antes 80%)
                // Así solo se empujan si sus "núcleos" se tocan, permitiendo que las alas se crucen visualmente.
                const minDistance = (e1.width / 2 + e2.width / 2) * 0.45;

                if (distance < minDistance && distance > 0) {
                    const overlap = minDistance - distance;
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // 2. EMPUJE SUAVE: Reducimos drásticamente la fuerza (de 0.5 a 0.05)
                    // Esto crea un efecto de "deslizamiento" fluido en lugar de un rebote violento.
                    const pushForce = 0.05; 
                    const pushX = nx * (overlap * pushForce);
                    const pushY = ny * (overlap * pushForce);

                    // 3. SISTEMA DE MASA: Un Grunt no puede empujar a un Elite/Boss
                    const e1IsHeavy = e1.type === 'elite' || e1.isBoss;
                    const e2IsHeavy = e2.type === 'elite' || e2.isBoss;

                    // Aplicar empuje al enemigo 1 (solo si no es pesado)
                    if (!e1IsHeavy) {
                        if (e1.dynamicCenterX !== undefined) {
                            e1.dynamicCenterX -= pushX;
                        } else {
                            e1.x -= pushX;
                        }
                        e1.y -= pushY * 0.1; // Apenas tocamos el eje Y para no frenarlos
                    }

                    // Aplicar empuje al enemigo 2 (solo si no es pesado)
                    if (!e2IsHeavy) {
                        if (e2.dynamicCenterX !== undefined) {
                            e2.dynamicCenterX += pushX;
                        } else {
                            e2.x += pushX;
                        }
                        e2.y += pushY * 0.1;
                    }
                }
            }
        }
    }

   checkDrop(enemy) {
        // --- NUEVO: Lógica Exclusiva para Drones de Soporte ---
        if (enemy.type === 'drone') {
            const roll = Math.random();
            // 50% Escudo, 40% MultiShot, 10% Bomba
            if (roll < 0.50) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'shield'));
            else if (roll < 0.90) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'multiShot'));
            else this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'bomb'));
            
            return; // Detenemos la función aquí para que no use la lógica normal
        }

        // --- Lógica normal para el resto de enemigos ---
        const roll = Math.random();
        if (roll < 0.20) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'multiShot'));
        else if (roll < 0.35) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'shield'));
        else if (roll < 0.45) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'bomb'));
    }

    applyPowerUp(type) {
        if (type === 'shield') this.player.hasShield = true;
        if (type === 'multiShot') { this.player.isMultiShotActive = true; this.player.multiShotTimer = 5000; }
        if (type === 'bomb') {
            // --- NUEVO: La Bomba mata a todos MENOS al Jefe ---
            this.enemies.forEach(e => { 
                if (!e.isBoss) { // 🛡️ CRÍTICO: Si no es el jefe, lo destruye
                    e.hp = 0; 
                    e.markedForDeletion = true; 
                    this.addScore(e.scoreValue); 
                }
            });
            // Limpiamos absolutamente todas las balas enemigas de la pantalla
            this.enemyBullets = [];
        }
    }

    handlePlayerHit(offender) {
        // --- LÓGICA DE PRUEBAS: INMORTALIDAD ---
        if (this.godMode) {
            offender.markedForDeletion = true; 
            console.log("God Mode: Impacto neutralizado.");
            return; 
        }

        // --- LÓGICA DE JUEGO REAL ---
        offender.markedForDeletion = true;
        if (this.player.hasShield) {
            this.player.takeDamage(true); 
        } else {
            this.lives--;
            this.player.takeDamage(false); 
            if (this.lives <= 0) {
                this.stop();
                alert("SISTEMA COLAPSADO - GAME OVER");
                location.reload();
            }
        }
        this.updateUI();
    }

    addScore(pts) {
        this.score += pts;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('automata_highscore', this.highScore);
        }
        this.updateUI();
    }
updateUI() {
        const s = document.getElementById('ui-score');
        const h = document.getElementById('ui-highscore');
        const l = document.getElementById('ui-lives');
        
        // --- NUEVOS ELEMENTOS DEL HUD ---
        const lvl = document.getElementById('ui-level');
        const wv = document.getElementById('ui-wave');

        if (s) s.textContent = this.score.toString().padStart(6, '0');
        if (h) h.textContent = Number(this.highScore).toString().padStart(6, '0');
        if (l) l.textContent = '♥'.repeat(this.lives);

        // Actualizamos el Nivel y la Horda dinámicamente
        if (this.waveManager) {
            if (lvl) lvl.textContent = (this.waveManager.levelIndex + 1).toString().padStart(2, '0');
            
            // Para la horda, también sumamos 1
            if (wv) wv.textContent = (this.waveManager.waveIndex + 1).toString().padStart(2, '0');
        }
    }

    checkCollision(r, c) {
        return r.x - r.width/2 < c.x + c.width/2 && r.x + r.width/2 > c.x - c.width/2 &&
               r.y < c.y + c.height/2 && r.y + r.height > c.y - c.height/2;
    }

    getDist(o1, o2) { return Math.sqrt(Math.pow(o1.x-o2.x, 2) + Math.pow(o1.y-o2.y, 2)); }

    draw() {
        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Estrellas
        this.ctx.fillStyle = 'rgba(255, 184, 0, 0.6)';
        this.stars.forEach(s => this.ctx.fillRect(s.x, s.y, s.size, s.size * 2));

        // Entidades
        this.powerUps.forEach(pu => pu.draw(this.ctx));
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.player.draw(this.ctx);

        // UI de Oleadas
        this.waveManager.draw(this.ctx);

        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#3b8e88';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SISTEMA EN PAUSA', this.width / 2, this.height / 2);
        }
    }
}