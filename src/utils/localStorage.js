// localStorage utility for managing app state across sessions
// Designed for offline-conscious farming app

const STORAGE_KEYS = {
    LOCATION: 'eden_location_data',
    WEATHER: 'eden_weather_data',
    CROPS: 'eden_selected_crops',
    USER_PREFERENCES: 'eden_user_preferences',
    WAITLIST: 'eden_waitlist_data'
};

const EXPIRY_TIMES = {
    LOCATION: 6 * 60 * 60 * 1000, // 6 hours
    WEATHER: 30 * 60 * 1000, // 30 minutes
    CROPS: 7 * 24 * 60 * 60 * 1000, // 7 days
    USER_PREFERENCES: 30 * 24 * 60 * 60 * 1000, // 30 days
    WAITLIST: 365 * 24 * 60 * 60 * 1000 // 1 year
};

// Generic storage functions with expiry
const setWithExpiry = (key, value, expiryTime) => {
    try {
        const item = {
            value: value,
            timestamp: Date.now(),
            expiry: Date.now() + expiryTime
        };
        localStorage.setItem(key, JSON.stringify(item));
        return true;
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
        return false;
    }
};

const getWithExpiry = (key) => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = Date.now();

        // Check if expired
        if (now > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        localStorage.removeItem(key); // Clean up corrupted data
        return null;
    }
};

// Location data storage
export const locationStorage = {
    save: (locationData) => {
        return setWithExpiry(STORAGE_KEYS.LOCATION, locationData, EXPIRY_TIMES.LOCATION);
    },
    get: () => {
        return getWithExpiry(STORAGE_KEYS.LOCATION);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.LOCATION);
    }
};

// Weather data storage
export const weatherStorage = {
    save: (weatherData) => {
        return setWithExpiry(STORAGE_KEYS.WEATHER, weatherData, EXPIRY_TIMES.WEATHER);
    },
    get: () => {
        return getWithExpiry(STORAGE_KEYS.WEATHER);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.WEATHER);
    }
};

// Selected crops storage
export const cropsStorage = {
    save: (cropsData) => {
        return setWithExpiry(STORAGE_KEYS.CROPS, cropsData, EXPIRY_TIMES.CROPS);
    },
    get: () => {
        return getWithExpiry(STORAGE_KEYS.CROPS);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.CROPS);
    }
};

// User preferences storage
export const userPreferencesStorage = {
    save: (preferences) => {
        return setWithExpiry(STORAGE_KEYS.USER_PREFERENCES, preferences, EXPIRY_TIMES.USER_PREFERENCES);
    },
    get: () => {
        return getWithExpiry(STORAGE_KEYS.USER_PREFERENCES);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    }
};

// Waitlist data storage
export const waitlistStorage = {
    save: (waitlistData) => {
        return setWithExpiry(STORAGE_KEYS.WAITLIST, waitlistData, EXPIRY_TIMES.WAITLIST);
    },
    get: () => {
        return getWithExpiry(STORAGE_KEYS.WAITLIST);
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.WAITLIST);
    }
};

// Utility functions
export const clearAllStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};

export const getStorageInfo = () => {
    const info = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const item = localStorage.getItem(key);
        if (item) {
            try {
                const parsed = JSON.parse(item);
                info[name] = {
                    hasData: true,
                    timestamp: new Date(parsed.timestamp).toLocaleString(),
                    expiresAt: new Date(parsed.expiry).toLocaleString(),
                    isExpired: Date.now() > parsed.expiry
                };
            } catch {
                info[name] = { hasData: false, error: 'Invalid data' };
            }
        } else {
            info[name] = { hasData: false };
        }
    });
    return info;
};
