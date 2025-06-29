import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, MapPin, Users, TrendingUp, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);

    // Function to get location using geolocation API
    const getLocation = async () => {
        try {
            setIsGettingLocation(true);
            setLocationError(null);

            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported by this browser");
            }

            // Get current position
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000, // 10 seconds timeout
                        maximumAge: 300000 // 5 minutes cache
                    }
                );
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocoding to get address details
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (!response.ok) {
                throw new Error(`Network error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            const locationData = {
                state: data.principalSubdivision || data.locality || "Unknown State",
                country: data.countryName || "Unknown Country",
                city: data.city || data.locality || "Unknown City",
                latitude,
                longitude
            };

            // Navigate to location page with location data
            navigate('/location', { state: { locationData } });

        } catch (err) {
            let errorMessage = "Failed to get location";
            
            if (err.code) {
                // Geolocation API errors
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = "Location access denied. Please enable location access and try again.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable. Please check your GPS settings.";
                        break;
                    case err.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage = "Unknown geolocation error occurred.";
                }
            } else if (err.message.includes("Network")) {
                errorMessage = "Network error: Please check your internet connection and try again.";
            } else if (err.message.includes("not supported")) {
                errorMessage = "Geolocation not supported by this browser. Please use a modern browser.";
            } else {
                errorMessage = err.message || "An unexpected error occurred. Please try again.";
            }
            
            setLocationError(errorMessage);
        } finally {
            setIsGettingLocation(false);
        }
    };

    const handleGetStarted = () => {
        getLocation();
    };

    const handleSkipLocation = () => {
        // Navigate to location page without location data
        navigate('/location', { state: { locationData: null } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-green-600 font-bold text-2xl">EDEN</span>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Smart Farming for
                        <span className="text-green-600 block">Everyone</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Get personalized farming recommendations, weather insights, and crop management 
                        tools tailored to your location and farming goals.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Location-Based Insights</h3>
                        <p className="text-gray-600">
                            Get farming recommendations tailored to your specific location, climate, and soil conditions.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Analytics</h3>
                        <p className="text-gray-600">
                            Track your crop performance, monitor growth patterns, and optimize your farming strategies.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Support</h3>
                        <p className="text-gray-600">
                            Connect with other farmers, share experiences, and learn from agricultural experts.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                        <p className="text-gray-600 mb-6">
                            We'll detect your location to provide personalized farming recommendations.
                        </p>

                        {/* Error Message */}
                        {locationError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <p className="text-red-700 text-sm">{locationError}</p>
                                </div>
                            </div>
                        )}

                        {/* Get Started Button */}
                        <button
                            onClick={handleGetStarted}
                            disabled={isGettingLocation}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center"
                        >
                            {isGettingLocation ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Getting Location...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>

                        {/* Skip Button */}
                        <button
                            onClick={handleSkipLocation}
                            disabled={isGettingLocation}
                            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                        >
                            Skip location detection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
