/**
 * ARCHIVO: assets/js/patterns/movementPatterns.js
 * FASE: 11 (Estrategias de Movimiento Matemático)
 * Diccionario de funciones de movimiento para enemigos autónomos.
 */

const MovementPatterns = {
    
    // 1. Cae en línea recta o cruza simple
    straightDive: (enemy) => {
        enemy.y += enemy.vy;
        enemy.x += enemy.vx;
    },

    // 2. Cruza la pantalla en diagonal
    diagonalCross: (enemy) => {
        enemy.y += enemy.vy;
        enemy.x += enemy.vx; 
    },

    // 3. Zig-Zag estándar (Ideal para Grunts)
    zigzag: (enemy) => {
        if (enemy.dynamicCenterX === undefined) {
            enemy.dynamicCenterX = enemy.startX;
            
            if (enemy.vx === 0) {
                let amplitude = 100;
                let safeMargin = amplitude + enemy.width / 2;
                if (enemy.dynamicCenterX < safeMargin) enemy.dynamicCenterX = safeMargin;
                if (enemy.dynamicCenterX > enemy.game.width - safeMargin) enemy.dynamicCenterX = enemy.game.width - safeMargin;
            }
        }
        
        enemy.dynamicCenterX += enemy.vx;
        enemy.y += enemy.vy;
        // Frecuencia 0.003 es equilibrada para enemigos pequeños
        enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.003) * 100;
    },

    // 4. Zig-Zag Amplio y Lento (Diseñado para el ELITE)
    wideZigzag: (enemy) => {
        const amplitude = 300; // Lo definimos arriba para calcular los márgenes
        const frequency = 0.001;

        if (enemy.dynamicCenterX === undefined) {
            enemy.dynamicCenterX = enemy.startX;
            
            // --- NUEVO: CÁLCULO DE MÁRGENES SEGUROS ---
            // Aseguramos que el centro de su zigzag nunca esté tan cerca del borde
            // como para que la amplitud lo saque de la pantalla.
            let safeMargin = amplitude + (enemy.width / 2);
            
            // Si el canvas es muy pequeño, reducimos la amplitud dinámicamente
            if (safeMargin > enemy.game.width / 2) {
                safeMargin = enemy.game.width / 2;
            }

            // Aplicamos la restricción (Clamp)
            if (enemy.dynamicCenterX < safeMargin) {
                enemy.dynamicCenterX = safeMargin;
            }
            if (enemy.dynamicCenterX > enemy.game.width - safeMargin) {
                enemy.dynamicCenterX = enemy.game.width - safeMargin;
            }
        }

        // Descenso muy pausado
        enemy.y += enemy.vy;

        // Oscilación horizontal masiva, pero ahora respetando los bordes
        enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * frequency) * amplitude;

        // Rotación estética
        enemy.rotation = Math.cos(enemy.timeAlive * frequency) * 0.25;
    },
    // 5. Baja, se queda quieto disparando, y huye hacia arriba
    hoverAndRetreat: (enemy) => {
        if (enemy.y < 200 && !enemy.retreating) {
            enemy.y += enemy.vy; 
            enemy.x += enemy.vx;
        } else {
            enemy.retreating = true;
            enemy.hoverTime = (enemy.hoverTime || 0) + 1;

            if (enemy.dynamicCenterX === undefined) {
                enemy.dynamicCenterX = enemy.x;
            }

            // Tiembla ligeramente mientras carga energía (0.02 es vibración intencional)
            enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.02) * 15;

            // Después de ~2 segundos (120 frames), huye hacia arriba
            if (enemy.hoverTime > 120) {
                enemy.y -= enemy.vy * 1.5; 
            }
        }
    },

    // 6. Arco muy amplio (Barrido de pantalla)
    sweepPass: (enemy) => {
        if (enemy.dynamicCenterX === undefined) {
            enemy.dynamicCenterX = enemy.startX;
            
            if (enemy.vx === 0) {
                let amplitude = 250;
                let safeMargin = amplitude + enemy.width / 2;
                if (enemy.dynamicCenterX < safeMargin) enemy.dynamicCenterX = safeMargin;
                if (enemy.dynamicCenterX > enemy.game.width - safeMargin) enemy.dynamicCenterX = enemy.game.width - safeMargin;
            }
        }
        
        enemy.dynamicCenterX += enemy.vx;
        enemy.y += enemy.vy * 0.7; // Cae más lento
        enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.0015) * 250;
    }
};