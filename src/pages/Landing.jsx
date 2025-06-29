import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Leaf,
    MapPin,
    Users,
    TrendingUp,
    ArrowRight,
    Loader2,
    AlertCircle,
    CloudRain,
    CloudDrizzle,
    Sun,
    Cloud,
    Droplets,
    Phone,
    MessageCircle,
    CheckCircle,
    Smartphone,
    Wifi,
    Clock,
    Star,
    ChevronDown,
    Send,
} from "lucide-react";
import edenLogo from "../assets/icons/EDEN LOGO 1.png";
import { waitlistStorage } from "../utils/localStorage";

const Landing = () => {
    const navigate = useNavigate();
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlistData, setWaitlistData] = useState({
        name: "",
        phone: "",
        state: "",
    });
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    // OpenWeather API key
    const OPENWEATHER_API_KEY = "7ac6fb57238337357fd4b67ae4f31df2";

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
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 seconds timeout
                    maximumAge: 300000, // 5 minutes cache
                });
            });

            const { latitude, longitude } = position.coords;

            // Reverse geocoding to get address details
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (!response.ok) {
                throw new Error(
                    `Network error: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();

            const locationData = {
                state:
                    data.principalSubdivision ||
                    data.locality ||
                    "Unknown State",
                country: data.countryName || "Unknown Country",
                city: data.city || data.locality || "Unknown City",
                latitude,
                longitude,
            };

            // Navigate to location page with location data
            navigate("/location", { state: { locationData } });
        } catch (err) {
            let errorMessage = "Failed to get location";

            if (err.code) {
                // Geolocation API errors
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage =
                            "Location access denied. Please enable location access and try again.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage =
                            "Location information unavailable. Please check your GPS settings.";
                        break;
                    case err.TIMEOUT:
                        errorMessage =
                            "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage = "Unknown geolocation error occurred.";
                }
            } else if (err.message.includes("Network")) {
                errorMessage =
                    "Network error: Please check your internet connection and try again.";
            } else if (err.message.includes("not supported")) {
                errorMessage =
                    "Geolocation not supported by this browser. Please use a modern browser.";
            } else {
                errorMessage =
                    err.message ||
                    "An unexpected error occurred. Please try again.";
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
        navigate("/location", { state: { locationData: null } });
    };

    const handleWaitlistSubmit = (e) => {
        e.preventDefault();
        if (waitlistData.name && waitlistData.phone) {
            // Save to localStorage
            waitlistStorage.save({
                ...waitlistData,
                timestamp: Date.now(),
                id: Date.now().toString(),
            });
            setWaitlistSubmitted(true);
            setTimeout(() => {
                setShowWaitlist(false);
                setWaitlistSubmitted(false);
            }, 3000);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
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
                </div>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                        🌾 Farming Made Easy for
                        <span className="text-green-600 block">
                            Nigerian Farmers
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Get rainfall alerts, planting advice, and crop tips sent
                        directly to your WhatsApp. No internet needed after
                        setup!
                    </p>

                    {/* Hero CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        <button
                            onClick={handleGetStarted}
                            disabled={isGettingLocation}
                            className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center text-lg"
                        >
                            {isGettingLocation ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    {weatherLoading
                                        ? "Getting Weather..."
                                        : "Getting Location..."}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Use My Location
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setShowWaitlist(true)}
                            className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center text-lg"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Join WhatsApp Alerts
                        </button>
                    </div>

                    {/* Error Message */}
                    {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-red-700 text-sm">
                                        {locationError}
                                    </p>
                                    <button
                                        onClick={handleGetStarted}
                                        className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Features Section */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                        Why Nigerian Farmers Love EDEN
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-4xl mb-4">🌧️</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Rainfall Alerts
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Get WhatsApp alerts before rain comes. Plan your
                                planting and harvesting perfectly.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-4xl mb-4">🌱</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Planting Advice
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Know exactly when to plant maize, rice, cassava
                                and other crops in your area.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Local Forecasts
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Weather predictions specific to your village,
                                LGA, and state.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                WhatsApp Tips
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Daily farming tips sent to your WhatsApp. No
                                data needed to receive messages.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                        How EDEN Works - Simple as 1, 2, 3!
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">
                                    1
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                📍 Share Your Location
                            </h3>
                            <p className="text-gray-600">
                                Tell us your village, LGA, or state. We'll get
                                weather data for your exact area.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">
                                    2
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                🌾 Choose Your Crops
                            </h3>
                            <p className="text-gray-600">
                                Select what you want to grow - maize, rice,
                                cassava, yam, or any other crop.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">
                                    3
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                💬 Get WhatsApp Alerts
                            </h3>
                            <p className="text-gray-600">
                                Receive daily tips, weather alerts, and planting
                                advice directly on WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Testimonial Section */}
                <div className="mb-16">
                    <div className="bg-green-50 rounded-2xl p-8 max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-5 h-5 text-yellow-400 fill-current"
                                    />
                                ))}
                            </div>
                            <blockquote className="text-lg md:text-xl text-gray-700 italic mb-4">
                                "Before EDEN, I lost my maize crop to unexpected
                                rain. Now I get WhatsApp alerts 3 days before
                                any weather change. My harvest increased by 40%
                                last season!"
                            </blockquote>
                            <div className="flex items-center justify-center">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">
                                        BA
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Baba Audu
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Maize Farmer, Niger State
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                        Common Questions
                    </h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            {
                                question:
                                    "Do I need internet to receive WhatsApp messages?",
                                answer: "No! Once you join our WhatsApp group, you'll receive messages even without internet. WhatsApp works on basic phones and uses very little data.",
                            },
                            {
                                question: "How much does it cost to use EDEN?",
                                answer: "EDEN is completely FREE for Nigerian farmers. We believe every farmer deserves access to weather information.",
                            },
                            {
                                question: "What crops does EDEN support?",
                                answer: "We support all major Nigerian crops: maize, rice, cassava, yam, millet, sorghum, cowpea, and many more. Just tell us what you grow!",
                            },
                            {
                                question:
                                    "How accurate are the weather predictions?",
                                answer: "We use the same weather data that meteorologists use. Our predictions are 85-90% accurate for 3-day forecasts.",
                            },
                            {
                                question:
                                    "Can I use EDEN if I don't have a smartphone?",
                                answer: "Yes! EDEN works on any phone that can receive WhatsApp messages, including basic phones.",
                            },
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-sm border"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                                >
                                    <span className="font-medium text-gray-900">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 transition-transform ${
                                            openFaq === index
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 pb-4">
                                        <p className="text-gray-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We'll detect your location to provide personalized
                            farming recommendations.
                        </p>

                        {/* Error Message */}
                        {locationError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <p className="text-red-700 text-sm">
                                        {locationError}
                                    </p>
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

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <img
                                    src={edenLogo}
                                    alt="EDEN Logo"
                                    className="w-12 h-18 mr-2"
                                />
                                <span className="text-white font-bold text-xl">
                                    EDEN
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Empowering Nigerian farmers with smart weather
                                insights and farming advice.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Contact Us</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>+234 800 EDEN (3336)</span>
                                </div>
                                <div className="flex items-center">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    <a
                                        href="https://wa.me/2348000000000"
                                        className="hover:text-green-400"
                                    >
                                        WhatsApp Support
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <a
                                        href="#"
                                        className="hover:text-green-400"
                                    >
                                        About EDEN
                                    </a>
                                </div>
                                <div>
                                    <a
                                        href="#"
                                        className="hover:text-green-400"
                                    >
                                        Privacy Policy
                                    </a>
                                </div>
                                <div>
                                    <a
                                        href="#"
                                        className="hover:text-green-400"
                                    >
                                        Terms of Service
                                    </a>
                                </div>
                                <div>
                                    <a
                                        href="#"
                                        className="hover:text-green-400"
                                    >
                                        Help Center
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                        <p>
                            © 2024 EDEN. Built with ❤️ for Nigerian farmers. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Waitlist Modal */}
            {showWaitlist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        {waitlistSubmitted ? (
                            <div className="text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    You're on the list! 🎉
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    We'll send you a WhatsApp message when EDEN
                                    is ready for your area.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Join EDEN WhatsApp Alerts
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Be the first to get weather alerts and
                                    farming tips on WhatsApp!
                                </p>

                                <form
                                    onSubmit={handleWaitlistSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={waitlistData.name}
                                            onChange={(e) =>
                                                setWaitlistData({
                                                    ...waitlistData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            WhatsApp Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={waitlistData.phone}
                                            onChange={(e) =>
                                                setWaitlistData({
                                                    ...waitlistData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="+234 800 000 0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={waitlistData.state}
                                            onChange={(e) =>
                                                setWaitlistData({
                                                    ...waitlistData,
                                                    state: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="e.g., Lagos, Kano, Rivers"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Join Waitlist
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowWaitlist(false)
                                            }
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;
