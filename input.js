// Клавиатура + экранные кнопки

export class Input {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            jump: false,
            jumpPressed: false
        };
        this._jumpWasPressed = false;
        this._touchBindings = [];
        this._initKeyboard();
    }

    _initKeyboard() {
        window.addEventListener('keydown', (e) => {
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
                    if (!this.keys.jump) {
                        this.keys.jumpPressed = true;
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

        // Сброс при потере фокуса
        window.addEventListener('blur', () => {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.jump = false;
        });
    }

    /**
     * Привязывает экранную кнопку к действию
     * @param {HTMLElement} element 
     * @param {'left'|'right'|'jump'} action 
     */
    bindButton(element, action) {
        if (!element) return;

        const press = (e) => {
            e.preventDefault();
            if (action === 'jump' && !this.keys.jump) {
                this.keys.jumpPressed = true;
            }
            this.keys[action] = true;
            element.classList.add('pressed');
        };

        const release = (e) => {
            e.preventDefault();
            this.keys[action] = false;
            element.classList.remove('pressed');
        };

        element.addEventListener('pointerdown', press);
        element.addEventListener('pointerup', release);
        element.addEventListener('pointerleave', release);
        element.addEventListener('pointercancel', release);

        this._touchBindings.push({ element, press, release, action });
    }

    /**
     * Вызывается в конце кадра для сброса одноразовых событий
     */
    update() {
        // jumpPressed сбрасывается в конце кадра
    }

    reset() {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.keys.jumpPressed = false;
    }

    consumeJump() {
        if (this.keys.jumpPressed) {
            this.keys.jumpPressed = false;
            return true;
        }
        return false;
    }
}