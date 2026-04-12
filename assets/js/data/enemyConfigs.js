// Data ONLY: Define la identidad y comportamiento base de cada enemigo
const EnemyConfigs = {
    grunt: {
        width: 48, height: 48, hp: 2, speed: 1.5, scoreValue: 10, 
        color: '#c94938', imageKey: 'enemyGrunt', fireRate: 2000,
        patterns: ['straightDive', 'zigzag'] // Patrones simples
    },
    striker: {
        width: 40, height: 50, hp: 4, speed: 2.5, scoreValue: 20, 
        color: '#e5a91a', imageKey: 'enemyStriker', fireRate: 1500,
        patterns: ['diagonalCross', 'sweepPass'] // Patrones agresivos y amplios
    },
    elite: {
        width: 64, height: 64, hp: 10, speed: 1.0, scoreValue: 50, 
        color: '#3b8e88', imageKey: 'enemyElite', fireRate: 1000,
        patterns: ['hoverAndRetreat'] // Patrones de control/bloqueo
    }
};