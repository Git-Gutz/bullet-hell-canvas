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
        this.lives = 3;
        this.score = 0;
        this.highScore = localStorage.getItem('automata_highscore') || 0;
        
        this.playerBullets = [];
        this.enemyBullets = [];
        this.enemies = []; 
        this.powerUps = []; 

        this.enemyTimer = 0;
        this.enemyInterval = 1500; 

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
            requestAnimationFrame((t) => this.loop(t));
        }
    }
togglePause() {
        this.isPaused = !this.isPaused;
    }

    stop() {
        this.isRunning = false;
    }
    // --------------------------------------------
    
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

        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.height) { s.y = 0; s.x = Math.random() * this.width; }
        });

        this.player.update(this.input, deltaTime);
        this.playerBullets.forEach(b => b.update());
        this.enemyBullets.forEach(b => b.update());
        this.playerBullets = this.playerBullets.filter(b => !b.markedForDeletion);
        this.enemyBullets = this.enemyBullets.filter(b => !b.markedForDeletion);

        this.powerUps.forEach(pu => {
            pu.update();
            const dx = this.player.x - pu.x;
            const dy = this.player.y - pu.y;
            if (Math.sqrt(dx*dx + dy*dy) < 40) {
                this.applyPowerUp(pu.type);
                pu.markedForDeletion = true;
            }
        });
        this.powerUps = this.powerUps.filter(pu => !pu.markedForDeletion);

        if (this.enemyTimer > this.enemyInterval) {
            this.spawnRandomEnemy();
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltaTime;
        }

        this.enemies.forEach(e => e.update(deltaTime));

        // Colisiones Láser
        if (this.player.isLaserActive) {
            const lLeft = this.player.x - 15;
            const lRight = this.player.x + 15;
            this.enemyBullets.forEach(b => {
                if (b.x > lLeft && b.x < lRight && b.y < this.player.y) b.markedForDeletion = true;
            });
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
                    if (e.hp <= 0) {
                        e.markedForDeletion = true;
                        this.addScore(e.scoreValue);
                        this.checkDrop(e);
                    }
                }
            });
        });

        // Daño Jugador
        if (!this.player.isInvulnerable) {
            this.enemies.forEach(e => {
                if (this.getDist(this.player, e) < 40) this.handlePlayerHit(e);
            });
            this.enemyBullets.forEach(b => {
                if (this.getDist(this.player, b) < 30) this.handlePlayerHit(b);
            });
        }

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
    }

    spawnRandomEnemy() {
        const types = Object.keys(EnemyConfigs);
        const type = types[Math.floor(Math.random() * types.length)];
        let side = Math.floor(Math.random() * 3); 
        let sx, sy, vx, vy;
        let speed = EnemyConfigs[type].speed;

        if (side === 0) { sx = Math.random() * (this.width - 100) + 50; sy = -50; vx = 0; vy = speed; }
        else if (side === 1) { sx = -50; sy = Math.random() * (this.height * 0.4); vx = speed * 0.8; vy = speed * 0.5; }
        else { sx = this.width + 50; sy = Math.random() * (this.height * 0.4); vx = -speed * 0.8; vy = speed * 0.5; }

        this.enemies.push(new Enemy(this, type, sx, sy, vx, vy));
    }

    checkDrop(enemy) {
        const roll = Math.random();
        if (roll < 0.25) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'multiShot'));
        else if (roll < 0.50) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'shield'));
        else if (roll < 0.60) this.powerUps.push(new PowerUp(this, enemy.x, enemy.y, 'bomb'));
    }

    applyPowerUp(type) {
        if (type === 'shield') this.player.hasShield = true;
        if (type === 'multiShot') { this.player.isMultiShotActive = true; this.player.multiShotTimer = 5000; }
        if (type === 'bomb') {
            this.enemies.forEach(e => { e.hp = 0; e.markedForDeletion = true; this.addScore(e.scoreValue); });
            this.enemyBullets = [];
        }
    }

    handlePlayerHit(offender) {
        offender.markedForDeletion = true;
        if (this.player.hasShield) this.player.takeDamage(true);
        else {
            this.lives--;
            this.player.takeDamage(false);
            if (this.lives <= 0) { this.stop(); alert("GAME OVER"); location.reload(); }
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
        if (s) s.textContent = this.score.toString().padStart(6, '0');
        if (h) h.textContent = Number(this.highScore).toString().padStart(6, '0');
        if (l) l.textContent = '♥'.repeat(this.lives);
    }

    checkCollision(r, c) {
        return r.x - r.width/2 < c.x + c.width/2 && r.x + r.width/2 > c.x - c.width/2 &&
               r.y < c.y + c.height/2 && r.y + r.height > c.y - c.height/2;
    }

    getDist(o1, o2) { return Math.sqrt(Math.pow(o1.x-o2.x, 2) + Math.pow(o1.y-o2.y, 2)); }

    draw() {
        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'rgba(255, 184, 0, 0.6)';
        this.stars.forEach(s => this.ctx.fillRect(s.x, s.y, s.size, s.size * 2));
        this.powerUps.forEach(pu => pu.draw(this.ctx));
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.player.draw(this.ctx);
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