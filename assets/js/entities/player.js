class Player {
    constructor(game) {
        this.game = game;
        this.width = 64; 
        this.height = 64;
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        
        this.minY = this.game.height * 0.40; 
        this.speed = 0.15;
        this.hitboxRadius = 27; 

        this.fireTimer = 0;
        this.fireInterval = 200; 

        // --- NUEVO: SISTEMA DE iFRAMES ---
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1500; // 1.5 segundos de protección

        // --- NUEVO: SISTEMA DE PARPADEO (Hit Flash) ---
        this.flashTimer = 0;
        this.flashInterval = 100; // Cambia de visible a invisible cada 100ms
        this.isVisible = true; 
    }

    update(input, deltaTime) {
        let targetX = input.mouseX;
        let targetY = input.mouseY;

        if (targetY < this.minY) targetY = this.minY;
        if (targetY > this.game.height - this.height/2) targetY = this.game.height - this.height/2;
        if (targetX < this.width/2) targetX = this.width/2;
        if (targetX > this.game.width - this.width/2) targetX = this.game.width - this.width/2;

        this.x += (targetX - this.x) * this.speed;
        this.y += (targetY - this.y) * this.speed;

        if (this.fireTimer > this.fireInterval) {
            this.shoot();
            this.fireTimer = 0; 
        } else {
            this.fireTimer += deltaTime; 
        }

        // --- NUEVO: LÓGICA DE INVULNERABILIDAD ---
        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaTime;
            this.flashTimer += deltaTime;

            // Efecto de parpadeo
            if (this.flashTimer > this.flashInterval) {
                this.isVisible = !this.isVisible; // Alterna entre true/false
                this.flashTimer = 0;
            }

            // Terminar invulnerabilidad
            if (this.invulnerableTimer > this.invulnerableDuration) {
                this.isInvulnerable = false;
                this.isVisible = true; // Asegurar que quede visible al final
                this.invulnerableTimer = 0;
            }
        }
    }

    shoot() {
        this.game.playerBullets.push(new Bullet(this.x, this.y - this.height / 2));
    }

    draw(ctx) {
        // --- NUEVO: Si no es visible por el parpadeo, saltamos el dibujo este frame ---
        if (!this.isVisible) return; 

        ctx.save();
        ctx.translate(this.x, this.y);

        let img = Assets && Assets.images ? Assets.images.playerShip : null;
        
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
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