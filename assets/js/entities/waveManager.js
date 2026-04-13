/**
 * ARCHIVO: assets/js/entities/waveManager.js
 * FASE: 12 (Coreografía de Escuadrones, Normalización, HUD Dinámico y Boss System)
 */

class WaveManager {
    constructor(game) {
        this.game = game;
        this.levelIndex = 0;
        this.waveIndex = 0;
        
        // Estados: 'TRANSITION', 'WAVE', 'COMPLETED'
        this.state = 'TRANSITION'; 
        this.timer = 0;
        this.message = '';
        
        this.pendingSpawns = []; // Lista plana de enemigos por aparecer
        this.spawnTimer = 0;
        this.currentInterval = 2000; // Tiempo entre escuadrones
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
        this.eliteSpawned = false;
        this.game.enemies = []; // Limpiamos la pantalla
        
        // --- HUD: Actualizamos al iniciar un nuevo nivel ---
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
        
        // --- ARQUITECTURA MODULAR: Leemos del Catálogo WaveConfigs ---
        const waveKey = this.levelConfig.waves[this.waveIndex];
        const currentWave = WaveConfigs[waveKey]; 
        
        // 1. RECOLECTAR ENEMIGOS: Convertimos las cantidades en una lista plana
        currentWave.enemies.forEach(e => {
            for (let i = 0; i < e.count; i++) {
                this.pendingSpawns.push(e.type);
            }
        });

        // 2. BARAJAR (Shuffle): Mezclamos la lista para que las formaciones tengan variedad
        this.pendingSpawns.sort(() => Math.random() - 0.5);

        this.spawnTimer = 0;
        // El intervalo ahora define el tiempo entre escuadrones
        this.currentInterval = currentWave.interval * 3.5; 
    }

    update(deltaTime) {
        if (this.state === 'TRANSITION') {
            this.timer += deltaTime;
            if (this.timer > 3000) { // 3 segundos de preparación
                this.state = 'WAVE';
                this.prepareWave();
            }
            return;
        }

        if (this.state === 'WAVE') {
            this.spawnTimer += deltaTime;

            // 1. SI AÚN HAY ENEMIGOS EN LA RESERVA, LANZAR ESCUADRÓN
            if (this.pendingSpawns.length > 0) {
                if (this.spawnTimer > this.currentInterval) {
                    // Tomamos entre 3 y 5 naves para formar un escuadrón
                    const squadSize = Math.min(Math.floor(Math.random() * 3) + 3, this.pendingSpawns.length);
                    const squad = this.pendingSpawns.splice(0, squadSize);
                    
                    this.spawnFormation(squad);
                    this.spawnTimer = 0;
                    
                    // --- ARQUITECTURA MODULAR: Buscar el intervalo en el Catálogo ---
                    const waveKey = this.levelConfig.waves[this.waveIndex];
                    const currentWaveInterval = WaveConfigs[waveKey].interval;
                    
                    // Añadimos aleatoriedad al tiempo del siguiente escuadrón
                    this.currentInterval = (currentWaveInterval * 3) + (Math.random() * 1000);
                }
            } 
            // 2. SI LA OLEADA SE ACABÓ Y LA PANTALLA ESTÁ LIMPIA
            else if (this.game.enemies.length === 0) {
                this.waveIndex++;
                
                // --- HUD: Actualizamos al avanzar a la siguiente horda ---
                this.game.updateUI();
                
                // ¿Hay más oleadas normales?
                if (this.waveIndex < this.levelConfig.waves.length) {
                    this.prepareWave();
                } 
                // ¿Toca sacar al Élite / Boss?
                else if (!this.eliteSpawned) {
                    this.spawnElitesAndBoss();
                } 
                // ¡Nivel superado!
                else {
                    this.levelIndex++;
                    if (this.levelIndex < LevelConfigs.length) {
                        this.startLevel();
                    } else {
                        this.message = "¡SISTEMA PURGADO! HAS GANADO";
                        this.state = 'COMPLETED';
                    }
                }
            }
        }
    }

    // --- EL CEREBRO TÁCTICO: FORMACIONES PREDEFINIDAS ---
    spawnFormation(squad) {
        // Elegimos un patrón al azar para este escuadrón
        const patterns = ['vShape', 'horizontalLine', 'diagonalFlank'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];

        const startY = -80; 
        const centerX = this.game.width / 2;

        squad.forEach((type, index) => {
            let sx, sy, vx, vy;
            const speed = EnemyConfigs[type].speed;

            if (pattern === 'vShape') {
                // Formación en "V"
                const offsetsX = [0, -70, 70, -140, 140];
                const offsetsY = [0, -60, -60, -120, -120];
                sx = centerX + (offsetsX[index] || 0);
                sy = startY + (offsetsY[index] || 0);
                vx = 0; 
                vy = speed;
            } 
            else if (pattern === 'horizontalLine') {
                // Fila india horizontal
                const spacing = this.game.width / (squad.length + 1);
                sx = spacing * (index + 1);
                sy = startY;
                vx = 0;
                vy = speed;
            } 
            else if (pattern === 'diagonalFlank') {
                // Emboscada desde las esquinas superiores
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

    // --- SISTEMA DE JEFES Y ÉLITES SIMÉTRICOS ---
    spawnElitesAndBoss() {
        this.eliteSpawned = true;

        // 1. Revisar si es el Nivel 10 (Tiene Boss)
        if (this.levelConfig.boss) {
            const b = this.levelConfig.boss;
            
            // 🔴 NUEVO: Instanciamos la clase Boss real, usando la clase que acabamos de crear en boss.js
            const bossEntity = new Boss(this.game, this.game.width / 2, -150, b.hp);
            
            // Lo inyectamos en el arreglo de enemigos para que las colisiones funcionen
            this.game.enemies.push(bossEntity);
            return;
        }

        // 2. Si no es Boss, despachar cantidad de Élites según dificultad
        const config = this.levelConfig.eliteWave;
        if (!config) return;

        const count = config.count || 1;
        // Calculamos el espacio para que salgan perfectamente simétricos
        const spacing = this.game.width / (count + 1);

        for (let i = 0; i < count; i++) {
            const sx = spacing * (i + 1);
            const sy = -80; // Caen desde arriba
            const e = new Enemy(this.game, config.type || 'elite', sx, sy, 0, EnemyConfigs[config.type || 'elite'].speed);
            
            if (config.hpOverride) e.hp = config.hpOverride;
            this.game.enemies.push(e);
        }
    }

    draw(ctx) {
        if (this.state === 'TRANSITION' || this.state === 'COMPLETED') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
            
            ctx.fillStyle = '#3b8e88';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, this.game.width / 2, this.game.height / 2);
        }
    }
}