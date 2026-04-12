class InputHandler {
    constructor(canvas) {
        // Empezamos en el centro de la parte inferior
        this.mouseX = canvas.width / 2;
        this.mouseY = canvas.height - 50;
        this.isFiringLaser = false; // Lo usaremos en el futuro para el poder especial

        // Evento para PC (Mouse)
        canvas.addEventListener('mousemove', (e) => {
            this.updateCoordinates(e.clientX, e.clientY, canvas);
        });

        // Eventos para Móviles (Pantalla táctil)
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Evita que la pantalla intente hacer scroll al jugar
            this.updateCoordinates(e.touches[0].clientX, e.touches[0].clientY, canvas);
        }, { passive: false });

        // Eventos de teclado (Para el láser más adelante)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.isFiringLaser = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') this.isFiringLaser = false;
        });
    }

    // Calcula la posición real dentro del lienzo de 900x600, sin importar cómo el CSS lo haya encogido
    updateCoordinates(clientX, clientY, canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        this.mouseX = (clientX - rect.left) * scaleX;
        this.mouseY = (clientY - rect.top) * scaleY;
    }
}