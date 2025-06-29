/**
 * Custom hook for persisted state management
 * Automatically saves and restores state from localStorage
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that persists state to localStorage with automatic restoration
 * @param {string} key - localStorage key
 * @param {*} defaultValue - default value if no stored value exists
 * @param {number} expiryTime - expiry time in milliseconds (optional)
 * @returns {[value, setValue, clearValue]} - state value, setter, and clear function
 */
export const usePersistedState = (key, defaultValue, expiryTime = null) => {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const parsed = JSON.parse(item);
            
            // Check expiry if provided
            if (expiryTime && parsed.expiry && Date.now() > parsed.expiry) {
                localStorage.removeItem(key);
                return defaultValue;
            }

            return parsed.value || parsed; // Handle both wrapped and unwrapped values
        } catch (error) {
            console.warn(`Failed to load persisted state for key "${key}":`, error);
            return defaultValue;
        }
    });

    const setPersistedValue = useCallback((newValue) => {
        try {
            setValue(newValue);
            
            const dataToStore = expiryTime 
                ? {
                    value: newValue,
                    timestamp: Date.now(),
                    expiry: Date.now() + expiryTime
                }
                : newValue;

            localStorage.setItem(key, JSON.stringify(dataToStore));
        } catch (error) {
            console.warn(`Failed to persist state for key "${key}":`, error);
        }
    }, [key, expiryTime]);

    const clearPersistedValue = useCallback(() => {
        try {
            setValue(defaultValue);
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Failed to clear persisted state for key "${key}":`, error);
        }
    }, [key, defaultValue]);

    return [value, setPersistedValue, clearPersistedValue];
};

/**
 * Hook for managing crop selection page state
 * Persists all relevant state for the crop selection page
 */
export const useCropSelectionState = () => {
    const [selectedCrop, setSelectedCrop, clearSelectedCrop] = usePersistedState(
        'eden_current_selected_crop', 
        null, 
        7 * 24 * 60 * 60 * 1000 // 7 days
    );

    const [calendarRecommendations, setCalendarRecommendations, clearCalendarRecommendations] = usePersistedState(
        'eden_calendar_recommendations', 
        [], 
        6 * 60 * 60 * 1000 // 6 hours
    );

    const [seasonalInfo, setSeasonalInfo, clearSeasonalInfo] = usePersistedState(
        'eden_seasonal_info', 
        null, 
        24 * 60 * 60 * 1000 // 24 hours
    );

    const clearAllCropSelectionState = useCallback(() => {
        clearSelectedCrop();
        clearCalendarRecommendations();
        clearSeasonalInfo();
    }, [clearSelectedCrop, clearCalendarRecommendations, clearSeasonalInfo]);

    return {
        selectedCrop,
        setSelectedCrop,
        calendarRecommendations,
        setCalendarRecommendations,
        seasonalInfo,
        setSeasonalInfo,
        clearAllCropSelectionState
    };
};

/**
 * Hook for managing location page state
 * Persists location detection and weather state
 */
export const useLocationState = () => {
    const [isGettingLocation, setIsGettingLocation, clearIsGettingLocation] = usePersistedState(
        'eden_getting_location_state', 
        false, 
        5 * 60 * 1000 // 5 minutes (short expiry for loading states)
    );

    const [locationError, setLocationError, clearLocationError] = usePersistedState(
        'eden_location_error', 
        null, 
        30 * 60 * 1000 // 30 minutes
    );

    const [weatherError, setWeatherError, clearWeatherError] = usePersistedState(
        'eden_weather_error', 
        null, 
        30 * 60 * 1000 // 30 minutes
    );

    const clearAllLocationState = useCallback(() => {
        clearIsGettingLocation();
        clearLocationError();
        clearWeatherError();
    }, [clearIsGettingLocation, clearLocationError, clearWeatherError]);

    return {
        isGettingLocation,
        setIsGettingLocation,
        locationError,
        setLocationError,
        weatherError,
        setWeatherError,
        clearAllLocationState
    };
};

/**
 * Hook for managing app-wide state
 * Combines all state management hooks
 */
export const useAppState = () => {
    const cropSelectionState = useCropSelectionState();
    const locationState = useLocationState();

    const clearAllAppState = useCallback(() => {
        cropSelectionState.clearAllCropSelectionState();
        locationState.clearAllLocationState();
    }, [cropSelectionState, locationState]);

    return {
        ...cropSelectionState,
        ...locationState,
        clearAllAppState
    };
};

/**
 * Utility function to get storage usage information
 */
export const getStorageUsage = () => {
    try {
        const keys = Object.keys(localStorage);
        const edenKeys = keys.filter(key => key.startsWith('eden_'));
        
        let totalSize = 0;
        const keyInfo = {};

        edenKeys.forEach(key => {
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            
            try {
                const parsed = JSON.parse(value);
                keyInfo[key] = {
                    size: `${(size / 1024).toFixed(2)} KB`,
                    hasExpiry: !!parsed.expiry,
                    isExpired: parsed.expiry ? Date.now() > parsed.expiry : false,
                    timestamp: parsed.timestamp ? new Date(parsed.timestamp).toLocaleString() : 'N/A'
                };
            } catch {
                keyInfo[key] = {
                    size: `${(size / 1024).toFixed(2)} KB`,
                    hasExpiry: false,
                    isExpired: false,
                    timestamp: 'N/A'
                };
            }
        });

        return {
            totalKeys: edenKeys.length,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            keys: keyInfo
        };
    } catch (error) {
        console.warn('Failed to get storage usage:', error);
        return null;
    }
};
