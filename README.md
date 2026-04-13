<div align="center">

# 💀 HELLFRAME  
## OS[ TERMINAL DE DEFENSA TÁCTICA v1.0 ]

**Proyecto de Ingeniería en Sistemas Computacionales**  
**Instituto Tecnológico de Pachuca**

*"En el corazón de la terminal, solo queda el código y el acero."*

</div>

---

# 🛰️ REPORTE DE SISTEMA

**HELLFRAME** es un simulador de combate balístico en 2D desarrollado íntegramente en **Vanilla JavaScript**.  
El sistema emula una terminal de control industrial de los años 90, integrando post-procesamiento visual CRT y mecánicas de audio adaptativo.

El operador debe purgar el núcleo de **10 incursiones de virus autónomos**, culminando en la supresión del **Automata Core (Jefe Final)**.

---

# 🛠️ ESPECIFICACIONES TÉCNICAS

| Módulo | Tecnología | Implementación |
|--------|------------|----------------|
| Núcleo de Renderizado | HTML5 Canvas | 60 FPS estables con POO |
| Arquitectura de Audio | Web Audio API | Bypass de Autoplay y Mix adaptativo |
| Post-procesamiento | CSS3 / Filters | Scanlines, Viñeteado y Glitch FX |
| Memoria Persistente | LocalStorage | Guardado de High Score local |
| Físicas de Impacto | JS Custom Engine | Screen Shake y Hit Flashing |

---

# 🕹️ PROTOCOLO DE MANIOBRA

Usa los siguientes comandos para operar la unidad de defensa:

| Acción | Comando |
|--------|---------|
| Navegación | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> o <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> |
| Fuego de Supresión | <kbd>Espacio</kbd> |
| Gestión de Energía | Panel Lateral de Terminal |

---

# 📁 ESTRUCTURA DE LA TERMINAL

```bash
📂 HELLFRAME
 ┣ 📂 assets
 ┃ ┣ 📂 css
 ┃ ┃ ┗ 📜 styles.css      # Filtros CRT y Paleta "Random Play"
 ┃ ┣ 📂 js
 ┃ ┃ ┣ 📂 entities        # Jugador, Enemigos, Boss y Balas
 ┃ ┃ ┣ 📂 core            # WaveManager y Configuración de Niveles
 ┃ ┃ ┗ 📜 main.js         # Orquestador de Audio y UI
 ┃ ┣ 📂 audio             # Soundtrack Future Funk / Industrial
 ┃ ┗ 📂 images            # Visual Assets y Backgrounds
 ┣ 📜 index.html          # Interfaz de Usuario y Canvas
 ┗ 📜 README.md           # Documentación Técnica