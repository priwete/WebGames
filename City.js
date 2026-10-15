// Данные города (сцена): здания, жители, показатели

import { Building } from './Building.js';
import { Citizen } from './Citizen.js';
import { BUILDING_TYPES } from './data.js';

export class City {
    constructor() {
        this.name = 'Новоград';
        this.buildings = [];
        this.citizens = [];
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 100;
        this.budget = 1000;
        this.gridSize = 20;          // размер клетки
        this.cityWidth = 40;         // в клетках
        this.cityHeight = 20;        // в клетках
        this.incomeTimer = 0;
        this.incomeInterval = 3;     // раз в 3 секунды
    }

    get levelProgress() {
        return `${this.xp}/${this.xpToNext}`;
    }

    canAfford(cost) {
        return this.budget >= cost;
    }

    /**
     * Попытка построить здание
     */
    tryBuild(typeId, gridX, gridY) {
        const type = BUILDING_TYPES.find(t => t.id === typeId);
        if (!type) return { success: false, reason: 'Неизвестный тип' };
        if (!this.canAfford(type.cost)) return { success: false, reason: 'Недостаточно средств' };
        if (this.isOccupied(gridX, gridY, type.width, type.height)) {
            return { success: false, reason: 'Место занято' };
        }

        this.budget -= type.cost;
        const building = new Building(type, gridX, gridY);
        this.buildings.push(building);
        this.addXP(building.xp);

        // Заселяем жителей, если есть вместимость
        if (building.capacity > 0) {
            this.populateBuilding(building);
        }

        return { success: true, building };
    }

    populateBuilding(building) {
        const toAdd = Math.min(building.capacity, 2 + Math.floor(Math.random() * 3));
        for (let i = 0; i < toAdd; i++) {
            const citizen = Citizen.generate();
            citizen.homeId = building.id + '_' + building.gridX + '_' + building.gridY;
            this.citizens.push(citizen);
            building.residents++;
        }
    }

    isOccupied(gx, gy, w, h) {
        const rect = { x: gx, y: gy, width: w, height: h };
        for (const b of this.buildings) {
            const bRect = b.getBounds();
            if (rect.x < bRect.x + bRect.width &&
                rect.x + rect.width > bRect.x &&
                rect.y < bRect.y + bRect.height &&
                rect.y + rect.height > bRect.y) {
                return true;
            }
        }
        return false;
    }

    addXP(amount) {
        this.xp += amount;
        while (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.5);
            this.budget += 100 * this.level;
        }
    }

    update(dt) {
        this.incomeTimer += dt;
        if (this.incomeTimer >= this.incomeInterval) {
            this.incomeTimer = 0;
            this.collectIncome();
        }

        // Обновляем жителей
        for (const c of this.citizens) {
            c.update();
        }
    }

    collectIncome() {
        let totalIncome = 0;
        for (const b of this.buildings) {
            totalIncome += b.income;
        }
        for (const c of this.citizens) {
            totalIncome += c.getIncome();
        }
        this.budget += totalIncome;
    }

    get totalPopulation() {
        return this.citizens.length;
    }

    toJSON() {
        return {
            name: this.name,
            level: this.level,
            xp: this.xp,
            xpToNext: this.xpToNext,
            budget: this.budget,
            buildings: this.buildings.map(b => b.toJSON()),
            citizens: this.citizens.map(c => ({
                name: c.name,
                surname: c.surname,
                gender: c.gender,
                age: c.age,
                happiness: c.happiness,
                professionName: c.profession.name,
                homeId: c.homeId
            }))
        };
    }

    static fromJSON(data) {
        const city = new City();
        city.name = data.name || 'Новоград';
        city.level = data.level || 1;
        city.xp = data.xp || 0;
        city.xpToNext = data.xpToNext || 100;
        city.budget = data.budget || 1000;

        if (data.buildings) {
            for (const bData of data.buildings) {
                const type = BUILDING_TYPES.find(t => t.id === bData.typeId);
                if (type) {
                    const b = new Building(type, bData.gridX, bData.gridY);
                    b.residents = bData.residents || 0;
                    city.buildings.push(b);
                }
            }
        }

        if (data.citizens) {
            for (const cData of data.citizens) {
                const profession = { name: cData.professionName, income: 10, xp: 5, color: '#888' };
                const c = new Citizen(cData.name, profession, cData.surname, cData.gender);
                c.age = cData.age;
                c.happiness = cData.happiness;
                c.homeId = cData.homeId;
                city.citizens.push(c);
            }
        }

        return city;
    }
}