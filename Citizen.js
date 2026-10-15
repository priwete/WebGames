// Житель: имя, профессия, вклад в бюджет/XP

import { MALE_NAMES, FEMALE_NAMES, SURNAMES, PROFESSIONS } from './data.js';

export class Citizen {
    constructor(name, profession, surname, gender) {
        this.name = name;
        this.surname = surname;
        this.gender = gender;
        this.profession = profession;
        this.age = 18 + Math.floor(Math.random() * 50);
        this.happiness = 50 + Math.floor(Math.random() * 50);
        this.homeId = null;
        this.color = profession.color;
    }

    get fullName() {
        return `${this.surname} ${this.name}`;
    }

    /**
     * Вклад в бюджет города
     */
    getIncome() {
        return Math.floor(this.profession.income * (this.happiness / 100 + 0.5));
    }

    /**
     * Вклад в опыт мэра
     */
    getXP() {
        return this.profession.xp;
    }

    /**
     * Обновление состояния (вызывается периодически)
     */
    update() {
        // Небольшое колебание счастья
        this.happiness += (Math.random() - 0.5) * 4;
        this.happiness = Math.max(0, Math.min(100, this.happiness));
    }

    static generate() {
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
        const name = names[Math.floor(Math.random() * names.length)];
        const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] 
            + (gender === 'female' ? 'а' : '');
        const profession = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
        
        return new Citizen(name, profession, surname, gender);
    }

    draw(ctx, x, y) {
        const w = 16;
        const h = 24;

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h, w / 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ноги
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 3, y + h - 6, 4, 6);
        ctx.fillRect(x + w - 7, y + h - 6, 4, 6);

        // Тело (цвет профессии)
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 2, y + 8, w - 4, h - 14);

        // Голова
        ctx.fillStyle = '#F5CBA7';
        ctx.fillRect(x + 3, y + 2, w - 6, 8);

        // Глаза
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 5, y + 5, 1.5, 2);
        ctx.fillRect(x + w - 7, y + 5, 1.5, 2);

        // Индикатор счастья
        const barW = w;
        const barH = 2;
        const barY = y - 5;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, barY, barW, barH);
        ctx.fillStyle = this.happiness > 50 ? '#4CAF50' : this.happiness > 25 ? '#FFC107' : '#F44336';
        ctx.fillRect(x, barY, barW * (this.happiness / 100), barH);
    }
}