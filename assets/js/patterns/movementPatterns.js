// Diccionario de funciones de movimiento (Estrategias Matemáticas)
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

    // 3. Zig-Zag perfecto (Se adapta si viene de arriba o de lado)
    zigzag: (enemy) => {
        // Inicializar el centro de gravedad solo en el primer frame
        if (enemy.dynamicCenterX === undefined) {
            enemy.dynamicCenterX = enemy.startX;
            
            // Si cae de arriba (vx == 0), lo alejamos de las paredes para que no se salga
            if (enemy.vx === 0) {
                let amplitude = 100;
                let safeMargin = amplitude + enemy.width / 2;
                if (enemy.dynamicCenterX < safeMargin) enemy.dynamicCenterX = safeMargin;
                if (enemy.dynamicCenterX > enemy.game.width - safeMargin) enemy.dynamicCenterX = enemy.game.width - safeMargin;
            }
        }
        
        // Movemos el centro de gravedad (Si viene de lado, cruza la pantalla)
        enemy.dynamicCenterX += enemy.vx;
        
        // Aplicamos el movimiento final
        enemy.y += enemy.vy;
        enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.003) * 100;
    },

    // 4. Baja, se queda quieto disparando, y huye hacia arriba
    hoverAndRetreat: (enemy) => {
        // Baja hasta una altura específica
        if (enemy.y < 200 && !enemy.retreating) {
            enemy.y += enemy.vy; 
            enemy.x += enemy.vx; // Mantiene su avance si viene de lado
        } else {
            enemy.retreating = true;
            enemy.hoverTime = (enemy.hoverTime || 0) + 1;

            if (enemy.dynamicCenterX === undefined) {
                enemy.dynamicCenterX = enemy.x; // Guarda donde se detuvo
            }

            // Tiembla/flota en su lugar
            enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.02) * 15;

            // Después de ~2 segundos, huye rápido hacia arriba
            if (enemy.hoverTime > 120) {
                enemy.y -= enemy.vy * 1.5; 
            }
        }
    },

    // 5. Un arco muy amplio que barre casi toda la pantalla
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
        enemy.y += enemy.vy * 0.7; // Cae más lento para que luzca el barrido
        enemy.x = enemy.dynamicCenterX + Math.sin(enemy.timeAlive * 0.0015) * 250;
    }
};