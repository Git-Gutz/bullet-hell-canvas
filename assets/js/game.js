class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;

        // 1. Instanciamos los Controles y al Jugador
        this.input = new InputHandler(this.canvas);
        this.player = new Player(this);

        this.stars = [];
        this.initBackground();
    }

    initBackground() {
        // Generamos 100 partículas para dar la sensación de avance
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2.5 + 0.5, // Tamaños variados
                speed: Math.random() * 3 + 1      // Velocidades variadas para dar profundidad (Parallax)
            });
        }
    }

    // --- MÉTODOS DE CONTROL ---

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            // Arrancamos el ciclo de juego
            requestAnimationFrame((timestamp) => this.loop(timestamp));
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
    }

    stop() {
        this.isRunning = false;
    }

    // --- EL GAME LOOP ---

    loop(timestamp) {
        // Si el juego se detiene por completo, salimos del ciclo
        if (!this.isRunning) return;

        // Calculamos el Delta Time (tiempo entre fotogramas)
        let deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Actualizamos lógica y dibujamos gráficos
        this.update(deltaTime);
        this.draw();

        // Pedimos al navegador el siguiente fotograma
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    // --- LÓGICA Y RENDERIZADO ---

    update(deltaTime) {
        if (this.isPaused) return;

        // Actualizar fondo
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });

        // 2. Actualizar posición de la nave basada en el input
        this.player.update(this.input);
    }

    draw() {
        // Limpiar pantalla
        this.ctx.fillStyle = '#0f1210';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Dibujar estrellas
        this.ctx.fillStyle = 'rgba(255, 184, 0, 0.6)';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size * 2);
        });

        // 3. Dibujar la nave
        this.player.draw(this.ctx);

        // Dibujar pausa encima de todo
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#3b8e88';
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SISTEMA EN PAUSA', this.width / 2, this.height / 2);
        }
    }
}