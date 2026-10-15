// main.js — точка входа, создаёт Game, вешает обработчики UI

import { Game, SCREENS } from './Game.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { BUILDING_TYPES } from './data.js';

// Кэшируем типы зданий для UI (нужно ДО создания Game)
window.BUILDING_TYPES_CACHE = BUILDING_TYPES;

window.addEventListener('DOMContentLoaded', () => {
    console.log('[main] DOM загружен, стартуем...');

    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('[main] canvas #game-canvas не найден!');
        return;
    }

    const ui = new UI();
    const input = new Input();

    let game;
    try {
        game = new Game(canvas, ui, input);
    } catch (e) {
        console.error('[main] Ошибка создания Game:', e);
        return;
    }

    // --- Экранные кнопки для мобильных ---
    try {
        input.bindButton(ui.getButton('btn-left'), 'left');
        input.bindButton(ui.getButton('btn-right'), 'right');
        input.bindButton(ui.getButton('btn-jump'), 'jump');
    } catch (e) {
        console.warn('[main] Не удалось привязать экранные кнопки:', e);
    }

    // --- Переключение экранов ---
    ui.onSwitchScreen(() => {
        try {
            game.switchScreen();
        } catch (e) {
            console.error('[main] Ошибка switchScreen:', e);
        }
    });

    // --- Клики по канвасу (постройка зданий) ---
    canvas.addEventListener('click', (e) => {
        if (game.screen !== SCREENS.CITY) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = game.gameWidth / rect.width;
        const scaleY = game.gameHeight / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const panelH = 80;
        const panelY = game.gameHeight - panelH;

        // Клик по панели выбора здания
        if (clickY >= panelY) {
            const types = BUILDING_TYPES;
            const btnW = 100;
            const btnH = 60;
            const gap = 10;
            const totalW = types.length * btnW + (types.length - 1) * gap;
            const startX = (game.gameWidth - totalW) / 2;
            const btnY = panelY + 10;

            for (let i = 0; i < types.length; i++) {
                const bx = startX + i * (btnW + gap);
                if (clickX >= bx && clickX <= bx + btnW &&
                    clickY >= btnY && clickY <= btnY + btnH) {
                    game.selectedBuildingType = i;
                    ui.showMessage(`Выбрано: ${types[i].name}`);
                    return;
                }
            }
            return;
        }

        // Клик по игровому полю — строим здание
        const type = BUILDING_TYPES[game.selectedBuildingType];
        if (!type) return;

        const gs = game.city.gridSize;
        const worldX = clickX + game.cityScrollX;
        const worldY = clickY + game.cityScrollY;

        const gridX = Math.floor(worldX / gs) * gs;
        const gridY = Math.floor((worldY - type.height) / gs) * gs;

        if (gridX < 0 || gridY < 100 || gridX + type.width > game.city.cityWidth * gs) {
            ui.showMessage('Здесь нельзя строить!');
            return;
        }

        const result = game.city.tryBuild(type.id, gridX, gridY);
        if (result.success) {
            ui.showMessage(`Построено: ${type.name} (-${type.cost}💰)`);
            ui.updateHUD(game._getHUDState());
            game.save();
        } else {
            ui.showMessage(result.reason);
        }
    });

    // --- Свайп для прокрутки города на мобильных ---
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        if (game.screen !== SCREENS.CITY) return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (game.screen !== SCREENS.CITY) return;
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;

        game.cityScrollX -= dx * 1.5;
        game.cityScrollY -= dy * 1.5;

        const maxScrollX = Math.max(0, game.city.cityWidth * game.city.gridSize - game.gameWidth);
        const maxScrollY = Math.max(0, game.city.cityHeight * game.city.gridSize - game.gameHeight + 100);
        game.cityScrollX = Math.max(0, Math.min(maxScrollX, game.cityScrollX));
        game.cityScrollY = Math.max(0, Math.min(maxScrollY, game.cityScrollY));

        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, { passive: true });

    // --- Старт ---
    try {
        game.start();
        console.log('[main] Игра запущена. window.__game доступен.');
    } catch (e) {
        console.error('[main] Ошибка запуска игры:', e);
    }

    window.__game = game;
});