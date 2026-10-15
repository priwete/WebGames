// HUD, кнопки, модалки, экранные кнопки

export class UI {
    constructor() {
        this.elements = {
            level: document.getElementById('hud-level'),
            xp: document.getElementById('hud-xp'),
            citizens: document.getElementById('hud-citizens'),
            budget: document.getElementById('hud-budget'),
            switchBtn: document.getElementById('btn-switch-screen'),
            controlsHint: document.getElementById('controls-hint'),
            screenButtons: document.getElementById('screen-buttons'),
        };
        this._messageQueue = [];
        this._message = null;
        this._messageTimer = 0;
        this._messageDuration = 3;
    }

    /**
     * Обновление HUD
     */
    updateHUD(state) {
        if (this.elements.level) {
            this.elements.level.textContent = state.level;
        }
        if (this.elements.xp) {
            this.elements.xp.textContent = `${state.xp}/${state.xpToNext}`;
        }
        if (this.elements.citizens) {
            this.elements.citizens.textContent = state.citizens;
        }
        if (this.elements.budget) {
            this.elements.budget.textContent = Math.floor(state.budget);
        }
    }

    setScreen(screenName) {
        if (screenName === 'minigame') {
            if (this.elements.screenButtons) {
                this.elements.screenButtons.style.display = 'flex';
            }
            if (this.elements.controlsHint) {
                this.elements.controlsHint.innerHTML = 
                    '<p>Доберитесь до флага!</p><p>← → движение, ↑ прыжок</p>';
            }
        } else {
            if (this.elements.screenButtons) {
                this.elements.screenButtons.style.display = 'none';
            }
            if (this.elements.controlsHint) {
                this.elements.controlsHint.innerHTML = 
                    '<p>Город: стройте здания</p><p>Управление: экранные кнопки</p>';
            }
        }
    }

    /**
     * Показать всплывающее сообщение
     */
    showMessage(text, duration = 3) {
        this._messageQueue.push({ text, duration });
    }

    update(dt) {
        if (this._message) {
            this._messageTimer -= dt;
            if (this._messageTimer <= 0) {
                this._message = null;
            }
        } else if (this._messageQueue.length > 0) {
            const next = this._messageQueue.shift();
            this._message = next.text;
            this._messageTimer = next.duration;
        }
    }

    draw(ctx, canvasWidth, canvasHeight) {
        if (this._message) {
            const alpha = Math.min(1, this._messageTimer / 0.5);
            ctx.save();
            ctx.globalAlpha = alpha;
            
            ctx.font = 'bold 24px "Courier New", monospace';
            const textWidth = ctx.measureText(this._message).width;
            const padding = 20;
            const boxW = textWidth + padding * 2;
            const boxH = 50;
            const boxX = (canvasWidth - boxW) / 2;
            const boxY = 60;

            // Фон
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 10);
            ctx.fill();

            // Текст
            ctx.fillStyle = '#FFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this._message, canvasWidth / 2, boxY + boxH / 2);
            
            ctx.restore();
        }
    }

    onSwitchScreen(callback) {
        if (this.elements.switchBtn) {
            this.elements.switchBtn.addEventListener('click', callback);
        }
    }

    getButton(id) {
        return document.getElementById(id);
    }
}