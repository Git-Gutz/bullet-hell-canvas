document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Definir qué imágenes vamos a usar
    // IMPORTANTE: Pon la ruta correcta hacia tu imagen.
    // Ejemplo: '../images/player/nave.png' o './assets/images/player/nave.png'
    const imageSources = {
        playerShip: './assets/images/player/playerShip1_blue.png' // <--- CAMBIA ESTO POR TU RUTA
    };

    // 2. Elementos de UI
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnRestart = document.getElementById('btn-restart');

    // Deshabilitar Start mientras carga
    btnStart.disabled = true;
    btnStart.textContent = 'CARGANDO ASSETS...';

    // 3. Precargar imágenes y LUEGO inicializar el juego
    Assets.loadImages(imageSources, () => {
        
        // ¡Las imágenes ya cargaron! Habilitamos el botón
        btnStart.disabled = false;
        btnStart.textContent = 'INICIAR_SISTEMA';

        // Instanciamos el juego
        const game = new Game('gameCanvas');

        // Dibujar el primer frame para que no se vea negro
        game.draw();

        // 4. Configurar Eventos
        btnStart.addEventListener('click', () => {
            game.start();
            btnStart.disabled = true;
            btnPause.disabled = false;
            btnStart.textContent = 'EJECUTANDO...';
            btnStart.classList.replace('btn-arcade-success', 'btn-secondary');
        });

        btnPause.addEventListener('click', () => {
            game.togglePause();
            if (game.isPaused) {
                btnPause.textContent = 'REANUDAR';
                btnPause.classList.replace('btn-arcade-warning', 'btn-arcade-success');
            } else {
                btnPause.textContent = 'PAUSA';
                btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
            }
        });

        btnRestart.addEventListener('click', () => {
            location.reload();
        });
    });
});