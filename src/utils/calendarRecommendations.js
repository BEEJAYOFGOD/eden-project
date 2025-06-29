/**
 * Calendar-based Crop Recommendation System
 * Uses data.json for intelligent crop recommendations based on:
 * - Current month/season
 * - Regional climate data (North/South Nigeria)
 * - Temperature and rainfall conditions
 * - Planting calendar optimization
 */

import cropCalendarData from '../data.json';

/**
 * Determine the region based on location data
 * @param {Object} locationData - Location information
 * @returns {string} 'North' or 'South'
 */
export const determineRegion = (locationData) => {
    if (!locationData || !locationData.state) {
        return 'South'; // Default to South
    }

    const state = locationData.state.toLowerCase();
    
    // Northern states
    const northernStates = [
        'kano', 'kaduna', 'katsina', 'sokoto', 'kebbi', 'zamfara', 
        'jigawa', 'bauchi', 'gombe', 'yobe', 'borno', 'adamawa',
        'taraba', 'plateau', 'nasarawa', 'niger', 'kwara', 'kogi'
    ];
    
    // Check if the state is in northern region
    const isNorthern = northernStates.some(northernState => 
        state.includes(northernState) || northernState.includes(state)
    );
    
    return isNorthern ? 'North' : 'South';
};

/**
 * Get current month (1-12)
 * @returns {number} Current month
 */
