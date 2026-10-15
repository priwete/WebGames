// Game.js — состояние игры, игровой цикл, переключение экранов

import { Player } from './Player.js';
import { City } from './City.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { LEVELS, getLevelById } from './levels.js';
import { saveGame, loadGame } from './storage.js';
import { Citizen } from './Citizen.js';

export const SCREENS = {
    CITY: 'city',
    MINIGAME: 'minigame'
};

export class Game {
    constructor(canvas, ui, input) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        this.input = input;

        // Фиксированные игровые координаты
        this.gameWidth = 960;
        this.gameHeight = 540;

        // Состояние
        this.screen = SCREENS.CITY;
        this.running = true;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDt = 1 / 60;

        // Данные города
        this.city = new City();

        // Мини-игра
        this.currentLevel = null;
        this.player = null;
        this.camera = { x: 0, y: 0 };
        this.levelSolids = [];
        this.minigameComplete = false;
        this.minigameTimer = 0;
        this.minigameCooldown = 1.5;

        // Экран города
        this.selectedBuildingType = 0;
        this.cityScrollX = 0;
        this.cityScrollY = 0;

        // Сохранение
        this.autoSaveTimer = 0;
        this.autoSaveInterval = 15;

        // Загрузка сохранения
        this._loadSavedGame();
        this.ui.updateHUD(this._getHUDState());

