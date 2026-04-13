/**
 * ARCHIVO: assets/js/main.js
 * FASE: 11 (Punto de Entrada + Selector de Niveles Dinámico)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Definición de Assets (Llaves sincronizadas con EnemyConfigs)
    const imageSources = {
        playerShip: './assets/images/player/playerShip1_blue.png',
        grunt: './assets/images/enemies/grunt.png',
        striker: './assets/images/enemies/striker.png',
        elite: './assets/images/enemies/elite.png',
        boss_final: './assets/images/enemies/boss_core.png' // <--- Clave para el Nivel 10
    };

    // 2. Elementos de UI
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnRestart = document.getElementById('btn-restart');
    const levelContainer = document.getElementById('level-buttons-container');

    // Estado inicial de carga
    btnStart.disabled = true;
    btnStart.textContent = 'CARGANDO_SISTEMA...';

    // 3. Precarga de Imágenes
    window.Assets.loadImages(imageSources, () => {
        
        // Assets listos, habilitamos controles principales
        btnStart.disabled = false;
        btnStart.textContent = 'INICIAR_SISTEMA';

        // Instanciamos el motor del juego
        const game = new Game('gameCanvas');

        // Dibujar frame inicial (Splash screen estático)
        game.draw();

        // --- GENERADOR DINÁMICO DE SELECTOR DE NIVELES ---
        if (levelContainer) {
            LevelConfigs.forEach((level, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn-level-select'; // Asegúrate de tener el CSS que te pasé
                btn.textContent = `F-${index + 1}`;
                btn.title = level.name;

                btn.addEventListener('click', () => {
                    // Salto de nivel mediante el WaveManager
                    game.waveManager.goToLevel(index);
                    
                    // Si el juego estaba detenido, lo arrancamos automáticamente
                    if (!game.isRunning) {
                        game.start();
                        updatePlayButtons();
                    }
                    
                    console.log(`[DEBUG] Salto manual a: ${level.name}`);
                });

                levelContainer.appendChild(btn);
            });
        }

        // 4. Configuración de Eventos de Control
        const updatePlayButtons = () => {
            btnStart.disabled = true;
            btnPause.disabled = false;
            btnStart.textContent = 'EJECUTANDO...';
            btnStart.classList.replace('btn-arcade-success', 'btn-secondary');
        };

        btnStart.addEventListener('click', () => {
            game.start();
            updatePlayButtons();
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
            // Reinicio físico del sistema
            location.reload();
        });
    });
});