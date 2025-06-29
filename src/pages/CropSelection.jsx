import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, Leaf } from "lucide-react";
import edenLogo from "../assets/icons/EDEN LOGO 1.png";
import {
    cropsStorage,
    locationStorage,
    weatherStorage,
} from "../utils/localStorage";

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
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [locationData, setLocationData] = useState(null);
    const [weatherData, setWeatherData] = useState(null);

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

        if (storedCrops) {
            setSelectedCrops(storedCrops);
        }
    }, [location.state]);

    const toggleCropSelection = (cropId) => {
        setSelectedCrops((prev) => {
            const newSelection = prev.includes(cropId)
                ? prev.filter((id) => id !== cropId)
                : [...prev, cropId];

            // Save to localStorage
            cropsStorage.save(newSelection);
            return newSelection;
        });
    };

    const handleContinue = () => {
        if (selectedCrops.length === 0) {
            alert("Please select at least one crop to continue");
            return;
        }

        // Save final selection
        cropsStorage.save(selectedCrops);

        // Navigate to dashboard or next page
        navigate("/dashboard", {
            state: {
                locationData,
                weatherData,
                selectedCrops,
            },
        });
    };

    const getRecommendedCrops = () => {
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

                {/* Recommended Crops */}
                {recommendedCrops.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">
                            🌟 Recommended for Your Area
                        </h3>
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
                                            selectedCrops.includes(crop.id)
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 bg-white hover:border-green-300"
                                        }`}
                                    >
                                        {selectedCrops.includes(crop.id) && (
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
                                        <p className="text-xs text-gray-600 text-center">
                                            {crop.season}
                                        </p>
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
                                    selectedCrops.includes(crop.id)
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 bg-white hover:border-green-300"
                                }`}
                            >
                                {selectedCrops.includes(crop.id) && (
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
                {selectedCrops.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-blue-700 text-sm text-center">
                            ✅ {selectedCrops.length} crop
                            {selectedCrops.length > 1 ? "s" : ""} selected
                        </p>
                    </div>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={selectedCrops.length === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue with Selected Crops
                </button>
            </div>
        </div>
    );
};

export default CropSelection;