        // Размер canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    _loadSavedGame() {
        const saved = loadGame();
        if (saved) {
            try {
                this.city = City.fromJSON(saved);
                console.log('[Game] Сохранение загружено');
            } catch (e) {
                console.warn('[Game] Ошибка загрузки сохранения:', e);
            }
        }
    }

    _getHUDState() {
        return {
            level: this.city.level,
            xp: this.city.xp,
            xpToNext: this.city.xpToNext,
            citizens: this.city.totalPopulation,
            budget: this.city.budget
        };
    }

    resize() {
        const container = this.canvas.parentElement;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const targetAspect = this.gameWidth / this.gameHeight;
        const containerAspect = containerW / containerH;

        let cssW, cssH;
        if (containerAspect > targetAspect) {
            cssH = containerH;
            cssW = cssH * targetAspect;
        } else {
            cssW = containerW;
            cssH = cssW / targetAspect;
        }

        this.canvas.style.width = cssW + 'px';
        this.canvas.style.height = cssH + 'px';
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        if (!this.running) return;

        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (dt > 0.1) dt = 0.1;

        this.accumulator += dt;
        while (this.accumulator >= this.fixedDt) {
            try {
                this.update(this.fixedDt);
            } catch (e) {
                console.error('[Game] Ошибка в update:', e);
                this.accumulator = 0;
                break;
            }
            this.accumulator -= this.fixedDt;
        }

        try {
            this.render();
        } catch (e) {
            console.error('[Game] Ошибка в render:', e);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.screen === SCREENS.CITY) {
            this.updateCity(dt);
        } else if (this.screen === SCREENS.MINIGAME) {
            this.updateMinigame(dt);
        }

        this.ui.update(dt);

        this.autoSaveTimer += dt;
        if (this.autoSaveTimer >= this.autoSaveInterval) {
            this.autoSaveTimer = 0;
            this.save();
        }
    }

    updateCity(dt) {
        this.city.update(dt);
        this.ui.updateHUD(this._getHUDState());

        if (this.input.keys.left) this.cityScrollX -= 200 * dt;
        if (this.input.keys.right) this.cityScrollX += 200 * dt;

        const maxScrollX = Math.max(0, this.city.cityWidth * this.city.gridSize - this.gameWidth);
        const maxScrollY = Math.max(0, this.city.cityHeight * this.city.gridSize - this.gameHeight + 100);
        this.cityScrollX = Math.max(0, Math.min(maxScrollX, this.cityScrollX));
        this.cityScrollY = Math.max(0, Math.min(maxScrollY, this.cityScrollY));
    }

    updateMinigame(dt) {
        if (!this.player || !this.currentLevel) return;

        if (this.minigameComplete) {
            this.minigameTimer += dt;
            if (this.minigameTimer >= this.minigameCooldown) {
                this.finishMinigame();
            }
            return;
        }

        this.player.update(dt, this.input, this.levelSolids);
        this.input.update();

        const targetCamX = this.player.x + this.player.width / 2 - this.gameWidth / 2;
        const targetCamY = this.player.y + this.player.height / 2 - this.gameHeight / 2 - 50;
        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;

        const maxCamX = Math.max(0, this.currentLevel.width - this.gameWidth);
        const maxCamY = Math.max(0, this.currentLevel.height - this.gameHeight);
        this.camera.x = Math.max(0, Math.min(maxCamX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxCamY, this.camera.y));

        if (this.player.y > this.currentLevel.height + 100) {
            this.player.x = this.currentLevel.playerStart.x;
            this.player.y = this.currentLevel.playerStart.y;
            this.player.vx = 0;
            this.player.vy = 0;
            this.ui.showMessage('Ой! Вы упали. Попробуйте снова!');
        }

        const goal = this.currentLevel.goal;
        if (this.player.x + this.player.width > goal.x &&
            this.player.x < goal.x + goal.width &&
            this.player.y + this.player.height > goal.y &&
            this.player.y < goal.y + goal.height) {
            this.minigameComplete = true;
            this.minigameTimer = 0;
            this.ui.showMessage('Уровень пройден! +' + this.currentLevel.reward.xp + ' XP', 2);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.save();

        // Очистка
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        if (this.screen === SCREENS.CITY) {
            this.renderCity(ctx);
        } else if (this.screen === SCREENS.MINIGAME) {
            this.renderMinigame(ctx);
        }

        this.ui.draw(ctx, this.gameWidth, this.gameHeight);

        ctx.restore();
    }

    renderCity(ctx) {
        const gs = this.city.gridSize;

        // Фон (небо уже залито сверху, тут трава)
        ctx.fillStyle = '#8BC34A';
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        // Солнце
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(880, 70, 40, 0, Math.PI * 2);
        ctx.fill();

        // Облака
        this._drawCloud(ctx, 150, 60, 1);
        this._drawCloud(ctx, 450, 100, 0.8);
        this._drawCloud(ctx, 700, 50, 1.2);

        // Сетка
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        const startX = -this.cityScrollX % gs;
        const startY = -this.cityScrollY % gs;
        for (let x = startX; x < this.gameWidth; x += gs) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.gameHeight);
            ctx.stroke();
        }
        for (let y = startY; y < this.gameHeight; y += gs) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.gameWidth, y);
            ctx.stroke();
        }

        // Здания
        for (const b of this.city.buildings) {
            const sx = b.gridX - this.cityScrollX;
            const sy = b.gridY - this.cityScrollY;
            if (sx + b.width > -50 && sx < this.gameWidth + 50 &&
                sy + b.height > -50 && sy < this.gameHeight + 50) {
                b.draw(ctx, sx, sy);
            }
        }

        // Жители (для атмосферы)
        const citizensToDraw = Math.min(this.city.citizens.length, 10);
        for (let i = 0; i < citizensToDraw; i++) {
            const c = this.city.citizens[i];
            const seed = i * 137;
            const cx = ((seed * 73) % 800 + 80) - this.cityScrollX * 0.5;
            const cy = 460 + (i % 3) * 10;
            if (cx > -30 && cx < this.gameWidth + 30) {
                c.draw(ctx, cx, cy);
            }
        }

        // Панель выбора здания
        this._drawBuildPanel(ctx);
    }

    _drawBuildPanel(ctx) {
        const panelH = 80;
        const panelY = this.gameHeight - panelH;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, panelY, this.gameWidth, panelH);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, panelY);
        ctx.lineTo(this.gameWidth, panelY);
        ctx.stroke();

        const types = this._getBuildingTypes();
        if (!types || types.length === 0) return;

        const btnW = 100;
        const btnH = 60;
        const gap = 10;
        const totalW = types.length * btnW + (types.length - 1) * gap;
        const startX = (this.gameWidth - totalW) / 2;
        const btnY = panelY + 10;

        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const bx = startX + i * (btnW + gap);
            const isSelected = i === this.selectedBuildingType;
            const canAfford = this.city.budget >= type.cost;

            ctx.fillStyle = isSelected ? '#4CAF50' : (canAfford ? '#FFF' : '#EEE');
            ctx.fillRect(bx, btnY, btnW, btnH);
            ctx.strokeStyle = isSelected ? '#2a7a2a' : '#333';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(bx, btnY, btnW, btnH);

            // Мини-иконка
            ctx.fillStyle = type.color;
            ctx.fillRect(bx + 10, btnY + 15, 20, 25);
            ctx.fillStyle = type.roofColor;
            ctx.beginPath();
            ctx.moveTo(bx + 8, btnY + 15);
            ctx.lineTo(bx + 20, btnY + 5);
            ctx.lineTo(bx + 32, btnY + 15);
            ctx.closePath();
            ctx.fill();

            // Название
            ctx.fillStyle = canAfford ? '#333' : '#999';
            ctx.font = 'bold 11px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(type.name, bx + 38, btnY + 22);

            // Цена
            ctx.fillStyle = canAfford ? '#2a7a2a' : '#999';
            ctx.font = '10px "Courier New", monospace';
            ctx.fillText(type.cost + '$', bx + 38, btnY + 40);
        }
    }

    _getBuildingTypes() {
        return window.BUILDING_TYPES_CACHE || [];
    }

    _getSelectedType() {
        const types = this._getBuildingTypes();
        return types[this.selectedBuildingType];
    }

    _drawCloud(ctx, x, y, scale) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(x, y, 25 * scale, 0, Math.PI * 2);
        ctx.arc(x + 30 * scale, y - 10 * scale, 30 * scale, 0, Math.PI * 2);
        ctx.arc(x + 65 * scale, y, 25 * scale, 0, Math.PI * 2);
        ctx.arc(x + 35 * scale, y + 10 * scale, 25 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    renderMinigame(ctx) {
        if (!this.currentLevel) return;

        const level = this.currentLevel;
        const camX = Math.round(this.camera.x);
        const camY = Math.round(this.camera.y);

        ctx.fillStyle = level.bgColor;
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        ctx.save();
        ctx.translate(-camX, -camY);

        for (const deco of level.decorations) {
            this._drawDecoration(ctx, deco);
        }

        for (const p of level.platforms) {
            this._drawPlatform(ctx, p);
        }

        this._drawGoal(ctx, level.goal);

        if (this.player) {
            this.player.draw(ctx);
        }

        ctx.restore();

        // Название уровня
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        const title = level.name;
        ctx.font = 'bold 20px "Courier New", monospace';
        const tw = ctx.measureText(title).width;
        ctx.fillRect(this.gameWidth / 2 - tw / 2 - 15, 15, tw + 30, 36);
        ctx.strokeRect(this.gameWidth / 2 - tw / 2 - 15, 15, tw + 30, 36);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, this.gameWidth / 2, 33);

        if (this.minigameComplete) {
            ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            ctx.fillRect(0, this.gameHeight / 2 - 60, this.gameWidth, 120);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 36px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', this.gameWidth / 2, this.gameHeight / 2);
        }
    }

    _drawDecoration(ctx, deco) {
        switch (deco.type) {
            case 'cloud':
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.beginPath();
                ctx.arc(deco.x, deco.y, 25, 0, Math.PI * 2);
                ctx.arc(deco.x + 30, deco.y - 10, 30, 0, Math.PI * 2);
                ctx.arc(deco.x + 65, deco.y, 25, 0, Math.PI * 2);
                ctx.arc(deco.x + 35, deco.y + 10, 25, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'tree':
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(deco.x - 5, deco.y - 40, 10, 40);
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(deco.x, deco.y - 55, 25, 0, Math.PI * 2);
                ctx.arc(deco.x - 15, deco.y - 45, 20, 0, Math.PI * 2);
                ctx.arc(deco.x + 15, deco.y - 45, 20, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'flag':
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(deco.x, deco.y);
                ctx.lineTo(deco.x, deco.y - 80);
                ctx.stroke();
                ctx.fillStyle = '#E74C3C';
                ctx.beginPath();
                ctx.moveTo(deco.x, deco.y - 80);
                ctx.lineTo(deco.x + 35, deco.y - 65);
                ctx.lineTo(deco.x, deco.y - 50);
                ctx.closePath();
                ctx.fill();
                break;
            case 'crane':
                ctx.strokeStyle = '#FF9800';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(deco.x, deco.y + 100);
                ctx.lineTo(deco.x, deco.y - 60);
                ctx.lineTo(deco.x + 60, deco.y - 60);
                ctx.stroke();
                ctx.fillStyle = '#FF9800';
                ctx.fillRect(deco.x - 5, deco.y + 90, 60, 15);
                break;
        }
    }

    _drawPlatform(ctx, p) {
        ctx.fillStyle = p.color || '#795548';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(p.x, p.y + p.height - 5, p.width, 5);

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(p.x, p.y, p.width, 3);

        if (p.type === 'ground') {
            ctx.fillStyle = '#4CAF50';
            for (let x = p.x; x < p.x + p.width; x += 8) {
                ctx.fillRect(x, p.y - 4, 4, 6);
            }
        }
    }

    _drawGoal(ctx, goal) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(goal.x + 5, goal.y + goal.height);
        ctx.lineTo(goal.x + 5, goal.y);
        ctx.stroke();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(goal.x + 5, goal.y);
        ctx.lineTo(goal.x + 40, goal.y + 15);
        ctx.lineTo(goal.x + 5, goal.y + 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const pulse = 0.3 + 0.2 * Math.sin(performance.now() / 300);
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.beginPath();
        ctx.arc(goal.x + 20, goal.y + 15, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    switchScreen() {
        if (this.screen === SCREENS.CITY) {
            this.startMinigame();
        } else {
            this.finishMinigame();
        }
    }

    startMinigame(levelIndex = 0) {
        this.screen = SCREENS.MINIGAME;
        this.ui.setScreen('minigame');

        const level = LEVELS[levelIndex % LEVELS.length];
        this.currentLevel = level;

        this.player = new Player(level.playerStart.x, level.playerStart.y);

        this.levelSolids = level.platforms.map(p => ({
            x: p.x, y: p.y, width: p.width, height: p.height
        }));

        this.camera.x = Math.max(0, this.player.x - this.gameWidth / 2);
        this.camera.y = 0;

        this.minigameComplete = false;
        this.minigameTimer = 0;
        this.input.reset();

        this.ui.showMessage(`Мини-игра: ${level.name}`, 2);
    }

    finishMinigame() {
        // Если уровень был пройден — выдаём награду
        if (this.currentLevel && this.minigameComplete) {
            const reward = this.currentLevel.reward;
            this.city.addXP(reward.xp);
            this.city.budget += reward.budget;

            // Добавляем новых жителей
            for (let i = 0; i < reward.citizens; i++) {
                const citizen = Citizen.generate();
                this.city.citizens.push(citizen);
            }

            this.ui.showMessage(
                `Награда: +${reward.xp} XP, +${reward.budget}$, +${reward.citizens} жителей`,
                2.5
            );
        }

        this.screen = SCREENS.CITY;
        this.ui.setScreen('city');
        this.ui.updateHUD(this._getHUDState());
        this.player = null;
        this.currentLevel = null;
        this.minigameComplete = false;
        this.input.reset();
    }

    save() {
        const success = saveGame(this.city.toJSON());
        if (success) {
            console.log('[Game] Игра сохранена');
        }
    }
}