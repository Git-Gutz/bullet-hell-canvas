/**
 * ARCHIVO: assets/js/data/levelConfigs.js
 * CAMPAÑA PRINCIPAL: 10 Niveles
 */

const LevelConfigs = [
    {
        name: "NIVEL 1: INICIACIÓN",
        waves: ['swarm_grunts_small'] 
    },
    {
        name: "NIVEL 2: INTERCEPTACIÓN",
        waves: ['swarm_grunts_small', 'squad_strikers_light']
    },
    {
        name: "NIVEL 3: PRIMER CONTACTO",
        waves: ['mixed_patrol'],
        eliteWave: { type: 'elite', count: 1 } 
    },
    {
        name: "NIVEL 4: ENJAMBRE",
        waves: ['squad_strikers_heavy']
    },
    {
        name: "NIVEL 5: LÍNEA DE DEFENSA",
        waves: ['swarm_grunts_large', 'mixed_assault'],
        eliteWave: { type: 'elite', count: 1 }
    },
    {
        name: "NIVEL 6: VANGUARDIA PESADA",
        waves: ['mixed_assault', 'squad_strikers_light'],
        eliteWave: { type: 'elite', count: 2 } 
    },
    {
        name: "NIVEL 7: CAOS TÁCTICO",
        waves: ['chaos_vanguard']
    },
    {
        name: "NIVEL 8: BARRERA DE ACERO",
        waves: ['mixed_assault', 'squad_strikers_heavy'],
        eliteWave: { type: 'elite', count: 3 } 
    },
    {
        name: "NIVEL 9: PURGA TOTAL",
        waves: ['death_wall'],
        eliteWave: { type: 'elite', count: 3 }
    },
    {
        name: "NIVEL 10: EL NÚCLEO",
        waves: ['boss_escort'],
        boss: { type: 'boss_final', hp: 300, name: "AUTOMATA CORE" }
    }
];