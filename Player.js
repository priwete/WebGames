// Player.js — персонаж-мэр для платформенных мини-игр

export class Player {
    constructor(x, y) {
        // Позиция и размеры
        this.x = x;
        this.y = y;
        this.w = 28;
        this.h = 40;

        // Скорость (px/sec)
        this.vx = 0;
        this.vy = 0;

        // Параметры движения
        this.maxSpeed = 220;        // максимальная горизонтальная скорость
        this.acceleration = 1600;   // ускорение при движении
        this.friction = 1400;       // замедление при отсутствии ввода
        this.jumpForce = -420;      // импульс прыжка
        this.gravity = 1200;        // гравитация (px/sec^2)
        this.maxFallSpeed = 800;    // ограничение скорости падения

        // Состояние
        this.onGround = false;
        this.facingRight = true;

        // Анимация
        this.animTime = 0;
        this.isJumping = false;

        // Цвета
        this.color = '#4A90E2';
        this.hatColor = '#2C3E50';
        this.skinColor = '#F5CBA7';
    }

    /**
     * Обновление состояния игрока
     * @param {number} dt — время кадра в секундах
     * @param {Input} input — объект ввода
     * @param {Array} solids — массив AABB-препятствий {x, y, width, height}
     */
    update(dt, input, solids) {
        // -----------------------------------------------------------
        // Горизонтальное движение с плавным ускорением
        // -----------------------------------------------------------
        let moveDir = 0;
        if (input.keys.left) moveDir -= 1;
        if (input.keys.right) moveDir += 1;

        if (moveDir !== 0) {
            // Ускорение в сторону движения
            this.vx += moveDir * this.acceleration * dt;

            // Ограничение максимальной скорости
            if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
            if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

            // Поворот
            if (moveDir > 0) this.facingRight = true;
            else if (moveDir < 0) this.facingRight = false;
        } else {
            // Трение (плавное замедление)
            const frictionAmount = this.friction * dt;
            if (Math.abs(this.vx) <= frictionAmount) {
                this.vx = 0;
            } else {
                this.vx -= Math.sign(this.vx) * frictionAmount;
            }
        }

        // -----------------------------------------------------------
        // Прыжок
        // -----------------------------------------------------------
        if (input.consumeJump() && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.isJumping = true;
        }

        // -----------------------------------------------------------
        // Гравитация
        // -----------------------------------------------------------
        this.vy += this.gravity * dt;
        if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;

        // -----------------------------------------------------------
        // Движение с разрешением коллизий (по осям)
        // -----------------------------------------------------------
        this._moveAndCollide(dt, solids);

        // -----------------------------------------------------------
        // Анимация ходьбы
        // -----------------------------------------------------------
        if (this.onGround && Math.abs(this.vx) > 10) {
            this.animTime += dt * 10;
        } else if (this.onGround) {
            // Плавное затухание анимации
            this.animTime += dt * 4;
        }

        if (this.onGround) {
            this.isJumping = false;
        }
    }

    // ---------------------------------------------------------------
    // Движение по осям с разрешением коллизий
    // ---------------------------------------------------------------
    _moveAndCollide(dt, solids) {
        // --- Ось X ---
        this.x += this.vx * dt;
        for (const solid of solids) {
            if (this._aabb(this.x, this.y, this.w, this.h, solid)) {
                if (this.vx > 0) {
                    this.x = solid.x - this.w;
                } else if (this.vx < 0) {
                    this.x = solid.x + solid.width;
                }
                this.vx = 0;
            }
        }

        // --- Ось Y ---
        this.y += this.vy * dt;
        this.onGround = false;

        for (const solid of solids) {
            if (this._aabb(this.x, this.y, this.w, this.h, solid)) {
                if (this.vy > 0) {
                    // Падение — встаём на поверхность
                    this.y = solid.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                } else if (this.vy < 0) {
                    // Удар головой о потолок
                    this.y = solid.y + solid.height;
                    this.vy = 0;
                }
            }
        }

        // Границы уровня (слева/справа)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
    }

    // ---------------------------------------------------------------
    // AABB-проверка пересечения
    // ---------------------------------------------------------------
    _aabb(x, y, w, h, rect) {
        return x < rect.x + rect.width &&
               x + w > rect.x &&
               y < rect.y + rect.height &&
               y + h > rect.y;
    }

    // ---------------------------------------------------------------
    // Отрисовка
    // ---------------------------------------------------------------
    draw(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const w = this.w;
        const h = this.h;

        ctx.save();

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 2, w / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ноги (анимация ходьбы)
        const legOffset = this.onGround ? Math.sin(this.animTime) * 3 : 0;
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(x + 4, y + h - 10 + legOffset, 7, 10);
        ctx.fillRect(x + w - 11, y + h - 10 - legOffset, 7, 10);

        // Тело (пиджак)
        ctx.fillStyle = this.color;
        ctx.fillRect(x + 2, y + 14, w - 4, h - 24);

        // Рубашка
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w / 2 - 3, y + 16, 6, 12);

        // Голова
        ctx.fillStyle = this.skinColor;
        ctx.fillRect(x + 4, y + 2, w - 8, 14);

        // Глаза
        ctx.fillStyle = '#000';
        const eyeY = y + 7;
        if (this.facingRight) {
            ctx.fillRect(x + w - 12, eyeY, 2, 3);
            ctx.fillRect(x + w - 7, eyeY, 2, 3);
        } else {
            ctx.fillRect(x + 7, eyeY, 2, 3);
            ctx.fillRect(x + 12, eyeY, 2, 3);
        }

        // Шляпа мэра
        ctx.fillStyle = this.hatColor;
        ctx.fillRect(x + 2, y - 2, w - 4, 6);
        ctx.fillRect(x + 5, y - 8, w - 10, 7);
        // Лента на шляпе
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(x + 2, y + 2, w - 4, 2);

        ctx.restore();
    }
}
