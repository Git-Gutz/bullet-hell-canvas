class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // Dimensiones del láser
        this.width = 4;
        this.height = 20;
        
        // Velocidad (muy rápida hacia arriba)
        this.speed = 12; 
        
        // Bandera para el "Garbage Collector" (destruir cuando salga de pantalla)
        this.markedForDeletion = false;
    }

    update() {
        this.y -= this.speed; // Mover hacia arriba
        
        // Si la bala sale completamente por la parte superior del canvas, la marcamos
        if (this.y < 0 - this.height) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Diseño de la bala: Un plasma brillante color verde fósforo (Retro CRT)
        ctx.fillStyle = '#5cdb5c'; 
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#5cdb5c';
        
        // Centramos la bala respecto a su X
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
        
        ctx.restore();
    }
}