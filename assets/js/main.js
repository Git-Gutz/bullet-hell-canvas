/**
 * ARCHIVO: assets/js/main.js
 * FASE: 13 (Game Flow, Menú HELLFRAME y Gestión de Audio)
 * PROYECTO: HELLFRAME - I.T. Pachuca
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. DEFINICIÓN DE ASSETS
    const imageSources = {
        playerShip: './assets/images/player/playerShip1_blue.png',
        grunt: './assets/images/enemies/grunt.png',
        striker: './assets/images/enemies/striker.png',
        elite: './assets/images/enemies/elite.png',
        boss_final: './assets/images/bosses/boss_core.png',
        drone: './assets/images/powerups/drone_support.png'
    };

    // 2. ELEMENTOS DE LA INTERFAZ (UI)
    const startScreen = document.getElementById('screen-start');
    const btnStartGame = document.getElementById('btn-start-game');
    const btnAudio = document.getElementById('btn-toggle-audio');
    const audioStatusText = document.getElementById('audio-status');
    const bgMusic = document.getElementById('bg-music');

    // Botones de la Sidebar
    const btnPause = document.getElementById('btn-pause');
    const btnRestart = document.getElementById('btn-restart');
    const btnToMenu = document.getElementById('btn-to-menu'); // Nuevo botón
    const levelContainer = document.getElementById('level-buttons-container');

    // 3. INICIALIZACIÓN DEL MOTOR
    const game = new Game('gameCanvas');

    if (btnStartGame) {
        btnStartGame.disabled = true;
        btnStartGame.textContent = 'CARGANDO_SISTEMA...';
    }

    // 4. PRECARGA DE IMÁGENES
    window.Assets.loadImages(imageSources, () => {
        console.log(" [SISTEMA] Assets cargados. HELLFRAME listo.");
        
        if (btnStartGame) {
            btnStartGame.disabled = false;
            btnStartGame.textContent = 'INICIAR SECUENCIA';
        }

        // Dibujar frame inicial (Splash screen)
        game.draw();

        // --- LÓGICA DE INICIO (MENÚ CENTRAL) ---
        btnStartGame.addEventListener('click', () => {
            startScreen.classList.add('hidden'); 
            btnPause.disabled = false;
            
            if (bgMusic) {
                bgMusic.play().catch(() => console.warn("Interacción requerida para audio."));
            }
            
            game.start();
        });

        // --- LÓGICA DE PAUSA (SIDEBAR) ---
        btnPause.addEventListener('click', () => {
            if (!game.isRunning) return;
            game.togglePause();
            
            btnPause.textContent = game.isPaused ? 'REANUDAR' : 'PAUSA';
            if (game.isPaused) {
                btnPause.classList.replace('btn-arcade-warning', 'btn-arcade-success');
            } else {
                btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
            }
        });

        // --- LÓGICA DE REINICIAR FASE (SIDEBAR - Sin notificaciones) ---
        btnRestart.addEventListener('click', () => {
            // Ocultamos overlays de fin de juego por si se reinicia desde ahí
            document.getElementById('screen-victory').classList.add('hidden');
            document.getElementById('screen-game-over').classList.add('hidden');
            
            // Reinicio instantáneo sin confirm() molesto
            game.resetLevel();
            
            // Resetear estado del botón de pausa
            btnPause.textContent = 'PAUSA';
            btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
        });

        // --- LÓGICA DE VOLVER AL MENÚ (NUEVO) ---
        if (btnToMenu) {
            btnToMenu.addEventListener('click', () => {
                // Detenemos lógica y limpiamos entidades
                game.returnToMenu();
                
                // Limpiamos cualquier overlay visible
                document.getElementById('screen-victory').classList.add('hidden');
                document.getElementById('screen-game-over').classList.add('hidden');
                
                // Mostramos la pantalla de inicio sólida
                startScreen.classList.remove('hidden');
                
                // Deshabilitamos controles laterales
                btnPause.disabled = true;
                btnPause.textContent = 'PAUSA';
                btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
                
                console.log(" [SISTEMA] Regresando a la terminal de inicio.");
            });
        }

        // --- CONTROL DE AUDIO ---
        let isMuted = false;
        btnAudio.addEventListener('click', () => {
            isMuted = !isMuted;
            if (bgMusic) bgMusic.muted = isMuted;
            audioStatusText.textContent = isMuted ? 'OFF' : 'ON';
            btnAudio.style.borderColor = isMuted ? '#c94938' : '#3b8e88';
        });

        // --- SELECTOR DE NIVELES DINÁMICO ---
        if (levelContainer) {
            LevelConfigs.forEach((level, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn-level-select';
                btn.textContent = `F-${index + 1}`;
                
                btn.addEventListener('click', () => {
                    if (!game.isRunning) {
                        startScreen.classList.add('hidden');
                        btnPause.disabled = false;
                        game.start();
                    }
                    game.waveManager.goToLevel(index);
                });
                levelContainer.appendChild(btn);
            });
        }
    });
});