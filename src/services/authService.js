const access_key = import.meta.env.VITE_ACCESS_KEY;

export const checkAccessKey = (inputKey) => {
    if (!inputKey || inputKey.trim() === '') {
        throw new Error('EMPTY');
    }
    if (inputKey !== access_key) {
        throw new Error('WRONG');
    }
    return true;
};

export const saveAuthSession = () => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    localStorage.setItem('auth_expires', expiresAt.getTime());
    localStorage.setItem('is_authenticated', 'true');
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
};
