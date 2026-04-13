/**
 * ARCHIVO: assets/js/entities/waveManager.js
 * FASE: 18 (Mecánica de Restauración de Integridad)
 * PROYECTO: HELLFRAME - I.T. Pachuca
 */

class WaveManager {
    constructor(game) {
        this.game = game;
        this.levelIndex = 0;
        this.waveIndex = 0;
        
        this.currentWave = null; 
        
        this.state = 'TRANSITION'; 
        this.timer = 0;
        this.message = '';
        
        this.pendingSpawns = []; 
        this.spawnTimer = 0;
        this.currentInterval = 2000; 
        this.eliteSpawned = false;
    }

    get levelConfig() {
        return LevelConfigs[this.levelIndex];
    }

    /**
     * Inicializa un nivel y restablece los parámetros de combate.
     */
    startLevel() {
        this.message = this.levelConfig.name;
        this.state = 'TRANSITION';
        this.timer = 0;
        this.waveIndex = 0;
        this.currentWave = null;
        this.eliteSpawned = false;
        this.game.enemies = []; 
        
        // 🚩 MECÁNICA: Restablecer vidas al iniciar/pasar nivel
        this.game.lives = 3; 
        
        // Sincronizamos la interfaz para mostrar los corazones restaurados
        this.game.updateUI();
    }

    goToLevel(index) {
        if (index >= 0 && index < LevelConfigs.length) {
            this.levelIndex = index;
            this.startLevel();
        }
    }

    prepareWave() {
        this.pendingSpawns = [];
        const waveKey = this.levelConfig.waves[this.waveIndex];
        this.currentWave = WaveConfigs[waveKey]; 
        
        if (!this.currentWave) {
            console.error(`[ERROR] Configuración de horda no encontrada: ${waveKey}`);
            return;
        }

        this.currentWave.enemies.forEach(e => {
            for (let i = 0; i < e.count; i++) {
                this.pendingSpawns.push(e.type);
            }
        });

        this.pendingSpawns.sort(() => Math.random() - 0.5);
        this.spawnTimer = 0;
        this.currentInterval = this.currentWave.interval * 3.5; 
    }

    update(deltaTime) {
        if (this.state === 'TRANSITION') {
            this.timer += deltaTime;
            if (this.timer > 3000) { 
                this.state = 'WAVE';
                this.prepareWave();
            }
            return;
        }

        if (this.state === 'WAVE') {
            this.spawnTimer += deltaTime;

            if (this.pendingSpawns.length > 0) {
                if (this.spawnTimer > this.currentInterval) {
                    const squadSize = Math.min(Math.floor(Math.random() * 3) + 3, this.pendingSpawns.length);
                    const squad = this.pendingSpawns.splice(0, squadSize);
                    
                    this.spawnFormation(squad);
                    this.spawnTimer = 0;
                    
                    if (this.currentWave) {
                        this.currentInterval = (this.currentWave.interval * 3) + (Math.random() * 1000);
                    }
                }
            } 
            else if (this.game.enemies.length === 0) {
                this.waveIndex++;
                this.game.updateUI();
                
                if (this.waveIndex < this.levelConfig.waves.length) {
                    this.prepareWave();
                } 
                else if (!this.eliteSpawned) {
                    this.spawnElitesAndBoss();
                } 
                else {
                    this.levelIndex++;
                    if (this.levelIndex < LevelConfigs.length) {
                        // Al llamar a startLevel(), las vidas vuelven a 3 automáticamente
                        this.startLevel();
                    } else {
                        if (window.switchMusic) window.switchMusic('victory'); 
                        this.game.gameOver(true);
                        this.state = 'COMPLETED';
                    }
                }
            }
        }
    }

    spawnFormation(squad) {
        const patterns = ['vShape', 'horizontalLine', 'diagonalFlank'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const startY = -80; 
        const centerX = this.game.width / 2;

        squad.forEach((type, index) => {
            let sx, sy, vx, vy;
            const speed = EnemyConfigs[type].speed;

            if (pattern === 'vShape') {
                const offsetsX = [0, -70, 70, -140, 140];
                const offsetsY = [0, -60, -60, -120, -120];
                sx = centerX + (offsetsX[index] || 0);
                sy = startY + (offsetsY[index] || 0);
                vx = 0; vy = speed;
            } 
            else if (pattern === 'horizontalLine') {
                const spacing = this.game.width / (squad.length + 1);
                sx = spacing * (index + 1);
                sy = startY;
                vx = 0; vy = speed;
            } 
            else if (pattern === 'diagonalFlank') {
                const fromLeft = Math.random() > 0.5;
                sx = fromLeft ? -50 - (index * 50) : this.game.width + 50 + (index * 50);
                sy = startY - (index * 50);
                vx = fromLeft ? speed * 1.5 : -speed * 1.5; 
                vy = speed * 0.8;
            }

            const e = new Enemy(this.game, type, sx, sy, vx, vy);
            this.game.enemies.push(e);
        });
    }

    spawnElitesAndBoss() {
        this.eliteSpawned = true;

        if (this.levelConfig.boss) {
            const b = this.levelConfig.boss;
            if (this.currentWave && this.currentWave.isBossWave) {
                if (window.switchMusic) window.switchMusic('boss');
            }
            const bossEntity = new Boss(this.game, this.game.width / 2, -150, b.hp);
            this.game.enemies.push(bossEntity);
            return;
        }

        const config = this.levelConfig.eliteWave;
        if (!config) return;

        const count = config.count || 1;
        const spacing = this.game.width / (count + 1);

        for (let i = 0; i < count; i++) {
            const sx = spacing * (i + 1);
            const e = new Enemy(this.game, config.type || 'elite', sx, -80, 0, EnemyConfigs[config.type || 'elite'].speed);
            if (config.hpOverride) e.hp = config.hpOverride;
            this.game.enemies.push(e);
        }
    }

    draw(ctx) {
        if (this.state === 'TRANSITION') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#3b8e88';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.game.width / 2, this.game.height / 2);
        }
    }
}