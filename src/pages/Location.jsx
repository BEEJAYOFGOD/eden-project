import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Leaf,
    ChevronDown,
    MapPin,
    ArrowLeft,
    Sun,
    Cloud,
    CloudRain,
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Gauge,
    Loader2,
    AlertTriangle,
} from "lucide-react";

const Location = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = useState("");
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);

    // OpenWeather API key - Get your free API key from https://openweathermap.org/api
    // In production, this should be in environment variables
    const OPENWEATHER_API_KEY = "your_api_key_here"; // Replace with your actual API key

    // Demo mode - set to true to use mock data for testing without API key
    const DEMO_MODE = true;

    // Function to fetch weather data
    const fetchWeatherData = useCallback(
        async (lat, lon) => {
            try {
                setWeatherLoading(true);
                setWeatherError(null);

                if (DEMO_MODE) {
                    // Simulate API delay
                    await new Promise((resolve) => setTimeout(resolve, 1500));

                    // Mock weather data for demo
                    const mockData = {
                        weather: [{ main: "Clear", description: "clear sky" }],
                        main: {
                            temp: 25.5,
                            humidity: 65,
                            pressure: 1013,
                        },
                        wind: {
                            speed: 3.2,
                        },
                        visibility: 10000,
                        name: detectedLocation?.city || "Demo City",
                    };
                    setWeatherData(mockData);
                    return;
                }

                if (OPENWEATHER_API_KEY === "your_api_key_here") {
                    throw new Error(
                        "Please set your OpenWeather API key. Get one free at https://openweathermap.org/api"
                    );
                }

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
                );

                if (!response.ok) {
                    throw new Error(`Weather API error: ${response.status}`);
                }

                const data = await response.json();
                setWeatherData(data);
            } catch (error) {
                console.error("Weather fetch error:", error);
                setWeatherError(
                    error.message ||
                        "Failed to fetch weather data. Please check your API key or try again later."
                );
            } finally {
                setWeatherLoading(false);
            }
        },
        [detectedLocation, DEMO_MODE, OPENWEATHER_API_KEY]
    );

    // Helper function to get weather icon based on weather condition
    const getWeatherIcon = (weatherMain, size = "w-6 h-6") => {
        switch (weatherMain?.toLowerCase()) {
            case "clear":
                return <Sun className={`${size} text-yellow-500`} />;
            case "clouds":
                return <Cloud className={`${size} text-gray-500`} />;
            case "rain":
            case "drizzle":
                return <CloudRain className={`${size} text-blue-500`} />;
            default:
                return <Sun className={`${size} text-yellow-500`} />;
        }
    };

    // Helper function to get farming recommendations based on weather
    const getFarmingRecommendations = (weather) => {
        if (!weather) return [];

        const recommendations = [];
        const temp = weather.main?.temp;
        const humidity = weather.main?.humidity;
        const windSpeed = weather.wind?.speed;

        // Temperature recommendations
        if (temp < 15) {
            recommendations.push({
                icon: <Thermometer className="w-5 h-5 text-blue-500" />,
                title: "Cool Weather",
                description:
                    "Good for cool-season crops like lettuce, spinach, and peas",
            });
        } else if (temp > 30) {
            recommendations.push({
                icon: <Thermometer className="w-5 h-5 text-red-500" />,
                title: "Hot Weather",
                description:
                    "Ensure adequate irrigation. Good for heat-loving crops like tomatoes",
            });
        } else {
            recommendations.push({
                icon: <Thermometer className="w-5 h-5 text-green-500" />,
                title: "Optimal Temperature",
                description: "Perfect conditions for most crops",
            });
        }

        // Humidity recommendations
        if (humidity > 80) {
            recommendations.push({
                icon: <Droplets className="w-5 h-5 text-blue-500" />,
                title: "High Humidity",
                description:
                    "Watch for fungal diseases. Ensure good air circulation",
            });
        } else if (humidity < 40) {
            recommendations.push({
                icon: <Droplets className="w-5 h-5 text-orange-500" />,
                title: "Low Humidity",
                description: "Consider additional watering and mulching",
            });
        }

        // Wind recommendations
        if (windSpeed > 10) {
            recommendations.push({
                icon: <Wind className="w-5 h-5 text-gray-600" />,
                title: "Windy Conditions",
                description: "Protect young plants and check for wind damage",
            });
        }

        return recommendations;
    };

    // Get location data from router state
    useEffect(() => {
        const locationData = location.state?.locationData;
        if (locationData) {
            setDetectedLocation(locationData);
            // Pre-select the detected location if it matches our options
            const detectedLocationString = `${locationData.city}, ${locationData.state}, ${locationData.country}`;
            setSelectedLocation(detectedLocationString);

            // Fetch weather data if coordinates are available
            if (locationData.latitude && locationData.longitude) {
                fetchWeatherData(locationData.latitude, locationData.longitude);
            }
        }
    }, [location.state, fetchWeatherData]);
    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Header */}
                <div className="bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Back
                        </button>
                        <div className="text-gray-500 text-sm">
                            Location Setup
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-8">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-green-600 font-semibold text-lg">
                                EDEN
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-semibold text-gray-800 text-center mb-8">
                        Select Your Location
                    </h1>

                    {/* Detected Location Display */}
                    {detectedLocation && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-green-800 mb-1">
                                        Location Detected
                                    </h3>
                                    <p className="text-green-700 text-sm">
                                        {detectedLocation.city},{" "}
                                        {detectedLocation.state},{" "}
                                        {detectedLocation.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weather Information */}
                    {detectedLocation && (
                        <div className="mb-6">
                            {weatherLoading && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                                        <p className="text-blue-700 text-sm">
                                            Loading weather data...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {weatherError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-red-800 mb-1">
                                                Weather Error
                                            </h3>
                                            <p className="text-red-700 text-sm">
                                                {weatherError}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    fetchWeatherData(
                                                        detectedLocation.latitude,
                                                        detectedLocation.longitude
                                                    )
                                                }
                                                className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {weatherData && !weatherLoading && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                                        {getWeatherIcon(
                                            weatherData.weather?.[0]?.main,
                                            "w-5 h-5"
                                        )}
                                        <span className="ml-2">
                                            Current Weather
                                        </span>
                                    </h3>

                                    {/* Weather Overview */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center">
                                            <Thermometer className="w-4 h-4 text-red-500 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Temperature
                                                </p>
                                                <p className="font-semibold">
                                                    {Math.round(
                                                        weatherData.main?.temp
                                                    )}
                                                    °C
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Droplets className="w-4 h-4 text-blue-500 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Humidity
                                                </p>
                                                <p className="font-semibold">
                                                    {weatherData.main?.humidity}
                                                    %
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Wind className="w-4 h-4 text-gray-600 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Wind Speed
                                                </p>
                                                <p className="font-semibold">
                                                    {weatherData.wind?.speed}{" "}
                                                    m/s
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Eye className="w-4 h-4 text-purple-500 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Visibility
                                                </p>
                                                <p className="font-semibold">
                                                    {(
                                                        weatherData.visibility /
                                                        1000
                                                    ).toFixed(1)}{" "}
                                                    km
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Farming Recommendations */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-gray-800 mb-3">
                                            Farming Recommendations
                                        </h4>
                                        <div className="space-y-3">
                                            {getFarmingRecommendations(
                                                weatherData
                                            ).map((rec, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start"
                                                >
                                                    {rec.icon}
                                                    <div className="ml-3">
                                                        <p className="font-medium text-sm text-gray-800">
                                                            {rec.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {rec.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Location Selection */}
                    <div className="mb-8">
                        <label className="block text-gray-700 text-sm font-medium mb-3">
                            {detectedLocation
                                ? "Confirm or change your location"
                                : "Choose your location"}
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                                value={selectedLocation}
                                onChange={(e) =>
                                    setSelectedLocation(e.target.value)
                                }
                            >
                                <option value="">Choose your location</option>
                                {detectedLocation && (
                                    <option
                                        value={`${detectedLocation.city}, ${detectedLocation.state}, ${detectedLocation.country}`}
                                    >
                                        {detectedLocation.city},{" "}
                                        {detectedLocation.state},{" "}
                                        {detectedLocation.country} (Detected)
                                    </option>
                                )}
                                <option value="Lagos, Lagos State, Nigeria">
                                    Lagos, Lagos State, Nigeria
                                </option>
                                <option value="Abuja, FCT, Nigeria">
                                    Abuja, FCT, Nigeria
                                </option>
                                <option value="Kano, Kano State, Nigeria">
                                    Kano, Kano State, Nigeria
                                </option>
                                <option value="Ibadan, Oyo State, Nigeria">
                                    Ibadan, Oyo State, Nigeria
                                </option>
                                <option value="Port Harcourt, Rivers State, Nigeria">
                                    Port Harcourt, Rivers State, Nigeria
                                </option>
                                <option value="Kaduna, Kaduna State, Nigeria">
                                    Kaduna, Kaduna State, Nigeria
                                </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={() => {
                            if (selectedLocation) {
                                // Here you can handle the selected location
                                console.log(
                                    "Selected location:",
                                    selectedLocation
                                );
                                // For now, just show an alert
                                alert(
                                    `Location confirmed: ${selectedLocation}`
                                );
                            } else {
                                alert("Please select a location to continue");
                            }
                        }}
                        disabled={!selectedLocation}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    );
};

export default Location;
