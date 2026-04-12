class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isSpacePressed = false;
        this.isButtonClicked = false;

        // Función para calcular la posición real
        const updatePos = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            // Escalamos la posición del mouse al tamaño interno del canvas
            this.mouseX = (clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (clientY - rect.top) * (this.canvas.height / rect.height);
        };

        // Eventos de Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            updatePos(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('mousedown', () => this.isButtonClicked = true);
        window.addEventListener('mouseup', () => this.isButtonClicked = false);

        // Eventos de Touch (Móvil)
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                updatePos(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault(); // Evita scroll
        }, { passive: false });

        this.canvas.addEventListener('touchstart', (e) => {
            this.isButtonClicked = true;
            if (e.touches.length > 0) {
                updatePos(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => this.isButtonClicked = false);

        // Teclado
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.isSpacePressed = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this.isSpacePressed = false;
        });
    }
}