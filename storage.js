// Обёртка для localStorage с try/catch

const STORAGE_KEY = 'city_builder_save';

export function saveGame(data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        return true;
    } catch (e) {
        console.warn('Не удалось сохранить игру:', e);
        return false;
    }
}

export function loadGame() {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) return null;
        return JSON.parse(serialized);
    } catch (e) {
        console.warn('Не удалось загрузить игру:', e);
        return null;
    }
}

export function clearSave() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (e) {
        console.warn('Не удалось очистить сохранение:', e);
        return false;
    }
}