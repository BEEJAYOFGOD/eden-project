import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { locationStorage, weatherStorage } from "../utils/localStorage";
import {
    MapPin,
    ArrowLeft,
    Sun,
    Cloud,
    CloudRain,
    Thermometer,
    Droplets,
    Wind,
    Eye,
    CloudDrizzle,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import edenLogo from "../assets/icons/EDEN LOGO 1.png";

const Location = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);

    // OpenWeather API key
    const OPENWEATHER_API_KEY = "7ac6fb57238337357fd4b67ae4f31df2";

    // Function to fetch weather data
    const fetchWeatherData = useCallback(
        async (lat, lon) => {
            try {
                setWeatherLoading(true);
                setWeatherError(null);

                // Using One Call API 3.0 for comprehensive weather data including rainfall
                const response = await fetch(
                    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely,alerts`
                );

                if (!response.ok) {
                    // Fallback to v2.5 if v3.0 fails (in case of subscription issues)
                    const fallbackResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
                    );

                    if (!fallbackResponse.ok) {
                        throw new Error(
                            `Weather API error: ${fallbackResponse.status}`
                        );
                    }

                    const fallbackData = await fallbackResponse.json();
                    setWeatherData(fallbackData);
                    return;
                }

                const data = await response.json();
                // Transform v3.0 data to include rainfall and other enhanced data
                const transformedData = {
                    weather: [
                        {
                            main: data.current.weather[0].main,
                            description: data.current.weather[0].description,
                            icon: data.current.weather[0].icon,
                        },
                    ],
                    main: {
                        temp: data.current.temp,
                        humidity: data.current.humidity,
                        pressure: data.current.pressure,
                        feels_like: data.current.feels_like,
                    },
                    wind: {
                        speed: data.current.wind_speed,
                        deg: data.current.wind_deg,
                    },
                    visibility: data.current.visibility,
                    rain: data.current.rain || { "1h": 0 }, // Rainfall data from v3.0
                    clouds: data.current.clouds,
                    name: detectedLocation?.city || "Current Location",
                    uvi: data.current.uvi, // UV Index from v3.0
                    hourly: data.hourly ? data.hourly.slice(0, 24) : [], // Next 24 hours
                    daily: data.daily ? data.daily.slice(0, 7) : [], // Next 7 days
                };

                setWeatherData(transformedData);
                // Save weather data to localStorage
                weatherStorage.save(transformedData);
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
        [OPENWEATHER_API_KEY, detectedLocation?.city]
    );

    // Helper function to get weather icon based on weather condition
    const getWeatherIcon = (weatherMain, size = "w-6 h-6") => {
        switch (weatherMain?.toLowerCase()) {
            case "clear":
                return <Sun className={`${size} text-yellow-500`} />;
            case "clouds":
                return <Cloud className={`${size} text-gray-500`} />;
            case "rain":
                return <CloudRain className={`${size} text-blue-600`} />;
            case "drizzle":
                return <CloudDrizzle className={`${size} text-blue-500`} />;
            case "thunderstorm":
                return <CloudRain className={`${size} text-purple-600`} />;
            case "snow":
                return <Cloud className={`${size} text-blue-300`} />;
            case "mist":
            case "fog":
            case "haze":
                return <Cloud className={`${size} text-gray-400`} />;
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
        const rainfall = weather.rain?.["1h"] || 0;
        const uvIndex = weather.uvi;

        // Temperature recommendations
        if (temp < 15) {
            recommendations.push({
                icon: <Thermometer className="w-6 h-6 text-blue-500" />,
                title: "Cool Weather",
                description:
                    "Perfect for cool-season crops like lettuce, spinach, peas, and broccoli",
            });
        } else if (temp > 30) {
            recommendations.push({
                icon: <Thermometer className="w-6 h-6 text-red-500" />,
                title: "Hot Weather",
                description:
                    "Ensure adequate irrigation. Ideal for heat-loving crops like tomatoes, peppers, and okra",
            });
        } else {
            recommendations.push({
                icon: <Thermometer className="w-6 h-6 text-green-500" />,
                title: "Optimal Temperature",
                description:
                    "Perfect conditions for most crops including beans, corn, and squash",
            });
        }

        // Humidity recommendations
        if (humidity > 80) {
            recommendations.push({
                icon: <Droplets className="w-6 h-6 text-blue-500" />,
                title: "High Humidity",
                description:
                    "Monitor for fungal diseases. Ensure good air circulation and avoid overhead watering",
            });
        } else if (humidity < 40) {
            recommendations.push({
                icon: <Droplets className="w-6 h-6 text-orange-500" />,
                title: "Low Humidity",
                description:
                    "Increase watering frequency and consider mulching to retain moisture",
            });
        }

        // Rainfall recommendations
        if (rainfall > 5) {
            recommendations.push({
                icon: <CloudDrizzle className="w-6 h-6 text-blue-600" />,
                title: "Heavy Rainfall",
                description:
                    "Ensure proper drainage. Delay planting and harvesting activities",
            });
        } else if (rainfall > 0) {
            recommendations.push({
                icon: <CloudDrizzle className="w-6 h-6 text-green-600" />,
                title: "Light Rain",
                description:
                    "Good natural irrigation. Reduce watering schedule accordingly",
            });
        }

        // UV Index recommendations
        if (uvIndex > 8) {
            recommendations.push({
                icon: <Sun className="w-6 h-6 text-red-500" />,
                title: "Very High UV",
                description:
                    "Provide shade for sensitive crops. Work during early morning or evening",
            });
        } else if (uvIndex > 6) {
            recommendations.push({
                icon: <Sun className="w-6 h-6 text-orange-500" />,
                title: "High UV",
                description:
                    "Monitor plants for sun stress. Consider shade cloth for delicate crops",
            });
        }

        // Wind recommendations
        if (windSpeed > 10) {
            recommendations.push({
                icon: <Wind className="w-6 h-6 text-gray-600" />,
                title: "Windy Conditions",
                description:
                    "Stake tall plants and protect young seedlings from wind damage",
            });
        }

        return recommendations;
    };

    // Get location data from router state or localStorage
    useEffect(() => {
        const routeLocationData = location.state?.locationData;
        const storedLocationData = locationStorage.get();
        const storedWeatherData = weatherStorage.get();

        const locationData = routeLocationData || storedLocationData;

        if (locationData) {
            setDetectedLocation(locationData);
            // Save to localStorage if from route
            if (routeLocationData) {
                locationStorage.save(locationData);
            }

            // Location detected and ready for use

            // Use stored weather data if available and recent
            if (storedWeatherData && !routeLocationData) {
                setWeatherData(storedWeatherData);
            } else if (locationData.latitude && locationData.longitude) {
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
                    <h1 className="text-xl font-semibold text-gray-800 text-center mb-8">
                        Detect Your Location
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
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div className="flex items-center">
                                            <Thermometer className="w-8 h-8 text-red-500 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Temperature
                                                </p>
                                                <p className="font-bold text-lg">
                                                    {Math.round(
                                                        weatherData.main?.temp
                                                    )}
                                                    °C
                                                </p>
                                                {weatherData.main
                                                    ?.feels_like && (
                                                    <p className="text-xs text-gray-500">
                                                        Feels like{" "}
                                                        {Math.round(
                                                            weatherData.main
                                                                .feels_like
                                                        )}
                                                        °C
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Droplets className="w-8 h-8 text-blue-500 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Humidity
                                                </p>
                                                <p className="font-bold text-lg">
                                                    {weatherData.main?.humidity}
                                                    %
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Wind className="w-8 h-8 text-gray-600 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Wind Speed
                                                </p>
                                                <p className="font-bold text-lg">
                                                    {weatherData.wind?.speed}{" "}
                                                    m/s
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Eye className="w-8 h-8 text-purple-500 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Visibility
                                                </p>
                                                <p className="font-bold text-lg">
                                                    {(
                                                        weatherData.visibility /
                                                        1000
                                                    ).toFixed(1)}{" "}
                                                    km
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rainfall Data - Enhanced */}
                                        <div className="flex items-center">
                                            {(() => {
                                                const rainfall =
                                                    weatherData.rain?.["1h"] ||
                                                    0;
                                                if (rainfall > 5) {
                                                    return (
                                                        <CloudRain className="w-8 h-8 text-blue-700 mr-3" />
                                                    );
                                                } else if (rainfall > 0) {
                                                    return (
                                                        <CloudDrizzle className="w-8 h-8 text-blue-500 mr-3" />
                                                    );
                                                } else {
                                                    return (
                                                        <Droplets className="w-8 h-8 text-blue-400 mr-3" />
                                                    );
                                                }
                                            })()}
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Rainfall (1h)
                                                </p>
                                                <p className="font-bold text-lg text-blue-600">
                                                    {weatherData.rain?.["1h"] ||
                                                        0}{" "}
                                                    mm
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(() => {
                                                        const rainfall =
                                                            weatherData.rain?.[
                                                                "1h"
                                                            ] || 0;
                                                        if (rainfall > 10)
                                                            return "🌧️ Heavy rain - ensure drainage";
                                                        if (rainfall > 5)
                                                            return "🌦️ Moderate rain - good for crops";
                                                        if (rainfall > 0)
                                                            return "🌤️ Light rain - beneficial";
                                                        return "☀️ No rain - consider irrigation";
                                                    })()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* UV Index if available */}
                                        {weatherData.uvi !== undefined && (
                                            <div className="flex items-center">
                                                <Sun className="w-8 h-8 text-orange-500 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        UV Index
                                                    </p>
                                                    <p className="font-bold text-lg">
                                                        {Math.round(
                                                            weatherData.uvi
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {weatherData.uvi < 3
                                                            ? "Low"
                                                            : weatherData.uvi <
                                                              6
                                                            ? "Moderate"
                                                            : weatherData.uvi <
                                                              8
                                                            ? "High"
                                                            : "Very High"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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

                    {/* Continue Button */}
                    <button
                        onClick={() => {
                            if (detectedLocation) {
                                // Save detected location data
                                locationStorage.save(detectedLocation);

                                // Navigate to crop selection
                                navigate("/crops", {
                                    state: {
                                        locationData: detectedLocation,
                                        weatherData,
                                    },
                                });
                            } else {
                                alert(
                                    "Please allow location access to continue"
                                );
                            }
                        }}
                        disabled={!detectedLocation}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to Crop Selection
                    </button>
                </div>
            </div>
        </>
    );
};

export default Location;
