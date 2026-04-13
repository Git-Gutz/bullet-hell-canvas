/**
 * ARCHIVO: assets/js/game.js
 * FASE: 16 (Persistencia de High Score y Game Feel Final)
 * PROYECTO: HELLFRAME - I.T. Pachuca
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
        
        // --- ESTADO DEL JUGADOR ---
        this.lives = 3;
        this.score = 0;
        
        // 🚩 FASE 16: Recuperamos el High Score de LocalStorage (Si no existe, es 0)
        this.highScore = parseInt(localStorage.getItem('hellframe_highscore')) || 0;
        
        // --- MODO DIOS (Cambiar a false para dificultad real) ---
        this.godMode = false; 

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
            
            if (window.Assets && window.Assets.isLoaded) {
                this.waveManager.startLevel(); 
            } else {
                console.error("ERROR CRÍTICO: Assets no cargados.");
                return;
            }
            
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    resetLevel() {
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];

        this.player.x = this.width / 2;
        this.player.y = this.height * 0.85;
        this.player.hasShield = false;
        this.player.isMultiShotActive = false;
        this.player.isLaserActive = false;
        
        this.lives = 3;
        this.score = 0;

        this.waveManager.startLevel();
        this.isPaused = false;
        this.updateUI();
    }

    returnToMenu() {
        this.isRunning = false;
        this.enemies = [];
        this.playerBullets = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.updateUI();
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
        if (!this.isRunning || this.isPaused) return;

        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.height) { s.y = 0; s.x = Math.random() * this.width; }
        });

        this.waveManager.update(deltaTime);
        this.player.update(this.input, deltaTime);
        
        this.playerBullets.forEach(b => b.update());
        this.enemyBullets.forEach(b => b.update());
        
        this.powerUps.forEach(pu => {
            pu.update();
            if (this.getDist(this.player, pu) < 40) {
                this.applyPowerUp(pu.type);
                pu.markedForDeletion = true;
            }
        });

        this.enemies.forEach(e => e.update(deltaTime));

        this.handleCollisions();
        this.resolveEnemyCollisions();

        this.playerBullets = this.playerBullets.filter(b => !b.markedForDeletion);
        this.enemyBullets = this.enemyBullets.filter(b => !b.markedForDeletion);
        this.powerUps = this.powerUps.filter(pu => !pu.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    }

    handleCollisions() {
        if (this.player.isLaserActive) {
            const lLeft = this.player.x - 15;
            const lRight = this.player.x + 15;

            this.enemies.forEach(e => {
                if (e.x + e.width/2 > lLeft && e.x - e.width/2 < lRight && e.y < this.player.y) {
                    e.hp -= 0.15;
                    if (e.hp <= 0 && !e.markedForDeletion) {
                        e.markedForDeletion = true;
                        this.addScore(e.scoreValue);
                        this.checkDrop(e);
                        
                        if (e.isBoss) {
                            if (window.triggerShake) window.triggerShake(25, 1200);
                            if (window.triggerFlash) window.triggerFlash('white', 600);
                            setTimeout(() => this.gameOver(true), 1000);
                        }
                    }
                }
            });
        }

        this.enemies.forEach(e => {
            this.playerBullets.forEach(b => {
                if (this.checkCollision(b, e)) {
                    b.markedForDeletion = true;
                    e.hp--;
                    if (e.hp <= 0 && !e.markedForDeletion) {
                        e.markedForDeletion = true;
                        this.addScore(e.scoreValue);
                        this.checkDrop(e);
                        
                        if (e.isBoss) {
                            if (window.triggerShake) window.triggerShake(25, 1200);
                            if (window.triggerFlash) window.triggerFlash('white', 600);
                            setTimeout(() => this.gameOver(true), 1000);
                        }
                    }
                }
            });
        });

        this.enemies.forEach(e => {
            if (this.getDist(this.player, e) < 40) this.handlePlayerHit(e);
        });
        this.enemyBullets.forEach(b => {
            if (this.getDist(this.player, b) < 30) this.handlePlayerHit(b);
        });
    }

    resolveEnemyCollisions() {
        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = i + 1; j < this.enemies.length; j++) {
                const e1 = this.enemies[i]; const e2 = this.enemies[j];
                const dx = e2.x - e1.x; const dy = e2.y - e1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = (e1.width / 2 + e2.width / 2) * 0.45;

                if (distance < minDistance && distance > 0) {
                    const nx = dx / distance; const ny = dy / distance;
                    const overlap = minDistance - distance;
                    if (!(e1.type === 'elite' || e1.isBoss)) { e1.x -= nx * (overlap * 0.05); }
                    if (!(e2.type === 'elite' || e2.isBoss)) { e2.x += nx * (overlap * 0.05); }
                }
            }
        }
    }

    checkDrop(enemy) {
        const roll = Math.random();
        if (enemy.type === 'drone') {
            if (roll < 0.5) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'shield'));
            else this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'multiShot'));
        } else if (roll < 0.1) {
            this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'bomb'));
        }
    }

    applyPowerUp(type) {
        if (type === 'shield') this.player.hasShield = true;
        if (type === 'multiShot') { this.player.isMultiShotActive = true; this.player.multiShotTimer = 5000; }
        if (type === 'bomb') {
            this.enemies.forEach(e => { if(!e.isBoss){ e.hp = 0; e.markedForDeletion = true; this.addScore(e.scoreValue); } });
            this.enemyBullets = [];
            if (window.triggerShake) window.triggerShake(10, 400); 
        }
    }

    handlePlayerHit(offender) {
        if (this.godMode) { offender.markedForDeletion = true; return; }
        offender.markedForDeletion = true;
        
        if (this.player.hasShield) { 
            this.player.takeDamage(true); 
            if (window.triggerShake) window.triggerShake(5, 100);
        } 
        else {
            this.lives--; 
            this.player.takeDamage(false);

            if (window.triggerShake) window.triggerShake(12, 300);
            if (window.triggerFlash) window.triggerFlash('red', 150);

            if (this.lives <= 0) this.gameOver(false);
        }
        this.updateUI();
    }

    addScore(pts) {
        this.score += pts;
        // 🚩 FASE 16: Actualizar y persistir el High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('hellframe_highscore', this.highScore);
        }
        this.updateUI();
    }

    updateUI() {
        const s = document.getElementById('ui-score');
        const l = document.getElementById('ui-lives');
        const lvl = document.getElementById('ui-level');
        const wv = document.getElementById('ui-wave');
        // 🚩 FASE 16: Si tienes un elemento para el High Score en el HTML, ponlo aquí
        const hs = document.getElementById('ui-highscore');

        if (s) s.textContent = this.score.toString().padStart(6, '0');
        if (hs) hs.textContent = this.highScore.toString().padStart(6, '0');
        if (l) l.textContent = '♥'.repeat(Math.max(0, this.lives));
        
        if (this.waveManager) {
            if (lvl) lvl.textContent = (this.waveManager.levelIndex + 1).toString().padStart(2, '0');
            if (wv) wv.textContent = (this.waveManager.waveIndex + 1).toString().padStart(2, '0');
        }
    }

    checkCollision(r, c) {
        return r.x - r.width/2 < c.x + c.width/2 && r.x + r.width/2 > c.x - c.width/2 &&
               r.y < c.y + c.height/2 && r.y + r.height > c.y - c.height/2;
    }

    getDist(o1, o2) { return Math.sqrt(Math.pow(o1.x-o2.x, 2) + Math.pow(o1.y-o2.y, 2)); }

    draw() {
        if (!this.isRunning && !this.isPaused) {
            this.ctx.fillStyle = '#0f1210';
            this.ctx.fillRect(0, 0, this.width, this.height);
            return;
        }

        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'rgba(255, 184, 0, 0.6)';
        this.stars.forEach(s => this.ctx.fillRect(s.x, s.y, s.size, s.size * 2));

        this.powerUps.forEach(pu => pu.draw(this.ctx));
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.player.draw(this.ctx);
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

    gameOver(victory) {
        this.isRunning = false;
        this.stop();

        const screenId = victory ? 'screen-victory' : 'screen-game-over';
        const scoreId = victory ? 'final-score-win' : 'final-score-lost';
        
        const scoreDisplay = document.getElementById(scoreId);
        if (scoreDisplay) scoreDisplay.textContent = this.score.toString().padStart(6, '0');
        
        const overlay = document.getElementById(screenId);
        if (overlay) overlay.classList.remove('hidden');

        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}