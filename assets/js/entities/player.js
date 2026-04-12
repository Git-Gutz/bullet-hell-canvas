class Player {
    constructor(game) {
        this.game = game;
        this.width = 64; 
        this.height = 64;
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        
        // Área de movimiento al 60% (Tu excelente modificación)
        this.minY = this.game.height * 0.40; 
        this.speed = 0.15;
        this.hitboxRadius = 27; 

        // --- SISTEMA DE AUTO-FIRE (Restaurado) ---
        this.fireTimer = 0;
        this.fireInterval = 200; // Cadencia: dispara cada 200ms
    }

    // Recibimos deltaTime del motor para ser precisos con el tiempo
    update(input, deltaTime) {
        let targetX = input.mouseX;
        let targetY = input.mouseY;

        // Limites de pantalla
        if (targetY < this.minY) targetY = this.minY;
        if (targetY > this.game.height - this.height/2) targetY = this.game.height - this.height/2;
        if (targetX < this.width/2) targetX = this.width/2;
        if (targetX > this.game.width - this.width/2) targetX = this.game.width - this.width/2;

        // Movimiento Suave
        this.x += (targetX - this.x) * this.speed;
        this.y += (targetY - this.y) * this.speed;

        // --- LÓGICA DE DISPARO ---
        if (this.fireTimer > this.fireInterval) {
            this.shoot();
            this.fireTimer = 0; // Reiniciar cronómetro
        } else {
            this.fireTimer += deltaTime; // Sumar tiempo transcurrido
        }
    }

    shoot() {
        // Creamos la bala en la punta de la nave y la mandamos al motor
        this.game.playerBullets.push(new Bullet(this.x, this.y - this.height / 2));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 1. DIBUJAR SPRITE O FALLBACK SEGURO
        let img = Assets && Assets.images ? Assets.images.playerShip : null;
        
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Nave poligonal Teal de emergencia
            ctx.fillStyle = '#3b8e88';
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2);
            ctx.lineTo(this.width/2, this.height/2);
            ctx.lineTo(0, this.height/6);
            ctx.lineTo(-this.width/2, this.height/2);
            ctx.closePath();
            ctx.fill();
        }

       
        ctx.restore();
    }
}