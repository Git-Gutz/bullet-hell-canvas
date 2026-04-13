🚀 HELLFRAME - OS
Terminal de Combate Táctico Retro-Futurista
Proyecto de Ingeniería en Sistemas Computacionales | I.T. Pachuca

🛰️ Resumen del Proyecto
HELLFRAME es un videojuego de disparos en 2D (SHMUP) desarrollado bajo el paradigma de programación orientada a objetos en Vanilla JavaScript. El proyecto rinde homenaje a la estética de las terminales industriales de los años 90 y a la interfaz de usuario de Zenless Zone Zero, integrando efectos de post-procesamiento analógico y una arquitectura de audio adaptativa.

El jugador asume el rol de un operador de terminal encargado de neutralizar 10 oleadas de incursiones enemigas, culminando en la supresión del Automata Core (Jefe Final).

🛠️ Stack Tecnológico
Lenguaje: JavaScript (ES6+) - Motor desarrollado desde cero sin frameworks externos.

Renderizado: HTML5 Canvas API para gráficos de alto rendimiento a 60 FPS.

Estilos: CSS3 Avanzado (Variables dinámicas, Grid, Flexbox y Filtros de post-procesamiento).

Persistencia: Web Storage API (LocalStorage) para la gestión de récords locales.

Audio: Lógica de reproducción síncrona con bypass de las políticas de Autoplay del navegador.

🕹️ Características de Ingeniería
Simulación CRT: Capa de post-procesamiento con scanlines (líneas de escaneo) y viñeteado dinámico para una experiencia visual de tubo de rayos catódicos.

Game Feel (Juice): Implementación de Screen Shake (temblor de cámara) mediante transformaciones CSS y Hit Flashing para retroalimentación táctil de impactos.

Audio Adaptativo: Sistema de gestión de pistas basado en estados que transiciona dinámicamente entre el Menú (Future Funk), Combate, Boss y Victoria.

WaveManager Inteligente: Sistema de gestión de hordas que controla intervalos de spawn, tipos de enemigos y eventos de jefe de forma secuencial.

Persistencia de High Score: Guardado automático de la puntuación máxima del usuario en la memoria persistente del cliente.

🎮 Operación de la Terminal
Movimiento: Teclas W, A, S, D o Flechas de Dirección.

Disparo: Barra Espaciadora (Space).

Interfaz: Panel lateral interactivo con estados de Pausa, Reinicio y Selección de Nivel.

📂 Arquitectura del Directorio
Bash
HELLFRAME/
├── assets/
│   ├── css/        
│   │   └── styles.css      # Estilos de terminal y paleta "Random Play"
│   ├── js/         
│   │   ├── entities/       # Clases: Player, Enemy, Boss, Bullets, PowerUps
│   │   ├── core/           # WaveManager y Configs (Niveles/Enemigos)
│   │   └── main.js         # Punto de entrada y gestión de Audio/UI
│   ├── audio/              # Soundtrack y efectos atmosféricos
│   └── images/             # Spritesheets y fondos estáticos
├── index.html              # Estructura de la terminal y CRT Overlay
└── README.md               # Documentación técnica
👷 Desarrollador
Leonardo * Institución: Instituto Tecnológico de Pachuca

Carrera: Ingeniería en Sistemas Computacionales

Fecha: Abril, 2026

🔧 Instrucciones de Implementación
Descargue el repositorio completo.

Ejecute el archivo index.html en un navegador web (Chrome o Edge recomendados).

Nota sobre Audio: Debido a las políticas de seguridad del navegador, se requiere una interacción inicial (clic en cualquier parte de la terminal) para inicializar el núcleo de audio de HELLFRAME.