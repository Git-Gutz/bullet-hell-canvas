/**
 * ARCHIVO: assets/js/main.js
 * FASE: 14 (Gestión Atmosférica de Audio y Navegación de Terminal - FINAL)
 * PROYECTO: HELLFRAME - I.T. Pachuca
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. DEFINICIÓN DE ASSETS (Rutas sincronizadas)
    const imageSources = {
        playerShip: './assets/images/player/playerShip1_blue.png',
        grunt: './assets/images/enemies/grunt.png',
        striker: './assets/images/enemies/striker.png',
        elite: './assets/images/enemies/elite.png',
        boss_final: './assets/images/bosses/boss_core.png',
        drone: './assets/images/powerups/drone_support.png'
    };

    // 2. ELEMENTOS DE AUDIO (Música Atmosférica)
    const musicTracks = {
        menu: document.getElementById('music-menu'),
        combat: document.getElementById('music-combat'),
        boss: document.getElementById('music-boss'),
        victory: document.getElementById('music-victory') // 🚩 NUEVA LÍNEA AÑADIDA
    };

    // 3. ELEMENTOS DE LA INTERFAZ (UI)
    const startScreen = document.getElementById('screen-start');
    const btnStartGame = document.getElementById('btn-start-game');
    const btnAudio = document.getElementById('btn-toggle-audio');
    const audioStatusText = document.getElementById('audio-status');

    // Botones de la Sidebar (Panel Lateral)
    const btnPause = document.getElementById('btn-pause');
    const btnRestart = document.getElementById('btn-restart');
    const btnToMenu = document.getElementById('btn-to-menu');
    const levelContainer = document.getElementById('level-buttons-container');

    // 4. GESTIÓN DE AUDIO DINÁMICO
    let isGlobalMuted = false;

    const playTrack = (trackKey) => {
        // Detener todas las pistas antes de cambiar
        Object.values(musicTracks).forEach(track => {
            if (track) {
                track.pause();
                track.currentTime = 0;
            }
        });

        const selectedTrack = musicTracks[trackKey];
        if (selectedTrack) {
            selectedTrack.muted = isGlobalMuted;
            selectedTrack.play().catch(() => {
                // Silenciamos la advertencia normal del navegador para mantener la consola limpia
            });
        }
    };

    // Exportar para que WaveManager pueda llamar a la música del Boss
    window.switchMusic = playTrack;

    // ==========================================
// ⚡ SISTEMA DE GAME FEEL (SCREEN SHAKE Y FLASH)
// ==========================================

// 1. Temblor de Cámara
window.triggerShake = (intensity = 5, duration = 200) => {
    const canvas = document.getElementById('gameCanvas');
    let startTime = performance.now();

    const shakeLoop = (currentTime) => {
        const elapsed = currentTime - startTime;
        if (elapsed < duration) {
            // Genera coordenadas aleatorias basadas en la intensidad
            const dx = (Math.random() - 0.5) * intensity * 2;
            const dy = (Math.random() - 0.5) * intensity * 2;
            canvas.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(shakeLoop);
        } else {
            // Reinicia la posición al terminar
            canvas.style.transform = 'translate(0px, 0px)'; 
        }
    };
    requestAnimationFrame(shakeLoop);
};

// 2. Destello Visual (Hit Flash)
window.triggerFlash = (colorType = 'red', duration = 150) => {
    const canvas = document.getElementById('gameCanvas');
    
    // Usamos filtros CSS nativos para un rendimiento óptimo
    if (colorType === 'red') {
        canvas.style.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)';
    } else if (colorType === 'white') {
        canvas.style.filter = 'brightness(5) contrast(1.2)';
    }

    setTimeout(() => {
        canvas.style.filter = 'none';
    }, duration);
};

    // 5. INICIALIZACIÓN DEL MOTOR
    const game = new Game('gameCanvas');

    if (btnStartGame) {
        btnStartGame.textContent = 'CARGANDO_NÚCLEO...';
    }

    // --- 🎧 EL TRUCO DEL CLIC INVISIBLE (Bypass de Autoplay) ---
    let audioDesbloqueado = false;
    
    const romperBloqueoDeAudio = () => {
        if (!audioDesbloqueado) {
            audioDesbloqueado = true;
            
            // Si el jugador aún no ha entrado a la partida, ponemos la música del menú
            if (!game.isRunning) {
                playTrack('menu');
            }
            
            // Destruimos el "escucha" para que no consuma memoria el resto del juego
            document.removeEventListener('click', romperBloqueoDeAudio);
            document.removeEventListener('keydown', romperBloqueoDeAudio);
            console.log(" [SISTEMA] Bloqueo de navegador superado. Audio en línea.");
        }
    };

    // Escuchamos el primer clic o tecla en absolutamente cualquier parte de la página
    document.addEventListener('click', romperBloqueoDeAudio);
    document.addEventListener('keydown', romperBloqueoDeAudio);


    // 6. PRECARGA Y FLUJO DE JUEGO
    window.Assets.loadImages(imageSources, () => {
        console.log(" [SISTEMA] Assets en memoria. HELLFRAME Online.");

        if (btnStartGame) {
            btnStartGame.textContent = 'INICIAR SECUENCIA';
        }

        // Intentamos reproducir el menú por si el navegador lo permite
        playTrack('menu');
        game.draw();

        // --- INICIAR JUEGO ---
        btnStartGame.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            
            playTrack('combat'); // Cambio a música de combate
            game.start();
        });

        // --- PAUSA (SIDEBAR) ---
        btnPause.addEventListener('click', () => {
            // Si el juego no está corriendo, el botón hace "clic" visualmente
            // pero salimos de la función sin hacer nada en el motor.
            if (!game.isRunning) return;

            game.togglePause();

            // Solo cambiamos el texto/color si el juego SI está en marcha
            btnPause.textContent = game.isPaused ? 'REANUDAR' : 'PAUSA';
            if (game.isPaused) {
                btnPause.classList.replace('btn-arcade-warning', 'btn-arcade-success');
            } else {
                btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
            }
        });

        // --- REINICIAR FASE (Instantáneo) ---
        btnRestart.addEventListener('click', () => {
            document.getElementById('screen-victory').classList.add('hidden');
            document.getElementById('screen-game-over').classList.add('hidden');

            playTrack('combat'); // Asegurar que suena la música de combate al reiniciar
            game.resetLevel();

            btnPause.textContent = 'PAUSA';
            btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');
        });

        // --- VOLVER AL MENÚ PRINCIPAL ---
        if (btnToMenu) {
            btnToMenu.addEventListener('click', () => {
                game.returnToMenu();

                document.getElementById('screen-victory').classList.add('hidden');
                document.getElementById('screen-game-over').classList.add('hidden');
                startScreen.classList.remove('hidden');

                // Reseteamos el texto y el color, pero dejamos vivo el botón
                btnPause.textContent = 'PAUSA';
                btnPause.classList.replace('btn-arcade-success', 'btn-arcade-warning');

                playTrack('menu');
                console.log(" [SISTEMA] Regresando a la terminal de inicio.");
            });
        }

        // --- CONTROL DE AUDIO (MUTE) ---
        btnAudio.addEventListener('click', () => {
            isGlobalMuted = !isGlobalMuted;
            Object.values(musicTracks).forEach(track => {
                if (track) track.muted = isGlobalMuted;
            });

            audioStatusText.textContent = isGlobalMuted ? 'OFF' : 'ON';
            btnAudio.style.borderColor = isGlobalMuted ? '#c94938' : '#3b8e88';
        });

        // --- SELECTOR DE NIVELES ---
        if (levelContainer) {
            LevelConfigs.forEach((level, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn-level-select';
                btn.textContent = `F-${index + 1}`;

                btn.addEventListener('click', () => {
                    if (!game.isRunning) {
                        startScreen.classList.add('hidden');
                        game.start(); 
                    }

                    // Si saltamos a la última fase (Boss), activamos su música
                    if (index === LevelConfigs.length - 1) {
                        playTrack('boss');
                    } else {
                        playTrack('combat');
                    }

                    game.waveManager.goToLevel(index);
                });
                levelContainer.appendChild(btn);
            });
        }
    });
});