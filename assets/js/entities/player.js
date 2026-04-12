class Player {
    constructor(game) {
        this.game = game;
        
        // Ajusta estas dimensiones al tamaño real que quieras que tenga tu nave en pantalla
        this.width = 64; 
        this.height = 64;
        
        this.x = this.game.width / 2;
        this.y = this.game.height - 60;
        
        this.minY = this.game.height * 0.40;
        this.speed = 0.15;
        this.hitboxRadius = 7; // Mantenemos la hitbox reducida
    }

    update(input) {
        let targetX = input.mouseX;
        let targetY = input.mouseY;

        if (targetY < this.minY) targetY = this.minY;
        if (targetY > this.game.height - this.height/2) targetY = this.game.height - this.height/2;
        if (targetX < this.width/2) targetX = this.width/2;
        if (targetX > this.game.width - this.width/2) targetX = this.game.width - this.width/2;

        this.x += (targetX - this.x) * this.speed;
        this.y += (targetY - this.y) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // --- 1. DIBUJAR EL SPRITE ---
        // Verificamos si la imagen existe en nuestro Assets manager
        if (Assets.images.playerShip) {
            // drawImage(imagen, posición X, posición Y, ancho, alto)
            // Centramos la imagen restando la mitad de su ancho y alto
            ctx.drawImage(
                Assets.images.playerShip, 
                -this.width / 2, 
                -this.height / 2, 
                this.width, 
                this.height
            );
        } else {
            // Fallback: Si no carga la imagen, dibujamos un cuadrado rojo
            ctx.fillStyle = 'red';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        // --- 2. DIBUJAR EL NÚCLEO (Hitbox Visual) ---
        ctx.fillStyle = '#ffb800'; 
        ctx.beginPath();
        ctx.arc(0, 0, this.hitboxRadius, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffb800';
        ctx.fill();

        ctx.restore();
    }
}