import { toast } from 'react-toastify';

const access_key = import.meta.env.VITE_ACCESS_KEY;

export const checkAccessKey = (inputKey) => {
    if (!inputKey || inputKey.trim() === '') {
        toast.warning('Будь ласка, введіть ключ доступу', {
            position: "top-right",
            autoClose: 3000,
        });
        throw new Error('EMPTY');
    }
    if (inputKey !== access_key) {
        toast.error('Невірний ключ доступу', {
            position: "top-right",
            autoClose: 3000,
        });
        throw new Error('WRONG');
    }
    toast.success('Успішний вхід!', {
        position: "top-right",
        autoClose: 2000,
    });
    return true;
};

export const saveAuthSession = () => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    localStorage.setItem('auth_expires', expiresAt.getTime());
    localStorage.setItem('is_authenticated', 'true');
    toast.info('Сесія збережена на 4 години', {
        position: "top-right",
        autoClose: 3500,
    });
};

export const checkAuthSession = () => {
    const isAuth = localStorage.getItem('is_authenticated');
    const expiresAt = localStorage.getItem('auth_expires');
    if (!isAuth || !expiresAt) {
        return false;
    }
    const now = new Date().getTime();
    const expiresTime = parseInt(expiresAt, 10);
    return now < expiresTime;
};

export const getRemainingTime = () => {
    const expiresAt = localStorage.getItem('auth_expires');
    if (!expiresAt) return 0;
    const now = new Date().getTime();
    const expiresTime = parseInt(expiresAt, 10);
    return Math.max(0, expiresTime - now);
};

export const clearAuthSession = () => {
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('auth_expires');
    toast.info('Сесію завершено', {
        position: "top-right",
        autoClose: 2000,
    });
};