export const getCurrentMonth = () => {
    return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

/**
 * Check if current month is suitable for planting a specific crop
 * @param {Array} plantingMonths - Array of suitable planting months
 * @param {number} currentMonth - Current month (1-12)
 * @returns {boolean} True if current month is suitable for planting
 */
export const isPlantingMonth = (plantingMonths, currentMonth = getCurrentMonth()) => {
    return plantingMonths.includes(currentMonth);
};

/**
 * Check if weather conditions are suitable for a crop
 * @param {Object} cropData - Crop requirements from data.json
 * @param {Object} weatherData - Current weather data
 * @returns {Object} Suitability analysis
 */
export const checkWeatherSuitability = (cropData, weatherData) => {
    if (!weatherData || !cropData) {
        return { suitable: false, reasons: ['No weather data available'] };
    }

    const temp = weatherData.main?.temp || 25;
    const rainfall = (weatherData.rain?.['1h'] || 0) * 24 * 30; // Convert to monthly estimate
    
    const reasons = [];
    let suitable = true;

    // Check temperature range
    if (temp < cropData.min_temp) {
        suitable = false;
        reasons.push(`Temperature too low (${temp}°C < ${cropData.min_temp}°C)`);
    } else if (temp > cropData.max_temp) {
        suitable = false;
        reasons.push(`Temperature too high (${temp}°C > ${cropData.max_temp}°C)`);
    }

    // Check rainfall range
    if (rainfall < cropData.min_rain) {
        reasons.push(`Low rainfall (${Math.round(rainfall)}mm < ${cropData.min_rain}mm)`);
        // Don't mark as unsuitable for low rainfall, just note it
    } else if (rainfall > cropData.max_rain) {
        reasons.push(`High rainfall (${Math.round(rainfall)}mm > ${cropData.max_rain}mm)`);
        // Don't mark as unsuitable for high rainfall, just note it
    }

    return { suitable, reasons, score: suitable ? 1 : 0 };
};

/**
 * Get crop recommendations based on calendar and weather data
 * @param {Object} locationData - Location information
 * @param {Object} weatherData - Current weather data
 * @param {number} currentMonth - Current month (optional, defaults to current)
 * @returns {Array} Array of recommended crops with scores
 */
export const getCalendarBasedRecommendations = (locationData, weatherData, currentMonth = getCurrentMonth()) => {
    const region = determineRegion(locationData);
    const regionData = cropCalendarData.crop_calendar[region];
    
    if (!regionData) {
        console.warn('No regional data found, using default recommendations');
        return [];
    }

    const recommendations = [];
    
    // Analyze each crop
    Object.entries(regionData.crops).forEach(([cropName, cropData]) => {
        let score = 0;
        const reasons = [];
        
        // Check if it's the right planting month (highest priority)
        const isRightMonth = isPlantingMonth(cropData.planting_months, currentMonth);
        if (isRightMonth) {
            score += 50; // High score for correct planting month
            reasons.push(`Perfect planting month (${cropCalendarData.months[currentMonth]})`);
        } else {
            // Check if it's close to planting month
            const nextPlantingMonth = cropData.planting_months.find(month => 
                month > currentMonth || month < currentMonth - 10
            );
            if (nextPlantingMonth) {
                const monthsUntilPlanting = nextPlantingMonth > currentMonth 
                    ? nextPlantingMonth - currentMonth 
                    : (12 - currentMonth) + nextPlantingMonth;
                
                if (monthsUntilPlanting <= 2) {
                    score += 20; // Medium score for upcoming planting season
                    reasons.push(`Planting season approaching (${cropCalendarData.months[nextPlantingMonth]})`);
                }
            }
        }
        
        // Check weather suitability
        const weatherSuitability = checkWeatherSuitability(cropData, weatherData);
        if (weatherSuitability.suitable) {
            score += 30; // Good score for suitable weather
            reasons.push('Weather conditions favorable');
        } else {
            score += 10; // Small score even if weather isn't perfect
            reasons.push(...weatherSuitability.reasons);
        }
        
        // Check if it's rainy season (bonus for rain-dependent crops)
        const isRainySeason = regionData.rainy_season.includes(currentMonth);
        if (isRainySeason && (cropName.includes('rice') || cropName === 'yam')) {
            score += 15;
            reasons.push('Rainy season advantage');
        }
        
        // Check flood risk (penalty for flood-sensitive crops)
        const isFloodRisk = regionData.flood_risk.includes(currentMonth);
        if (isFloodRisk && !cropName.includes('rice')) {
            score -= 10;
            reasons.push('Flood risk period');
        }
        
        // Map crop names to our crop IDs
        const cropId = mapCropNameToId(cropName);
        if (cropId) {
            recommendations.push({
                id: cropId,
                name: cropName,
                score,
                reasons,
                plantingMonths: cropData.planting_months.map(m => cropCalendarData.months[m]),
                isPlantingMonth: isRightMonth,
                weatherSuitable: weatherSuitability.suitable
            });
        }
    });
    
    // Sort by score (highest first) and return top recommendations
    return recommendations
        .sort((a, b) => b.score - a.score)
        .filter(crop => crop.score > 0); // Only return crops with positive scores
};

/**
 * Map crop names from data.json to our crop IDs
 * @param {string} cropName - Crop name from data.json
 * @returns {string|null} Corresponding crop ID or null
 */
const mapCropNameToId = (cropName) => {
    const mapping = {
        'cassava': 'cassava',
        'maize': 'maize',
        'millet': 'millet',
        'cowpea': 'cowpea',
        'irrigated rice': 'rice',
        'rainfed rice': 'rice',
        'sorghum': 'sorghum',
        'yam': 'yam'
    };
    
    return mapping[cropName] || null;
};

/**
 * Get planting advice for a specific crop
 * @param {string} cropId - Crop ID
 * @param {Object} locationData - Location information
 * @param {number} currentMonth - Current month
 * @returns {Object} Planting advice
 */
export const getPlantingAdvice = (cropId, locationData, currentMonth = getCurrentMonth()) => {
    const region = determineRegion(locationData);
    const regionData = cropCalendarData.crop_calendar[region];
    
    if (!regionData) return null;
    
    // Find crop data by ID
    const cropEntry = Object.entries(regionData.crops).find(([name]) => 
        mapCropNameToId(name) === cropId
    );
    
    if (!cropEntry) return null;
    
    const [cropName, cropData] = cropEntry;
    const isCurrentlyPlantable = isPlantingMonth(cropData.planting_months, currentMonth);
    
    return {
        cropName,
        isCurrentlyPlantable,
        plantingMonths: cropData.planting_months.map(m => cropCalendarData.months[m]),
        nextPlantingMonth: cropData.planting_months.find(m => m >= currentMonth) || cropData.planting_months[0],
        temperatureRange: `${cropData.min_temp}°C - ${cropData.max_temp}°C`,
        rainfallRange: `${cropData.min_rain}mm - ${cropData.max_rain}mm`,
        region
    };
};

/**
 * Get seasonal information for the current location
 * @param {Object} locationData - Location information
 * @param {number} currentMonth - Current month
 * @returns {Object} Seasonal information
 */
export const getSeasonalInfo = (locationData, currentMonth = getCurrentMonth()) => {
    const region = determineRegion(locationData);
    const regionData = cropCalendarData.crop_calendar[region];
    
    if (!regionData) return null;
    
    const isRainySeason = regionData.rainy_season.includes(currentMonth);
    const isFloodRisk = regionData.flood_risk.includes(currentMonth);
    
    return {
        region,
        currentMonth: cropCalendarData.months[currentMonth],
        isRainySeason,
        isFloodRisk,
        rainySeasonMonths: regionData.rainy_season.map(m => cropCalendarData.months[m]),
        floodRiskMonths: regionData.flood_risk.map(m => cropCalendarData.months[m])
    };
};
