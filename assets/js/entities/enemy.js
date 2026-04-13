/**
 * ARCHIVO: assets/js/entities/enemy.js
 * FASE: 11 (Comportamientos de Elite, Boss e Inclinación Dinámica)
 */

class Enemy {
    constructor(game, type, x, y, vx = 0, vy = null, patternOverride = null) {
        this.game = game;
        this.type = type;
        
        // REGLA DE ORO: Fallback a 'grunt' si el tipo es desconocido
        this.config = EnemyConfigs[type] || EnemyConfigs.grunt;

        this.width = this.config.width;
        this.height = this.config.height;
        this.hp = this.config.hp;
        this.scoreValue = this.config.scoreValue;
        
        this.vx = vx;
        this.vy = vy !== null ? vy : this.config.speed;
        
        this.x = x;
        this.y = y;
        this.rotation = 0; // Para patrones como wideZigzag
        
        // --- ESTADOS PARA PATRONES MATEMÁTICOS ---
        this.startX = x; 
        this.timeAlive = 0; 
        
        // Selección de Patrón Dinámico
        const availablePatterns = this.config.patterns;
        this.patternName = patternOverride || availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
        this.patternFunction = MovementPatterns[this.patternName];

        this.markedForDeletion = false;
        this.fireTimer = 0;
        this.fireInterval = this.config.fireRate; 

        // Identificador de jerarquía
        this.isBoss = (type === 'boss_final');
    }

    update(deltaTime) {
        if (this.game.isPaused) return;

        this.timeAlive += deltaTime; 

        // 1. EJECUTAR EL PATRÓN (Maneja x, y y rotation)
        if (this.patternFunction) {
            this.patternFunction(this);
        }

        // 2. SISTEMA DE LÍMITES (Garbage Collector)
        // Ajustado para permitir que patrones amplios no se corten prematuramente
        if (this.y > this.game.height + 150 || 
            this.y < -350 || 
            this.x < -400 || 
            this.x > this.game.width + 400) {
            this.markedForDeletion = true;
        }

        // 3. LÓGICA DE DISPARO
        // El enemigo solo dispara si está dentro de los límites visibles del canvas
        if (this.y > 0 && this.y < this.game.height * 0.85) {
            if (this.fireTimer > this.fireInterval) {
                this.shoot();
                this.fireTimer = 0; 
            } else {
                this.fireTimer += deltaTime;
            }
        }
    }

    shoot() {
        if (this.type === 'elite') {
            // --- DISPARO EN ABANICO (5 Proyectiles Vectoriales) ---
            const numBullets = 5;
            const spreadAngle = 0.8; 
            const startAngle = -spreadAngle / 2;
            const step = spreadAngle / (numBullets - 1);

            for (let i = 0; i < numBullets; i++) {
                const currentAngle = startAngle + (step * i);
                const b = new EnemyBullet(this.game, this.x, this.y + this.height / 2);
                
                const bulletSpeed = 3.5; 
                b.vx = Math.sin(currentAngle) * bulletSpeed;
                b.vy = Math.cos(currentAngle) * bulletSpeed;
                
                this.game.enemyBullets.push(b);
            }
        } else {
            // --- DISPARO ESTÁNDAR (Grunt / Striker / Boss Base) ---
            const b = new EnemyBullet(this.game, this.x, this.y + this.height / 2);
            // Inyectamos velocidades si el constructor de la bala las requiere
            b.vx = this.vx * 0.2; // Ligera inercia del movimiento lateral
            b.vy = 4; 
            this.game.enemyBullets.push(b);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Aplicamos rotación si el patrón (como wideZigzag) la modifica
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }

        const images = window.Assets ? window.Assets.images : null;
        let img = images ? (images[this.config.imageKey] || images[this.type]) : null;
        
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Placeholder visual para depuración
            ctx.fillStyle = this.config.color || '#ff0000';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            if (this.isBoss || this.type === 'elite') {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            }
        }

        // Renderizado de Barra de Salud para unidades pesadas
        if (this.type === 'elite' || this.isBoss) {
            this.drawHealthBar(ctx);
        }

        ctx.restore();
    }

    drawHealthBar(ctx) {
        const barWidth = this.width * 0.9;
        const barHeight = 4;
        const maxHp = this.config.hp;
        const currentHpRatio = Math.max(0, this.hp / maxHp);

        // Fondo de la barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barWidth / 2, -this.height / 2 - 12, barWidth, barHeight);

        // Vida restante (Cambia a rojo cuando es crítica)
        ctx.fillStyle = currentHpRatio > 0.3 ? '#3b8e88' : '#c94938';
        ctx.fillRect(-barWidth / 2, -this.height / 2 - 12, barWidth * currentHpRatio, barHeight);
    }
}