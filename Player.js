// Персонаж-мэр для платформенных мини-игр

import { resolveCollision } from './collision.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 40;
        this.vx = 0;
        this.vy = 0;
        this.speed = 220;          // px/sec
        this.jumpForce = -420;     // px/sec
        this.gravity = 1200;       // px/sec^2
        this.onGround = false;
        this.facingRight = true;
        this.color = '#4A90E2';
        this.hatColor = '#2C3E50';
        this.skinColor = '#F5CBA7';
        this.animTime = 0;
        this.isJumping = false;
    }

    update(dt, input, solids) {
        // Горизонтальное движение
        let moveX = 0;
        if (input.keys.left) moveX -= 1;
        if (input.keys.right) moveX += 1;

        this.vx = moveX * this.speed;
        if (moveX > 0) this.facingRight = true;
        else if (moveX < 0) this.facingRight = false;

        // Прыжок
        if (input.consumeJump() && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.isJumping = true;
        }

        // Гравитация
        this.vy += this.gravity * dt;
        if (this.vy > 800) this.vy = 800;

        // Движение с коллизиями
        const velocity = { x: this.vx * dt, y: this.vy * dt };
        const result = resolveCollision(this, solids, velocity);
        
        this.onGround = result.onGround;
        if (this.onGround) this.isJumping = false;

        // Обновление анимации
        if (moveX !== 0 && this.onGround) {
            this.animTime += dt * 8;
        }

        // Границы уровня
        if (this.x < 0) this.x = 0;
    }

    draw(ctx) {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        const w = this.width;
        const h = this.height;

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