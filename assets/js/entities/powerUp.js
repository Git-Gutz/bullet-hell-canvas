class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = PowerUpConfigs[type];
        
        this.width = 32;
        this.height = 32;
        this.speed = 2;
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;
        if (this.y > this.game.height) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 18, 16, 0.9)';
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.config.color;
        ctx.fillStyle = this.config.color;
        ctx.font = '14px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.label, 0, 2);

        ctx.restore();
    }
}