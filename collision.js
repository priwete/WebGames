// AABB-коллизии

export function aabbCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

export function getOverlap(a, b) {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    return { x: overlapX, y: overlapY };
}

export function resolveCollision(entity, solids, velocity) {
    // Простое разрешение коллизий по осям
    const result = { onGround: false, hitWall: false, hitCeiling: false };
    
    // Двигаем по X
    entity.x += velocity.x;
    for (const solid of solids) {
        if (aabbCollide(entity, solid)) {
            const overlap = getOverlap(entity, solid);
            if (velocity.x > 0) {
                entity.x -= overlap.x;
            } else if (velocity.x < 0) {
                entity.x += overlap.x;
            }
            velocity.x = 0;
            result.hitWall = true;
        }
    }
    
    // Двигаем по Y
    entity.y += velocity.y;
    for (const solid of solids) {
        if (aabbCollide(entity, solid)) {
            const overlap = getOverlap(entity, solid);
            if (velocity.y > 0) {
                entity.y -= overlap.y;
                result.onGround = true;
            } else if (velocity.y < 0) {
                entity.y += overlap.y;
                result.hitCeiling = true;
            }
            velocity.y = 0;
        }
    }
    
    return result;
}

export function pointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width &&
           py >= rect.y && py <= rect.y + rect.height;
}