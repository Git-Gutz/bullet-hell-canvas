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
        this.playerBullets = [];
        this.player = new Player(this); 
        
        this.lives = 3;
        this.score = 0;
        
        // --- NUEVO: CARGAR HIGH SCORE DE LOCALSTORAGE ---
        this.highScore = localStorage.getItem('automata_highscore') || 0;
        
        this.enemies = []; 
        this.enemyTimer = 0;
        this.enemyInterval = 1500; 

        this.enemyBullets = [];

        this.stars = [];
        this.initBackground();
        
        // --- NUEVO: Actualizar UI al iniciar para mostrar el High Score ---
        this.updateUI();
    }

    initBackground() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2.5 + 0.5,
                speed: Math.random() * 3 + 1
            });
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            requestAnimationFrame((timestamp) => this.loop(timestamp));
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
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    update(deltaTime) {
        if (this.isPaused) return;

        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });

        this.player.update(this.input, deltaTime);

        // Actualizar Balas
        this.playerBullets.forEach(bullet => bullet.update());
        this.playerBullets = this.playerBullets.filter(bullet => !bullet.markedForDeletion);

        // Actualizar Balas Enemigas
        this.enemyBullets.forEach(bullet => bullet.update());
        this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.markedForDeletion);

        // Generar enemigos (Multidireccional)
        if (this.enemyTimer > this.enemyInterval) {
            let spawnSide = Math.floor(Math.random() * 3);
            let spawnX, spawnY, vx, vy;
            let baseSpeed = EnemyConfigs['grunt'].speed;

            if (spawnSide === 0) {
                spawnX = Math.random() * (this.width - 60) + 30;
                spawnY = -50;
                vx = 0;           
                vy = baseSpeed;
            } 
            else if (spawnSide === 1) {
                spawnX = -50;
                spawnY = Math.random() * (this.height * 0.5); 
                vx = baseSpeed * 0.8;  
                vy = baseSpeed * 0.6;  
            } 
            else {
                spawnX = this.width + 50;
                spawnY = Math.random() * (this.height * 0.5); 
                vx = -baseSpeed * 0.8; 
                vy = baseSpeed * 0.6;  
            }

            this.enemies.push(new Enemy(this, 'grunt', spawnX, spawnY, vx, vy));
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltaTime;
        }

        // Actualizar enemigos
        this.enemies.forEach(enemy => enemy.update(deltaTime));

        // Colisiones: Balas del Jugador vs Enemigos
        this.enemies.forEach(enemy => {
            this.playerBullets.forEach(bullet => {
                if (
                    bullet.x - bullet.width/2 < enemy.x + enemy.width/2 &&
                    bullet.x + bullet.width/2 > enemy.x - enemy.width/2 &&
                    bullet.y < enemy.y + enemy.height/2 &&
                    bullet.y + bullet.height > enemy.y - enemy.height/2
                ) {
                    bullet.markedForDeletion = true; 
                    enemy.hp--; 
                    
                    if (enemy.hp <= 0) {
                        enemy.markedForDeletion = true; 
                        // --- NUEVO: SUMAR PUNTOS AL DESTRUIR ---
                        this.addScore(enemy.scoreValue);
                    }
                }
            });
        });

        // Colisión: Enemigo Físico vs Jugador
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!this.player.isInvulnerable && distance < 40) {
                enemy.markedForDeletion = true;
                this.lives--;
                this.updateUI();
                
                this.player.isInvulnerable = true; 

                if (this.lives <= 0) {
                    this.stop();
                    alert("SISTEMA COLAPSADO - GAME OVER");
                    location.reload(); 
                }
            }
        });

        // Colisión: Balas Enemigas vs Jugador
        this.enemyBullets.forEach(bullet => {
            const dx = this.player.x - bullet.x;
            const dy = this.player.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!this.player.isInvulnerable && distance < 30) {
                bullet.markedForDeletion = true; 
                this.lives--;
                this.updateUI();
                
                this.player.isInvulnerable = true;

                if (this.lives <= 0) {
                    this.stop();
                    alert("SISTEMA COLAPSADO - GAME OVER");
                    location.reload(); 
                }
            }
        });

        // Limpiar enemigos muertos
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
    }

    draw() {
        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'rgba(255, 184, 0, 0.6)';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size * 2);
        });

        this.playerBullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.player.draw(this.ctx);

        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#3b8e88';
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SISTEMA EN PAUSA', this.width / 2, this.height / 2);
        }
    }

    // --- NUEVO: MÉTODO PARA AGREGAR PUNTOS Y GUARDAR HIGH SCORE ---
    addScore(points) {
        this.score += points;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('automata_highscore', this.highScore);
        }
        
        this.updateUI();
    }

    // --- ACTUALIZADO: REFLEJAR SCORE EN EL HTML ---
    updateUI() {
        const scoreElement = document.getElementById('ui-score');
        const highScoreElement = document.getElementById('ui-highscore');
        const livesElement = document.getElementById('ui-lives');

        if (scoreElement) {
            scoreElement.textContent = this.score.toString().padStart(6, '0');
        }
        if (highScoreElement) {
            // Asegurarse de que highScore sea tratado como string o número antes del padStart
            highScoreElement.textContent = Number(this.highScore).toString().padStart(6, '0');
        }
        if (livesElement) {
            livesElement.textContent = '♥'.repeat(this.lives);
        }
    }
}