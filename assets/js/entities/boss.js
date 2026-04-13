/**
 * ARCHIVO: assets/js/entities/boss.js
 * FASE: 12 (Sistema de Navegación Suave y Soporte)
 */

class Boss {
    constructor(game, x, y, hp) {
        this.game = game;
        this.type = 'boss_final';
        this.isBoss = true; 

        // --- TAMAÑO Y PROPORCIÓN ---
        this.width = this.game.width * 0.22; 
        this.height = this.width; 

        // --- ESTADO Y FASES ---
        this.maxHp = hp;
        this.hp = hp;
        this.phase = 1; 
        this.scoreValue = 10000;
        this.markedForDeletion = false;

        // --- NAVEGACIÓN (Corregida) ---
        this.x = x;
        this.y = -this.height; 
        this.targetY = this.game.height * 0.18; // Un poco más abajo para que no pegue arriba
        this.timeAlive = 0;
        this.isReady = false; // Estado para saber si ya terminó de entrar

        // --- CONTROL DE ATAQUES Y SOPORTE ---
        this.fireTimer = 0;
        this.spiralAngle = 0; 
        this.supportTimer = 5000; 
    }

    update(deltaTime) {
        if (this.game.isPaused) return;
        this.timeAlive += deltaTime;

        // 1. EVALUADOR DE FASES
        const hpRatio = Math.max(0, this.hp / this.maxHp);
        if (hpRatio <= 0.33) this.phase = 3;
        else if (hpRatio <= 0.66) this.phase = 2;
        else this.phase = 1;

        // 2. LÓGICA DE MOVIMIENTO (Sin choques)
        if (!this.isReady) {
            // Entrada suave
            const distanceToTarget = this.targetY - this.y;
            if (distanceToTarget > 1) {
                this.y += distanceToTarget * 0.02; // Interpolación para frenar al llegar
            } else {
                this.y = this.targetY;
                this.isReady = true;
            }
        } else {
            // --- MOVIMIENTO DINÁMICO CON MARGEN DE SEGURIDAD ---
            const speed = 0.0007 * (1 + (this.phase * 0.2)); 
            
            // Margen para no tocar los bordes laterales (Ancho del jefe / 2 + 20px de aire)
            const marginX = (this.width / 2) + 30;
            const availableWidth = (this.game.width / 2) - marginX;
            
            // Cálculo de X con seno (Oscilación lateral)
            this.x = (this.game.width / 2) + Math.sin(this.timeAlive * speed) * availableWidth;
            
            // Margen para no pegar en el techo ni bajar demasiado
            const hoverAmplitude = this.game.height * 0.07;
            this.y = this.targetY + Math.cos(this.timeAlive * speed * 1.5) * hoverAmplitude;
        }

        // 3. ATAQUES Y DRONES
        this.executeAttackLogic(deltaTime);
    }

    executeAttackLogic(deltaTime) {
        if (!this.isReady) return;

        this.fireTimer += deltaTime;
        this.supportTimer += deltaTime;

        if (this.phase === 1 && this.fireTimer > 1800) {
            this.fireRadialBurst(12, 2.5); 
            this.fireTimer = 0;
        }
        
        if (this.phase === 2 && this.fireTimer > 1100) {
            this.fireRadialBurst(18, 3.2); 
            this.fireTimer = 0;
        }

        if (this.phase === 3 && this.fireTimer > 120) {
            this.fireSpiralBullet();
            this.fireTimer = 0;
        }

        if (this.supportTimer > 8000) { 
            this.spawnSupportDrone();
            this.supportTimer = 0;
        }
    }

    fireRadialBurst(bulletCount, speed) {
        const step = (Math.PI * 2) / bulletCount;
        for (let i = 0; i < bulletCount; i++) {
            const angle = step * i;
            const b = new EnemyBullet(this.game, this.x, this.y);
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
            this.game.enemyBullets.push(b);
        }
    }

    fireSpiralBullet() {
        this.spiralAngle += 0.35;
        const speed = 4.5;
        const b = new EnemyBullet(this.game, this.x, this.y);
        b.vx = Math.cos(this.spiralAngle) * speed;
        b.vy = Math.sin(this.spiralAngle) * speed;
        this.game.enemyBullets.push(b);
    }

    spawnSupportDrone() {
        const fromLeft = Math.random() > 0.5;
        const sx = fromLeft ? -60 : this.game.width + 60;
        const sy = Math.random() * (this.game.height * 0.2) + 200; 
        const vx = fromLeft ? 2.2 : -2.2;

        const drone = new Enemy(this.game, 'drone', sx, sy, vx, 0);
        drone.patternFunction = (e) => {
            e.x += e.vx;
        };

        this.game.enemies.push(drone);
        console.log(`%c [SOPORTE] Dron desde ${fromLeft ? 'IZQUIERDA' : 'DERECHA'}`, 'color: #00ffcc');
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const img = window.Assets ? window.Assets.images.boss_final : null;
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = this.phase === 3 ? '#ff3333' : (this.phase === 2 ? '#ffcc00' : '#00ffcc');
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.restore();
        this.drawEpicHealthBar(ctx);
    }

    drawEpicHealthBar(ctx) {
        const barWidth = this.game.width * 0.8;
        const barHeight = 12;
        const x = (this.game.width - barWidth) / 2;
        const y = 25;

        const hpRatio = Math.max(0, this.hp / this.maxHp);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        const color = this.phase === 3 ? '#ff3333' : (this.phase === 2 ? '#ffcc00' : '#00ffcc');
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

        ctx.fillStyle = '#fff';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`AUTOMATA CORE - PHASE ${this.phase}`, this.game.width / 2, y + 35);
    }
}