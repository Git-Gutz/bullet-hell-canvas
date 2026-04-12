class EnemyBullet {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        
        this.width = 6;
        this.height = 18;
        
        // La bala enemiga va hacia ABAJO (positivo en Y)
        this.speed = 5; 
        
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed; 
        
        // Borrar si sale por debajo de la pantalla
        if (this.y > this.game.height + this.height) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Color rojo vintage de tu paleta
        ctx.fillStyle = '#c94938'; 
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#c94938';
        
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        
        ctx.restore();
    }
}