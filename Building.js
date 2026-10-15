// Здание: тип, стоимость, эффект

export class Building {
    constructor(type, gridX, gridY) {
        this.type = type;
        this.id = type.id;
        this.name = type.name;
        this.gridX = gridX;
        this.gridY = gridY;
        this.width = type.width;
        this.height = type.height;
        this.cost = type.cost;
        this.capacity = type.capacity;
        this.income = type.income;
        this.xp = type.xp;
        this.color = type.color;
        this.roofColor = type.roofColor;
        this.residents = 0;
    }

    draw(ctx, screenX, screenY, scale = 1) {
        const x = screenX;
        const y = screenY;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 4, y + 4, w, h);

        // Основание
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, w, h);

        // Обводка
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // Крыша (треугольник)
        ctx.fillStyle = this.roofColor;
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + w / 2, y - 20);
        ctx.lineTo(x + w + 4, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Окна
        ctx.fillStyle = '#FFF9C4';
        const cols = Math.max(2, Math.floor(w / 20));
        const rows = Math.max(1, Math.floor(h / 25));
        const windowW = 10;
        const windowH = 12;
        const paddingX = (w - cols * windowW) / (cols + 1);
        const paddingY = (h - rows * windowH) / (rows + 1);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const wx = x + paddingX + c * (windowW + paddingX);
                const wy = y + paddingY + r * (windowH + paddingY);
                ctx.fillStyle = ((r + c) % 2 === 0) ? '#FFF9C4' : '#B3E5FC';
                ctx.fillRect(wx, wy, windowW, windowH);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(wx, wy, windowW, windowH);
            }
        }

        // Дверь
        const doorW = 14;
        const doorH = 20;
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + w / 2 - doorW / 2, y + h - doorH, doorW, doorH);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + w / 2 - doorW / 2, y + h - doorH, doorW, doorH);
        // Ручка
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + w / 2 + 3, y + h - doorH / 2, 2, 2);

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.gridX,
            y: this.gridY,
            width: this.width,
            height: this.height
        };
    }

    toJSON() {
        return {
            typeId: this.id,
            gridX: this.gridX,
            gridY: this.gridY,
            residents: this.residents
        };
    }
}