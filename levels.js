// Конфиги платформенных мини-уровней

export const LEVELS = [
    {
        id: 'level1',
        name: 'Парк развлечений',
        width: 1920,
        height: 540,
        bgColor: '#87CEEB',
        playerStart: { x: 80, y: 400 },
        goal: { x: 1800, y: 340, width: 40, height: 100 },
        platforms: [
            // Земля
            { x: 0, y: 500, width: 1920, height: 40, color: '#8BC34A', type: 'ground' },
            // Платформы
            { x: 200, y: 420, width: 120, height: 20, color: '#795548' },
            { x: 400, y: 360, width: 100, height: 20, color: '#795548' },
            { x: 580, y: 300, width: 120, height: 20, color: '#795548' },
            { x: 780, y: 380, width: 100, height: 20, color: '#795548' },
            { x: 960, y: 320, width: 140, height: 20, color: '#795548' },
            { x: 1180, y: 260, width: 100, height: 20, color: '#795548' },
            { x: 1360, y: 340, width: 120, height: 20, color: '#795548' },
            { x: 1580, y: 400, width: 100, height: 20, color: '#795548' },
            // Стены-препятствия
            { x: 700, y: 460, width: 30, height: 40, color: '#5D4037' },
            { x: 1100, y: 460, width: 30, height: 40, color: '#5D4037' },
        ],
        decorations: [
            { type: 'cloud', x: 300, y: 80 },
            { type: 'cloud', x: 900, y: 120 },
            { type: 'cloud', x: 1500, y: 60 },
            { type: 'tree', x: 120, y: 460 },
            { type: 'tree', x: 1700, y: 460 },
            { type: 'flag', x: 1800, y: 300 },
        ],
        reward: { xp: 50, budget: 200, citizens: 3 }
    },
    {
        id: 'level2',
        name: 'Стройплощадка',
        width: 2200,
        height: 540,
        bgColor: '#FFE4B5',
        playerStart: { x: 60, y: 400 },
        goal: { x: 2100, y: 340, width: 40, height: 100 },
        platforms: [
            { x: 0, y: 500, width: 800, height: 40, color: '#A1887F', type: 'ground' },
            { x: 900, y: 500, width: 500, height: 40, color: '#A1887F', type: 'ground' },
            { x: 1500, y: 500, width: 700, height: 40, color: '#A1887F', type: 'ground' },
            // Подвижные платформы (пока статичные)
            { x: 800, y: 480, width: 100, height: 20, color: '#FF9800' },
            { x: 1400, y: 480, width: 100, height: 20, color: '#FF9800' },
            // Высокие платформы
            { x: 300, y: 420, width: 100, height: 20, color: '#795548' },
            { x: 500, y: 340, width: 100, height: 20, color: '#795548' },
            { x: 700, y: 260, width: 80, height: 20, color: '#795548' },
            { x: 1000, y: 380, width: 120, height: 20, color: '#795548' },
            { x: 1250, y: 300, width: 100, height: 20, color: '#795548' },
            { x: 1600, y: 400, width: 100, height: 20, color: '#795548' },
            { x: 1800, y: 320, width: 120, height: 20, color: '#795548' },
            { x: 1950, y: 420, width: 100, height: 20, color: '#795548' },
        ],
        decorations: [
            { type: 'cloud', x: 400, y: 100 },
            { type: 'cloud', x: 1200, y: 70 },
            { type: 'cloud', x: 1900, y: 90 },
            { type: 'crane', x: 350, y: 320 },
            { type: 'crane', x: 1300, y: 250 },
            { type: 'tree', x: 1900, y: 460 },
            { type: 'flag', x: 2100, y: 300 },
        ],
        reward: { xp: 80, budget: 350, citizens: 5 }
    }
];

export function getLevelById(id) {
    return LEVELS.find(l => l.id === id) || LEVELS[0];
}