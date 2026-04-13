const EnemyConfigs = {
    grunt: {
        width: 48, height: 48, 
        hp: 2, 
        speed: 0.8, // 🔽 Antes 1.5 (Mucho más pausado)
        scoreValue: 10, 
        color: '#c94938', 
        imageKey: 'grunt', 
        fireRate: 2000, // 🐢 Disparo muy lento
        patterns: ['straightDive', 'zigzag'] 
    },
    striker: {
        width: 40, height: 50, 
        hp: 6, 
        speed: 1.5, // 🔽 Antes 2.5 (Rápido, pero controlable)
        scoreValue: 25, 
        color: '#e5a91a', 
        imageKey: 'striker', 
        fireRate: 750, // ⚡ Cadencia rápida
        patterns: ['diagonalCross', 'sweepPass']
    },
elite: {
        width: 80, // Un poco más grande para que se vea imponente
        height: 80, 
        hp: 35, // Un poco más tanque como pediste
        speed: 0.3, // Muy lento hacia abajo para que dure más en pantalla
        scoreValue: 150, 
        color: '#3b8e88', 
        imageKey: 'elite', 
        fireRate: 1800, // Tiempo entre cada ráfaga de abanico
        patterns: ['wideZigzag'] // <--- ASIGNAMOS EL NUEVO PATRÓN
    },
    boss_final: {
        width: 120, height: 120, hp: 300, speed: 0.3,
        scoreValue: 5000, color: '#ff0000',
        imageKey: 'boss_final',
        fireRate: 800,
        patterns: ['straightDive']
    }
};