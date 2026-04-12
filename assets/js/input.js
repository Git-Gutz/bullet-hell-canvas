class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isSpacePressed = false;
        this.isButtonClicked = false;

        const getCanvasPos = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: (clientX - rect.left) * (this.canvas.width / rect.width),
                y: (clientY - rect.top) * (this.canvas.height / rect.height)
            };
        };

        // --- MOUSE (Sigue igual para PC) ---
        this.canvas.addEventListener('mousemove', (e) => {
            const pos = getCanvasPos(e.clientX, e.clientY);
            this.mouseX = pos.x;
            this.mouseY = pos.y;
        });
        this.canvas.addEventListener('mousedown', () => this.isButtonClicked = true);
        window.addEventListener('mouseup', () => this.isButtonClicked = false);

        // --- MULTI-TOUCH (La clave del arreglo) ---
        const handleTouch = (e) => {
            this.isButtonClicked = false; // Reset temporal

            // Recorremos todos los dedos que están tocando la pantalla
            for (let i = 0; i < e.touches.length; i++) {
                const pos = getCanvasPos(e.touches[i].clientX, e.touches[i].clientY);
                
                // Definimos el área del botón (mismos valores que en Player.js)
                const btnX = this.canvas.width - 100;
                const btnY = this.canvas.height - 100;
                const btnSize = 80;
                const distToBtn = Math.sqrt(Math.pow(pos.x - btnX, 2) + Math.pow(pos.y - btnY, 2));

                if (distToBtn < btnSize / 2) {
                    // Este dedo está tocando el botón
                    this.isButtonClicked = true;
                } else {
                    // Este dedo está moviendo la nave
                    this.mouseX = pos.x;
                    this.mouseY = pos.y;
                }
            }
            if (e.target === this.canvas) e.preventDefault();
        };

        this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouch, { passive: false });
        this.canvas.addEventListener('touchend', (e) => {
            // Si no quedan dedos, dejamos de disparar el botón
            if (e.touches.length === 0) this.isButtonClicked = false;
            // Si queda algún dedo, recalculamos posiciones
            else handleTouch(e);
        }, { passive: false });

        // Teclado
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.isSpacePressed = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this.isSpacePressed = false;
        });
    }
}