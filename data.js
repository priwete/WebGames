// Списки имён, профессий, типов домов

export const MALE_NAMES = [
    'Иван', 'Пётр', 'Алексей', 'Дмитрий', 'Сергей',
    'Николай', 'Андрей', 'Михаил', 'Владимир', 'Егор',
    'Максим', 'Артём', 'Кирилл', 'Роман', 'Олег'
];

export const FEMALE_NAMES = [
    'Анна', 'Мария', 'Елена', 'Ольга', 'Татьяна',
    'Наталья', 'Ирина', 'Светлана', 'Екатерина', 'Юлия',
    'Алина', 'Дарья', 'Ксения', 'Полина', 'Вера'
];

export const SURNAMES = [
    'Иванов', 'Петров', 'Смирнов', 'Кузнецов', 'Соколов',
    'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов',
    'Волков', 'Соловьёв', 'Васильев', 'Зайцев', 'Павлов'
];

export const PROFESSIONS = [
    { name: 'Рабочий', income: 10, xp: 5, color: '#8B4513' },
    { name: 'Инженер', income: 25, xp: 10, color: '#4169E1' },
    { name: 'Врач', income: 30, xp: 12, color: '#DC143C' },
    { name: 'Учитель', income: 20, xp: 8, color: '#228B22' },
    { name: 'Программист', income: 40, xp: 15, color: '#9932CC' },
    { name: 'Торговец', income: 35, xp: 10, color: '#FF8C00' },
    { name: 'Полицейский', income: 22, xp: 7, color: '#191970' },
    { name: 'Пожарный', income: 22, xp: 7, color: '#B22222' }
];

export const BUILDING_TYPES = [
    {
        id: 'house',
        name: 'Дом',
        cost: 100,
        color: '#E8B87D',
        roofColor: '#8B4513',
        width: 60,
        height: 50,
        capacity: 4,
        income: 5,
        xp: 10,
        description: 'Простой жилой дом'
    },
    {
        id: 'apartment',
        name: 'Многоэтажка',
        cost: 300,
        color: '#C0C0C0',
        roofColor: '#696969',
        width: 70,
        height: 100,
        capacity: 12,
        income: 15,
        xp: 30,
        description: 'Многоквартирный дом'
    },
    {
        id: 'shop',
        name: 'Магазин',
        cost: 200,
        color: '#FFD700',
        roofColor: '#FF4500',
        width: 70,
        height: 60,
        capacity: 0,
        income: 25,
        xp: 25,
        description: 'Приносит доход городу'
    },
    {
        id: 'school',
        name: 'Школа',
        cost: 400,
        color: '#87CEEB',
        roofColor: '#4682B4',
        width: 90,
        height: 80,
        capacity: 0,
        income: 10,
        xp: 50,
        description: 'Повышает уровень образования'
    },
    {
        id: 'hospital',
        name: 'Больница',
        cost: 500,
        color: '#F0F0F0',
        roofColor: '#DC143C',
        width: 90,
        height: 85,
        capacity: 0,
        income: 10,
        xp: 60,
        description: 'Заботится о здоровье жителей'
    },
    {
        id: 'park',
        name: 'Парк',
        cost: 150,
        color: '#90EE90',
        roofColor: '#228B22',
        width: 100,
        height: 40,
        capacity: 0,
        income: 5,
        xp: 20,
        description: 'Улучшает настроение жителей'
    }
];