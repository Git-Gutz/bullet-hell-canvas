/**
 * ARCHIVO: assets/js/data/waveConfigs.js
 * DICCIONARIO DE HORDAS PREDEFINIDAS
 */

const WaveConfigs = {
    // --- HORDAS LIGERAS ---
    swarm_grunts_small: { enemies: [{ type: 'grunt', count: 10 }], interval: 1500 },
    swarm_grunts_large: { enemies: [{ type: 'grunt', count: 20 }], interval: 1200 },
    
    // --- HORDAS RÁPIDAS ---
    squad_strikers_light: { enemies: [{ type: 'striker', count: 8 }], interval: 1200 },
    squad_strikers_heavy: { enemies: [{ type: 'striker', count: 18 }], interval: 800 },

    // --- HORDAS MIXTAS ---
    mixed_patrol: { enemies: [{ type: 'grunt', count: 10 }, { type: 'striker', count: 5 }], interval: 1200 },
    mixed_assault: { enemies: [{ type: 'grunt', count: 15 }, { type: 'striker', count: 10 }], interval: 900 },
    
    // --- HORDAS BULLET HELL ---
    chaos_vanguard: { enemies: [{ type: 'grunt', count: 25 }, { type: 'striker', count: 15 }], interval: 700 },
    death_wall: { enemies: [{ type: 'grunt', count: 30 }, { type: 'striker', count: 25 }], interval: 500 },
    
    // --- ESCOLTAS DE JEFES ---
    boss_escort: { enemies: [{ type: 'elite', count: 2 }, { type: 'striker', count: 10 }], interval: 800 }
};