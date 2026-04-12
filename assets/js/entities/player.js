class Player {
    constructor(game) {
        this.game = game;
        this.width = 64; 
        this.height = 64;
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        this.speed = 0.15;
        this.hitboxRadius = 27; 
        this.minY = this.game.height * 0.40;

        this.fireTimer = 0;
        this.fireInterval = 200; 

        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1500;
        this.flashTimer = 0;
        this.flashInterval = 100;
        this.isVisible = true;

        // --- SISTEMA DE LÁSER Y BOTÓN ---
        this.isLaserActive = false;
        this.laserTimer = 0;
        this.laserDuration = 1500;
        this.laserCooldown = 10000; // 10 segundos
        this.laserCooldownTimer = 10000; // Inicia cargado
        this.isLaserReady = true;

        // Propiedades del botón HUD
        this.btnSize = 80;
        this.btnX = this.game.width - 100;
        this.btnY = this.game.height - 100;
    }

    update(input, deltaTime) {
        // Movimiento
        let targetX = input.mouseX;
        let targetY = input.mouseY;
        if (targetY < this.minY) targetY = this.minY;
        if (targetY > this.game.height - this.height/2) targetY = this.game.height - this.height/2;
        if (targetX < this.width/2) targetX = this.width/2;
        if (targetX > this.game.width - this.width/2) targetX = this.game.width - this.width/2;

        this.x += (targetX - this.x) * this.speed;
        this.y += (targetY - this.y) * this.speed;

        // Disparo normal
        if (this.fireTimer > this.fireInterval) {
            this.shoot();
            this.fireTimer = 0; 
        } else {
            this.fireTimer += deltaTime; 
        }

        // --- LÓGICA DE ACTIVACIÓN DEL LÁSER ---
        const distToBtn = Math.sqrt(Math.pow(input.mouseX - this.btnX, 2) + Math.pow(input.mouseY - this.btnY, 2));
        const isTouchingBtn = input.isButtonClicked && distToBtn < this.btnSize / 2;

// --- LÓGICA DE ACTIVACIÓN DEL LÁSER (Simplificada) ---
        // Ahora input.isButtonClicked solo es true si un dedo tocó el botón específicamente
        if ((input.isSpacePressed || input.isButtonClicked) && this.isLaserReady) {
            this.isLaserActive = true;
            this.isLaserReady = false;
            this.laserTimer = 0;
            this.laserCooldownTimer = 0;
        }

        if (this.isLaserActive) {
            this.laserTimer += deltaTime;
            if (this.laserTimer > this.laserDuration) this.isLaserActive = false;
        }

        if (!this.isLaserReady) {
            this.laserCooldownTimer += deltaTime;
            if (this.laserCooldownTimer >= this.laserCooldown) {
                this.isLaserReady = true;
                this.laserCooldownTimer = this.laserCooldown;
            }
        }

        // iFrames
        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaTime;
            this.flashTimer += deltaTime;
            if (this.flashTimer > this.flashInterval) {
                this.isVisible = !this.isVisible;
                this.flashTimer = 0;
            }
            if (this.invulnerableTimer > this.invulnerableDuration) {
                this.isInvulnerable = false;
                this.isVisible = true;
                this.invulnerableTimer = 0;
            }
        }
    }

    shoot() {
        this.game.playerBullets.push(new Bullet(this.x, this.y - this.height / 2));
    }

    draw(ctx) {
        if (this.isLaserActive) this.drawLaser(ctx);
        if (!this.isVisible) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        let img = Assets && Assets.images ? Assets.images.playerShip : null;
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#3b8e88';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        ctx.restore();

        // Dibujar el botón HUD siempre visible
        this.drawLaserButton(ctx);
    }

    drawLaser(ctx) {
        ctx.save();
        const laserWidth = 24;
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, 0);
        gradient.addColorStop(0, '#3b8e88');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, 'rgba(59, 142, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#3b8e88';
        ctx.fillRect(this.x - laserWidth / 2, 0, laserWidth, this.y);
        ctx.restore();
    }

    drawLaserButton(ctx) {
        ctx.save();
        ctx.translate(this.btnX, this.btnY);

        // Fondo del botón
        ctx.beginPath();
        ctx.arc(0, 0, this.btnSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 18, 16, 0.8)';
        ctx.fill();
        ctx.strokeStyle = this.isLaserReady ? '#3b8e88' : '#444';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Relleno de cooldown (Radial)
        if (!this.isLaserReady) {
            const progress = this.laserCooldownTimer / this.laserCooldown;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.btnSize / 2 - 2, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
            ctx.fillStyle = 'rgba(59, 142, 136, 0.5)';
            ctx.fill();
        }

        // Texto
        ctx.fillStyle = this.isLaserReady ? '#fff' : '#666';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('LASER', 0, 5);
        ctx.restore();
    }
}