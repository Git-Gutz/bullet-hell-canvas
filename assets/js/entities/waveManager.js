/**
 * ARCHIVO: assets/js/entities/waveManager.js
 * FASE: 14 (Sincronización de Audio y Corrección de Punteros Nulos)
 * PROYECTO: HELLFRAME - I.T. Pachuca
 */

class WaveManager {
    constructor(game) {
        this.game = game;
        this.levelIndex = 0;
        this.waveIndex = 0;
        
        // --- 🚩 CORRECCIÓN: Definimos currentWave como propiedad de clase ---
        this.currentWave = null; 
        
        // Estados: 'TRANSITION', 'WAVE', 'COMPLETED'
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

    startLevel() {
        this.message = this.levelConfig.name;
        this.state = 'TRANSITION';
        this.timer = 0;
        this.waveIndex = 0;
        this.currentWave = null; // Reset de horda
        this.eliteSpawned = false;
        this.game.enemies = []; 
        
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
        
        // --- 🚩 CORRECCIÓN: Guardamos la horda en el contexto global de la clase ---
        const waveKey = this.levelConfig.waves[this.waveIndex];
        this.currentWave = WaveConfigs[waveKey]; 
        
        if (!this.currentWave) {
            console.error(`[ERROR] No se encontró la configuración para la horda: ${waveKey}`);
            return;
        }

        // 1. RECOLECTAR ENEMIGOS
        this.currentWave.enemies.forEach(e => {
            for (let i = 0; i < e.count; i++) {
                this.pendingSpawns.push(e.type);
            }
        });

        // 2. BARAJAR (Shuffle)
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

            // 1. LANZAR ESCUADRÓN SI HAY PENDIENTES
            if (this.pendingSpawns.length > 0) {
                if (this.spawnTimer > this.currentInterval) {
                    const squadSize = Math.min(Math.floor(Math.random() * 3) + 3, this.pendingSpawns.length);
                    const squad = this.pendingSpawns.splice(0, squadSize);
                    
                    this.spawnFormation(squad);
                    this.spawnTimer = 0;
                    
                    // Ajuste de intervalo aleatorio
                    if (this.currentWave) {
                        this.currentInterval = (this.currentWave.interval * 3) + (Math.random() * 1000);
                    }
                }
            } 
            // 2. SI LA OLEADA SE ACABÓ Y LA PANTALLA ESTÁ LIMPIA
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
                        this.startLevel();
                    } else {
                        // 🚩 NUEVO: Disparamos la música de victoria al terminar todos los niveles
                        if (window.switchMusic) window.switchMusic('victory'); 

                        // Disparamos la pantalla de victoria del motor
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

        // --- 🚩 CORRECCIÓN: Lógica de Jefe con Escudo de Punteros ---
        if (this.levelConfig.boss) {
            const b = this.levelConfig.boss;
            
            // Verificamos que this.currentWave exista antes de leer .isBossWave
            if (this.currentWave && this.currentWave.isBossWave) {
                console.log(" [SISTEMA] Firma de energía masiva detectada. Cambiando BGM.");
                if (window.switchMusic) window.switchMusic('boss');
            }
            
            const bossEntity = new Boss(this.game, this.game.width / 2, -150, b.hp);
            this.game.enemies.push(bossEntity);
            return;
        }

        // 2. Lógica de Élites Normales
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