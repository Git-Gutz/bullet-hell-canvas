class Enemy {
    constructor(game, type, x, y, vx = 0, vy = null, patternOverride = null) {
        this.game = game;
        this.type = type;
        this.config = EnemyConfigs[type];

        this.width = this.config.width;
        this.height = this.config.height;
        this.hp = this.config.hp;
        this.scoreValue = this.config.scoreValue;
        
        this.vx = vx;
        this.vy = vy !== null ? vy : this.config.speed;
        
        this.x = x;
        this.y = y;
        
        // --- NUEVO: ESTADOS PARA PATRONES MATEMÁTICOS ---
        this.startX = x; // Recordar de dónde salió
        this.timeAlive = 0; // Reloj interno para trigonometría
        
        // Elegir patrón: Usa el forzado por el Spawner, o uno aleatorio de su Configuración
        const availablePatterns = this.config.patterns;
        this.patternName = patternOverride || availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
        this.patternFunction = MovementPatterns[this.patternName];

        this.markedForDeletion = false;

        this.fireTimer = 0;
        this.fireInterval = this.config.fireRate; 
    }

    update(deltaTime) {
        // Reloj biológico del enemigo
        this.timeAlive += deltaTime; 

        // --- EJECUTAR EL PATRÓN INYECTADO ---
        if (this.patternFunction) {
            this.patternFunction(this);
        }

        // Sistema de basura (Garbage Collector)
        // Eliminamos si sale por abajo, o si huye por arriba (hoverAndRetreat), o sale por los lados
        if (this.y > this.game.height + this.height || 
            this.y < -200 || 
            this.x < -200 || 
            this.x > this.game.width + 200) {
            this.markedForDeletion = true;
        }

        // Lógica de disparo (Solo dispara si está en zona visible)
        if (this.y > 0 && this.y < this.game.height) {
            if (this.fireTimer > this.fireInterval) {
                this.shoot();
                this.fireTimer = 0; 
            } else {
                this.fireTimer += deltaTime;
            }
        }
    }

    shoot() {
        this.game.enemyBullets.push(new EnemyBullet(this.game, this.x, this.y + this.height / 2));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        let img = Assets && Assets.images ? Assets.images[this.config.imageKey] : null;
        
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = this.config.color;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        ctx.restore();
    }
}