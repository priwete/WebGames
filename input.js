// input.js — клавиатура + экранные кнопки с поддержкой удержания

export class Input {
    constructor() {
        // Состояние удержания клавиш (held)
        this.keys = {
            left: false,
            right: false,
            jump: false
        };

        // Одноразовый флаг "прыжок только что нажат"
        this.jumpPressed = false;
        this._jumpWasDown = false;

        // Привязки экранных кнопок
        this._bindings = [];

        // Активность ввода (для preventDefault)
        this.active = true;

        this._initKeyboard();
        this._initWindowEvents();
    }

    // ---------------------------------------------------------------
    // Клавиатура
    // ---------------------------------------------------------------
    _initKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;

            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    // jumpPressed — только в момент перехода из "не нажато" в "нажато"
                    if (!this.keys.jump) {
                        this.jumpPressed = true;
                    }
                    this.keys.jump = true;
                    e.preventDefault();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    this.keys.jump = false;
                    break;
            }
        });
    }

    // ---------------------------------------------------------------
    // Сброс при потере фокуса / скрытии вкладки
    // ---------------------------------------------------------------
    _initWindowEvents() {
        window.addEventListener('blur', () => this.reset());

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.reset();
        });
    }

    // ---------------------------------------------------------------
    // Экранные кнопки (pointer events, работают с удержанием)
    // ---------------------------------------------------------------
    /**
     * @param {HTMLElement} element
     * @param {'left'|'right'|'jump'} action
     */
    bindButton(element, action) {
        if (!element) return;

        const press = (e) => {
            e.preventDefault();
            if (action === 'jump' && !this.keys.jump) {
                this.jumpPressed = true;
            }
            this.keys[action] = true;
            element.classList.add('pressed');
        };

        const release = (e) => {
            if (e) e.preventDefault();
            this.keys[action] = false;
            element.classList.remove('pressed');
        };

        element.addEventListener('pointerdown', press);
        element.addEventListener('pointerup', release);
        element.addEventListener('pointerleave', release);
        element.addEventListener('pointercancel', release);

        // На случай, если палец ушёл за пределы кнопки
        element.addEventListener('lostpointercapture', release);

        this._bindings.push({ element, press, release, action });
    }

    // ---------------------------------------------------------------
    // Одноразовый прыжок
    // ---------------------------------------------------------------
    consumeJump() {
        if (this.jumpPressed) {
            this.jumpPressed = false;
            return true;
        }
        return false;
    }

    // ---------------------------------------------------------------
    // Сброс всех нажатий
    // ---------------------------------------------------------------
    reset() {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.jumpPressed = false;
        this._jumpWasDown = false;

        // Визуально снять "pressed" со всех кнопок
        for (const b of this._bindings) {
            b.element.classList.remove('pressed');
        }
    }

    // ---------------------------------------------------------------
    // Вызывается в конце кадра
    // ---------------------------------------------------------------
    update() {
        // jumpPressed сбрасывается через consumeJump()
        // Здесь можно добавить логику, если нужно
    }
}
