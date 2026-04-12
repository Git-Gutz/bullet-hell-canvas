// Esperamos a que todo el HTML cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Instanciar el Juego
    const game = new Game('gameCanvas');

    // 2. Capturar Elementos de la UI
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnRestart = document.getElementById('btn-restart');

    // 3. Configurar Eventos (Listeners)

    // Botón Iniciar Sistema
    btnStart.addEventListener('click', () => {
        game.start();
        
        // Actualizar UI: Apagar botón Start, encender botón Pause
        btnStart.disabled = true;
        btnPause.disabled = false;
        
        // Opcional: Cambiar texto para dar feedback
        btnStart.textContent = 'EJECUTANDO...';
        btnStart.classList.replace('btn-arcade-success', 'btn-secondary');
    });

    // Botón Pausa
    btnPause.addEventListener('click', () => {
        game.togglePause();
        
        // Cambiar el texto y el color del botón según el estado
        if (game.isPaused) {
            btnPause.textContent = 'REANUDAR';
            btnPause.classList.replace('btn-arcade-warning', 'btn-arcade-success');
        } else {
            btnPause.textContent = 'PAUSA';
            btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
        }
    });

    // Botón Reiniciar
    btnRestart.addEventListener('click', () => {
        // Por ahora solo recargará la página para un "hard reset" rápido.
        // Más adelante programaremos un reinicio suave de variables.
        location.reload();
    });

    // 4. (Opcional) Dibujar un frame inicial para que no se vea negro puro antes de iniciar
    game.draw();
});