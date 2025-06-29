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

        // Check weather conditions and show appropriate modal
        const currentTemp = weatherData?.main?.temp || 25;
        const rainfall = weatherData?.rain?.["1h"] || 0;

        if (rainfall > 5) {
            setModalType("warning");
            setModalTitle("Heavy Rain Expected");
            setModalMessage(
                "There's heavy rainfall expected. Consider waiting for better weather conditions before planting."
            );
        } else if (currentTemp < 20 || currentTemp > 35) {
            setModalType("warning");
            setModalTitle("Temperature Alert");
            setModalMessage(
                "Current temperature conditions may not be ideal for some crops. Please check individual crop requirements."
            );
        } else {
            setModalType("success");
            setModalTitle("Perfect Planting Conditions!");
            setModalMessage(
                "Weather conditions are favorable for planting your selected crops. It's a great time to start farming!"
            );
        }

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
                                <div className="flex items-center gap-4 text-xs text-blue-700">
                                    <span className="flex items-center gap-1">
                                        <Thermometer className="w-3 h-3" />
                                        {Math.round(
                                            weatherData.main?.temp || 0
                                        )}
                                        °C
                                    </span>
                                    {weatherData.rain?.["1h"] && (
                                        <span>
                                            🌧️ {weatherData.rain["1h"]}mm/hr
                                        </span>
                                    )}
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
