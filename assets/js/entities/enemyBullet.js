class EnemyBullet {
    constructor(game, x, y, vx = 0, vy = 4) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx; // Si no recibe vx, será 0 (hacia abajo)
        this.vy = vy;
        this.width = 8;
        this.height = 12;
        this.markedForDeletion = false;
    }

    update() {
        // Aplicamos el movimiento vectorial
        this.x += this.vx;
        this.y += this.vy;

        // Limpieza si sale del canvas
        if (this.y > this.game.height || this.x < -50 || this.x > this.game.width + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#ff4444'; // Color de bala enemiga
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
    }
}