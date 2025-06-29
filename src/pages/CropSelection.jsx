import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Leaf,
    Calendar,
    MapPin,
    Thermometer,
} from "lucide-react";
import edenLogo from "../assets/icons/EDEN LOGO 1.png";
import CropSelectionModal from "./modalComponent";
import {
    cropsStorage,
    locationStorage,
    weatherStorage,
} from "../utils/localStorage";
import {
    getCalendarBasedRecommendations,
    getSeasonalInfo,
    getCurrentMonth,
    determineRegion,
} from "../utils/calendarRecommendations";
import { useCropSelectionState } from "../hooks/usePersistedState";

// Import crop images
import cassavaImg from "../assets/crops/cassava 2.png";
import cowpeaImg from "../assets/crops/cowpea 1.png";
import irrigatedRiceImg from "../assets/crops/irrigated rice 1.png";
import maizeImg from "../assets/crops/maize 2.png";
import milletImg from "../assets/crops/millet 2.png";
import riceImg from "../assets/crops/rice 2.png";
import sorghumImg from "../assets/crops/sorghum 1.png";
import yamImg from "../assets/crops/yam tubers 2.png";

const CropSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [calendarRecommendations, setCalendarRecommendations] = useState([]);
    const [seasonalInfo, setSeasonalInfo] = useState(null);

    // Crop data with images and information
    const crops = [
        {
            id: "maize",
            name: "Maize (Corn)",
            image: maizeImg,
            season: "Rainy Season",
            duration: "3-4 months",
            description: "Staple crop, good for most soil types",
        },
        {
            id: "rice",
            name: "Rice",
            image: riceImg,
            season: "Rainy Season",
            duration: "4-5 months",
            description: "Requires adequate water supply",
        },
        {
            id: "irrigated-rice",
            name: "Irrigated Rice",
            image: irrigatedRiceImg,
            season: "All Year",
            duration: "4-5 months",
            description: "Year-round cultivation with irrigation",
        },
        {
            id: "cassava",
            name: "Cassava",
            image: cassavaImg,
            season: "All Year",
            duration: "8-12 months",
            description: "Drought resistant, long-term crop",
        },
        {
            id: "yam",
            name: "Yam",
            image: yamImg,
            season: "Rainy Season",
            duration: "6-8 months",
            description: "Requires well-drained soil",
        },
        {
            id: "cowpea",
            name: "Cowpea (Beans)",
            image: cowpeaImg,
            season: "Dry Season",
            duration: "2-3 months",
            description: "Fast growing, nitrogen fixing",
        },
        {
            id: "sorghum",
            name: "Sorghum",
            image: sorghumImg,
            season: "Rainy Season",
            duration: "3-4 months",
            description: "Drought tolerant cereal crop",
        },
        {
            id: "millet",
            name: "Millet",
            image: milletImg,
            season: "Rainy Season",
            duration: "3-4 months",
            description: "Very drought resistant",
        },
    ];

    useEffect(() => {
        // Load data from localStorage or route state
        const storedLocation = locationStorage.get();
        const storedWeather = weatherStorage.get();
        const storedCrops = cropsStorage.get();

        if (location.state?.locationData) {
            setLocationData(location.state.locationData);
            locationStorage.save(location.state.locationData);
        } else if (storedLocation) {
            setLocationData(storedLocation);
        }

        if (location.state?.weatherData) {
            setWeatherData(location.state.weatherData);
            weatherStorage.save(location.state.weatherData);
        } else if (storedWeather) {
            setWeatherData(storedWeather);
        }

        if (storedCrops && storedCrops.length > 0) {
            setSelectedCrop(storedCrops[0]); // Take only the first crop
        }

        // Get calendar-based recommendations when data is available
        if (weatherData && locationData) {
            const recommendations = getCalendarBasedRecommendations(
                locationData,
                weatherData
            );
            setCalendarRecommendations(recommendations);

            const seasonal = getSeasonalInfo(locationData);
            setSeasonalInfo(seasonal);

            console.log("Calendar recommendations:", recommendations);
            console.log("Seasonal info:", seasonal);
        }
    }, [location.state, weatherData, locationData]);

    const toggleCropSelection = (cropId) => {
        // If the same crop is clicked, deselect it; otherwise select the new crop
        const newSelection = selectedCrop === cropId ? null : cropId;
        setSelectedCrop(newSelection);

        // Save to localStorage (as array for compatibility)
        cropsStorage.save(newSelection ? [newSelection] : []);
    };

    const handleContinue = () => {
        if (!selectedCrop) {
            setModalType("error");
            setModalTitle("No Crop Selected");
            setModalMessage(
                "Please select a crop to continue with your farming plan."
            );
            setShowModal(true);
            return;
        }

        // Save final selection
        cropsStorage.save([selectedCrop]);

        // Get detailed analysis for the selected crop
        const analysis = getDetailedCropAnalysis(selectedCrop);

        setModalType(analysis.type);
        setModalTitle(analysis.title);
        setModalMessage(analysis.message);
        setShowModal(true);
    };

    const handleModalConfirm = () => {
        setShowModal(false);
        // Navigate to dashboard or next page
        navigate("/dashboard", {
            state: {
                locationData,
                weatherData,
                selectedCrops: selectedCrop ? [selectedCrop] : [],
            },
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    // Detailed crop analysis using calendar data and weather conditions
    const getDetailedCropAnalysis = (cropId) => {
        const crop = crops.find((c) => c.id === cropId);
        const calendarCrop = calendarRecommendations.find(
            (rec) => rec.id === cropId
        );

        // Get current weather conditions
        const currentTemp = weatherData?.main?.temp || 25;
        const humidity = weatherData?.main?.humidity || 60;
        const rainfall = weatherData?.rain?.["1h"] || 0;
        const windSpeed = weatherData?.wind?.speed || 0;

        // Convert hourly rainfall to daily estimate
        const dailyRainfall = rainfall * 24;

        let analysis = {
            type: "success",
            title: "Good Planting Conditions",
            message: "",
        };

        let conditions = [];
        let warnings = [];
        let recommendations = [];

        // Calendar-based analysis
        if (calendarCrop) {
            if (calendarCrop.isPlantingMonth) {
                conditions.push("🌱 Perfect planting season");
                recommendations.push(
                    "This is the optimal time to plant " + crop.name
                );
            } else {
                const nextMonth = calendarCrop.plantingMonths[0];
                if (nextMonth) {
                    warnings.push("⏰ Not ideal planting month");
                    recommendations.push(`Best planting time: ${nextMonth}`);
                }
            }

            if (calendarCrop.weatherSuitable) {
                conditions.push("🌤️ Weather conditions favorable");
            } else {
                warnings.push("⚠️ Weather conditions challenging");
            }
        }

        // Detailed weather analysis
        if (currentTemp < 15) {
            warnings.push(
                "🥶 Very cold temperature (" + Math.round(currentTemp) + "°C)"
            );
            recommendations.push(
                "Consider greenhouse or wait for warmer weather"
            );
        } else if (currentTemp < 20) {
            warnings.push(
                "❄️ Cool temperature (" + Math.round(currentTemp) + "°C)"
            );
            recommendations.push(
                "Monitor temperature closely, some crops may grow slowly"
            );
        } else if (currentTemp > 35) {
            warnings.push(
                "🔥 Very hot temperature (" + Math.round(currentTemp) + "°C)"
            );
            recommendations.push(
                "Ensure adequate irrigation and shade protection"
            );
        } else if (currentTemp > 30) {
            conditions.push(
                "☀️ Warm temperature (" + Math.round(currentTemp) + "°C)"
            );
            recommendations.push(
                "Good for heat-tolerant crops, ensure adequate watering"
            );
        } else {
            conditions.push(
                "🌡️ Ideal temperature (" + Math.round(currentTemp) + "°C)"
            );
        }

        // Rainfall analysis
        if (dailyRainfall > 50) {
            warnings.push(
                "🌧️ Heavy rainfall expected (" +
                    Math.round(dailyRainfall) +
                    "mm/day)"
            );
            recommendations.push(
                "Ensure good drainage, delay planting if soil is waterlogged"
            );
        } else if (dailyRainfall > 20) {
            conditions.push(
                "🌦️ Moderate rainfall (" + Math.round(dailyRainfall) + "mm/day)"
            );
            recommendations.push("Good moisture for germination");
        } else if (dailyRainfall > 5) {
            conditions.push(
                "🌤️ Light rainfall (" + Math.round(dailyRainfall) + "mm/day)"
            );
        } else {
            warnings.push("☀️ No rainfall expected");
            recommendations.push(
                "Plan for irrigation, ensure adequate water supply"
            );
        }

        // Humidity analysis
        if (humidity > 80) {
            warnings.push("💧 High humidity (" + humidity + "%)");
            recommendations.push(
                "Watch for fungal diseases, ensure good air circulation"
            );
        } else if (humidity < 40) {
            warnings.push("🏜️ Low humidity (" + humidity + "%)");
            recommendations.push(
                "Increase watering frequency, consider mulching"
            );
        } else {
            conditions.push("💨 Good humidity (" + humidity + "%)");
        }

        // Wind analysis
        if (windSpeed > 10) {
            warnings.push(
                "💨 Strong winds (" + Math.round(windSpeed) + " m/s)"
            );
            recommendations.push("Provide wind protection for young plants");
        } else if (windSpeed > 5) {
            conditions.push(
                "🍃 Moderate breeze (" + Math.round(windSpeed) + " m/s)"
            );
        }

        // Seasonal considerations
        if (seasonalInfo) {
            if (seasonalInfo.isFloodRisk) {
                warnings.push("🌊 Flood risk period");
                recommendations.push(
                    "Choose elevated areas, ensure drainage systems"
                );
            }

            if (seasonalInfo.isRainySeason) {
                conditions.push("🌧️ Rainy season active");
                recommendations.push(
                    "Good for rain-fed crops, monitor for excess water"
                );
            } else {
                conditions.push("☀️ Dry season");
                recommendations.push(
                    "Irrigation essential, consider drought-resistant varieties"
                );
            }
        }

        // Determine overall analysis type based on data.json integration
        const totalFactors = conditions.length + warnings.length;
        const warningRatio = warnings.length / totalFactors;

        if (warningRatio >= 0.7) {
            analysis.type = "challenging";
            analysis.title = "Challenging Conditions - Proceed with Caution";
        } else if (warningRatio >= 0.3) {
            analysis.type = "mixed";
            analysis.title = "Mixed Conditions - Some Precautions Needed";
        } else {
            analysis.type = "positive";
            analysis.title = "Excellent Planting Conditions!";
        }

        // Build comprehensive message
        let message = `Analysis for ${crop.name}:\n\n`;

        if (conditions.length > 0) {
            message += "✅ Favorable Conditions:\n";
            conditions.forEach((condition) => {
                message += `• ${condition}\n`;
            });
            message += "\n";
        }

        if (warnings.length > 0) {
            message += "⚠️ Considerations:\n";
            warnings.forEach((warning) => {
                message += `• ${warning}\n`;
            });
            message += "\n";
        }

        if (recommendations.length > 0) {
            message += "💡 Recommendations:\n";
            recommendations.forEach((rec) => {
                message += `• ${rec}\n`;
            });
        }

        analysis.message = message;
        return analysis;
    };

    const getRecommendedCrops = () => {
        // Use calendar-based recommendations if available
        if (calendarRecommendations.length > 0) {
            // Return top 3 calendar-based recommendations
            return calendarRecommendations.slice(0, 3).map((rec) => rec.id);
        }

        // Fallback to simple weather-based logic if calendar data not available
        if (!weatherData) return [];

        const temp = weatherData.main?.temp || 25;
        const rainfall = weatherData.rain?.["1h"] || 0;

        // Simple recommendation logic based on weather
        const recommended = [];

        if (rainfall > 2) {
            recommended.push("rice", "maize", "yam");
        } else if (rainfall < 1) {
            recommended.push("cassava", "millet", "sorghum");
        }

        if (temp > 28) {
            recommended.push("cassava", "cowpea");
        }

        return recommended;
    };

    const recommendedCrops = getRecommendedCrops();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <div className="text-gray-500 text-sm">Crop Selection</div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <img
                            src={edenLogo}
                            alt="EDEN Logo"
                            className="w-12 h-18 mr-3"
                        />
                        <span className="text-green-600 font-bold text-2xl">
                            EDEN
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-xl font-semibold text-gray-800 text-center mb-2">
                    Select Your Crops
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Choose the crops you want to grow. We'll provide
                    personalized advice for each.
                </p>

                {/* Location Info */}
                {locationData && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                        <p className="text-green-700 text-sm text-center">
                            📍 {locationData.city}, {locationData.state}
                        </p>
                    </div>
                )}

                {/* Seasonal Information */}
                {seasonalInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-medium text-blue-800">
                                {seasonalInfo.currentMonth} •{" "}
                                {seasonalInfo.region}ern Nigeria
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {seasonalInfo.isRainySeason && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    🌧️ Rainy Season
                                </span>
                            )}
                            {seasonalInfo.isFloodRisk && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    ⚠️ Flood Risk
                                </span>
                            )}
                            {!seasonalInfo.isRainySeason && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                    ☀️ Dry Season
                                </span>
                            )}
                        </div>
                        {weatherData && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <h4 className="text-xs font-medium text-blue-800 mb-2">
                                    Current Weather Details:
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                                    <div className="flex items-center gap-1">
                                        <Thermometer className="w-3 h-3" />
                                        <span>
                                            {Math.round(
                                                weatherData.main?.temp || 0
                                            )}
                                            °C
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>💧</span>
                                        <span>
                                            {weatherData.main?.humidity || 0}%
                                            humidity
                                        </span>
                                    </div>
                                    {weatherData.rain?.["1h"] && (
                                        <div className="flex items-center gap-1">
                                            <span>🌧️</span>
                                            <span>
                                                {weatherData.rain["1h"]}mm/hr
                                            </span>
                                        </div>
                                    )}
                                    {weatherData.wind?.speed && (
                                        <div className="flex items-center gap-1">
                                            <span>💨</span>
                                            <span>
                                                {Math.round(
                                                    weatherData.wind.speed
                                                )}{" "}
                                                m/s
                                            </span>
                                        </div>
                                    )}
                                    {weatherData.main?.pressure && (
                                        <div className="flex items-center gap-1">
                                            <span>📊</span>
                                            <span>
                                                {weatherData.main.pressure} hPa
                                            </span>
                                        </div>
                                    )}
                                    {weatherData.main?.feels_like && (
                                        <div className="flex items-center gap-1">
                                            <span>🌡️</span>
                                            <span>
                                                Feels{" "}
                                                {Math.round(
                                                    weatherData.main.feels_like
                                                )}
                                                °C
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Farming-specific weather insights */}
                                <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                    <div className="font-medium text-blue-800 mb-1">
                                        🌾 Farming Insights:
                                    </div>
                                    <div className="text-blue-700">
                                        {(() => {
                                            const temp =
                                                weatherData.main?.temp || 25;
                                            const humidity =
                                                weatherData.main?.humidity ||
                                                60;
                                            const rainfall =
                                                weatherData.rain?.["1h"] || 0;
                                            const insights = [];

                                            if (temp >= 20 && temp <= 30) {
                                                insights.push(
                                                    "🌱 Ideal temperature for most crops"
                                                );
                                            } else if (temp > 30) {
                                                insights.push(
                                                    "☀️ Hot - ensure adequate irrigation"
                                                );
                                            } else {
                                                insights.push(
                                                    "❄️ Cool - growth may be slower"
                                                );
                                            }

                                            if (humidity > 70) {
                                                insights.push(
                                                    "💧 High humidity - watch for diseases"
                                                );
                                            } else if (humidity < 50) {
                                                insights.push(
                                                    "🏜️ Low humidity - increase watering"
                                                );
                                            } else {
                                                insights.push(
                                                    "💨 Good humidity levels"
                                                );
                                            }

                                            if (rainfall > 2) {
                                                insights.push(
                                                    "🌧️ Heavy rain - check drainage"
                                                );
                                            } else if (rainfall > 0) {
                                                insights.push(
                                                    "🌦️ Light rain - good for crops"
                                                );
                                            } else {
                                                insights.push(
                                                    "☀️ No rain - irrigation needed"
                                                );
                                            }

                                            return insights.map(
                                                (insight, index) => (
                                                    <div key={index}>
                                                        • {insight}
                                                    </div>
                                                )
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recommended Crops */}
                {recommendedCrops.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-medium text-gray-800">
                                🌟 Recommended for Your Area
                            </h3>
                            {calendarRecommendations.length > 0 && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                                    📅 Calendar-based
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {crops
                                .filter((crop) =>
                                    recommendedCrops.includes(crop.id)
                                )
                                .map((crop) => (
                                    <div
                                        key={crop.id}
                                        onClick={() =>
                                            toggleCropSelection(crop.id)
                                        }
                                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                            selectedCrop === crop.id
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 bg-white hover:border-green-300"
                                        }`}
                                    >
                                        {selectedCrop === crop.id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <img
                                            src={crop.image}
                                            alt={crop.name}
                                            className="w-12 h-12 mx-auto mb-2 object-contain"
                                        />
                                        <h4 className="font-medium text-gray-800 text-sm text-center mb-1">
                                            {crop.name}
                                        </h4>
                                        <p className="text-xs text-gray-600 text-center mb-1">
                                            {crop.season}
                                        </p>
                                        {(() => {
                                            const calendarCrop =
                                                calendarRecommendations.find(
                                                    (rec) => rec.id === crop.id
                                                );
                                            if (calendarCrop) {
                                                return (
                                                    <div className="text-xs text-center">
                                                        {calendarCrop.isPlantingMonth && (
                                                            <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">
                                                                🌱 Plant now!
                                                            </span>
                                                        )}
                                                        {!calendarCrop.isPlantingMonth &&
                                                            calendarCrop
                                                                .plantingMonths
                                                                .length > 0 && (
                                                                <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                                                                    📅{" "}
                                                                    {
                                                                        calendarCrop
                                                                            .plantingMonths[0]
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* All Crops */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                        All Available Crops
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {crops.map((crop) => (
                            <div
                                key={crop.id}
                                onClick={() => toggleCropSelection(crop.id)}
                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedCrop === crop.id
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 bg-white hover:border-green-300"
                                }`}
                            >
                                {selectedCrop === crop.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <img
                                    src={crop.image}
                                    alt={crop.name}
                                    className="w-12 h-12 mx-auto mb-2 object-contain"
                                />
                                <h4 className="font-medium text-gray-800 text-sm text-center mb-1">
                                    {crop.name}
                                </h4>
                                <p className="text-xs text-gray-600 text-center mb-1">
                                    {crop.season}
                                </p>
                                <p className="text-xs text-gray-500 text-center">
                                    {crop.duration}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Count */}
                {selectedCrop && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-blue-700 text-sm text-center">
                            ✅{" "}
                            {crops.find((c) => c.id === selectedCrop)?.name ||
                                selectedCrop}{" "}
                            selected
                        </p>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedCrop}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue with Selected Crop
                </button>
            </div>

            {/* Crop Selection Modal */}
            <CropSelectionModal
                isOpen={showModal}
                onClose={handleModalClose}
                onConfirm={handleModalConfirm}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                selectedCrops={
                    selectedCrop
                        ? [
                              crops.find((c) => c.id === selectedCrop)?.name ||
                                  selectedCrop,
                          ]
                        : []
                }
            />
        </div>
    );
};

export default CropSelection;
