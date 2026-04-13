class Player {
    constructor(game) {
        this.game = game;
        this.width = 64; 
        this.height = 64;
        this.x = this.game.width / 2;
        this.y = this.game.height - 100;
        this.speed = 0.15;
        this.minY = this.game.height * 0.40;

        this.fireTimer = 0;
        this.fireInterval = 200; 

        // iFrames y Daño
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        this.invulnerableDuration = 1500;
        this.flashTimer = 0;
        this.flashInterval = 100;
        this.isVisible = true;
        this.damageType = 'none'; 

        // Power-Ups y Animación Escudo
        this.hasShield = false;
        this.isMultiShotActive = false;
        this.multiShotTimer = 0;
        this.isShieldBreaking = false;
        this.shieldBreakTimer = 0;
        this.shieldBreakDuration = 300;

        // Dentro de tu método shoot() o disparar() de la clase Player
if (window.triggerShake) window.triggerShake(2, 50); // Intensidad baja (2), muy rápido (50ms)

        // Láser
        this.isLaserActive = false;
        this.laserTimer = 0;
        this.laserDuration = 1500;
        this.laserCooldown = 10000; 
        this.laserCooldownTimer = 10000; 
        this.isLaserReady = true;

        this.btnSize = 80;
        this.btnX = this.game.width - 100;
        this.btnY = this.game.height - 100;
    }

    takeDamage(isShieldHit) {
        this.isInvulnerable = true;
        this.invulnerableTimer = 0;
        this.flashTimer = 0;
        
        if (isShieldHit) {
            this.hasShield = false;
            this.isShieldBreaking = true;
            this.shieldBreakTimer = 0;
            this.damageType = 'shield';
        } else {
            this.damageType = 'hull';
        }
    }

    update(input, deltaTime) {
        this.x += (input.mouseX - this.x) * this.speed;
        this.y += (input.mouseY - this.y) * this.speed;

        // Disparo
        if (this.fireTimer > this.fireInterval) {
            this.shoot();
            this.fireTimer = 0; 
        } else {
            this.fireTimer += deltaTime; 
        }

        if (this.isMultiShotActive) {
            this.multiShotTimer -= deltaTime;
            if (this.multiShotTimer <= 0) this.isMultiShotActive = false;
        }

        // Activación Láser
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

        // Animaciones
        if (this.isShieldBreaking) this.shieldBreakTimer += deltaTime;

        if (this.isInvulnerable) {
            this.invulnerableTimer += deltaTime;
            if (this.damageType === 'hull') {
                this.flashTimer += deltaTime;
                if (this.flashTimer > this.flashInterval) {
                    this.isVisible = !this.isVisible;
                    this.flashTimer = 0;
                }
            }
            if (this.invulnerableTimer > this.invulnerableDuration) {
                this.isInvulnerable = false;
                this.isVisible = true;
                this.damageType = 'none';
            }
        }
    }

    shoot() {
        if (this.isMultiShotActive) {
            this.game.playerBullets.push(new Bullet(this.x, this.y - this.height / 2));
            this.game.playerBullets.push(new Bullet(this.x - 20, this.y - this.height / 4));
            this.game.playerBullets.push(new Bullet(this.x + 20, this.y - this.height / 4));
        } else {
            this.game.playerBullets.push(new Bullet(this.x, this.y - this.height / 2));
        }
    }

    draw(ctx) {
        if (this.isLaserActive) this.drawLaser(ctx);
        if (!this.isVisible) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        
// FORMA SEGURA (no crashea aunque Assets no exista aún)
let img = (typeof window.Assets !== 'undefined' && window.Assets.images) 
          ? window.Assets.images.playerShip // <-- ESTA PALABRA debe ser igual a la del main.js
          : null;
        if (img && img.complete) {
            ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = '#3b8e88';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        if (this.hasShield) {
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = '#3b8e88';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); 
            ctx.stroke();
            ctx.setLineDash([]); 
        }

        if (this.isShieldBreaking) {
            const progress = this.shieldBreakTimer / this.shieldBreakDuration;
            const expandRadius = (this.width * 0.8) + (progress * 40); 
            const alpha = 1 - progress; 
            ctx.beginPath();
            ctx.arc(0, 0, expandRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 142, 136, ${alpha})`;
            ctx.lineWidth = 4 * alpha; 
            ctx.stroke();
        }

        ctx.restore();
        this.drawLaserButton(ctx);
    }

    drawLaser(ctx) {
        ctx.save();
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, 0);
        gradient.addColorStop(0, '#3b8e88');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, 'rgba(59, 142, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 12, 0, 24, this.y);
        ctx.restore();
    }

    drawLaserButton(ctx) {
        ctx.save();
        ctx.translate(this.btnX, this.btnY);
        ctx.beginPath();
        ctx.arc(0, 0, this.btnSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 18, 16, 0.8)';
        ctx.fill();
        ctx.strokeStyle = this.isLaserReady ? '#3b8e88' : '#444';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (!this.isLaserReady) {
            const progress = this.laserCooldownTimer / this.laserCooldown;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, this.btnSize / 2 - 2, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
            ctx.fillStyle = 'rgba(59, 142, 136, 0.5)';
            ctx.fill();
        }
        ctx.fillStyle = this.isLaserReady ? '#fff' : '#666';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('LASER', 0, 5);
        ctx.restore();
    }
}