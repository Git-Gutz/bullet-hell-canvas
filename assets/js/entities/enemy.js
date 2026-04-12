class Enemy {
    // NUEVO: Ahora el constructor recibe vx y vy (velocidad en X y Y)
    constructor(game, type, x, y, vx = 0, vy = null) {
        this.game = game;
        this.type = type;
        this.config = EnemyConfigs[type];

        this.width = this.config.width;
        this.height = this.config.height;
        this.hp = this.config.hp;
        this.scoreValue = this.config.scoreValue;
        
        // NUEVO: Asignar velocidades. Si no se pasa 'vy', usa la del config por defecto.
        this.vx = vx;
        this.vy = vy !== null ? vy : this.config.speed;
        
        this.x = x;
        this.y = y;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        // NUEVO: Movimiento en ambos ejes
        this.x += this.vx;
        this.y += this.vy;

        // NUEVO: Borrar si sale por abajo, pero también si se va muy lejos por los lados
        if (this.y > this.game.height + this.height || 
            this.x < -100 || 
            this.x > this.game.width + 100) {
            this.markedForDeletion = true;
        }
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