import React from "react";
import { Leaf, Cloud, Calendar } from "lucide-react";

export default function PlantingRecommendations() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <h1 className="text-lg font-medium text-gray-800">
                    Sign in Screen
                </h1>
            </div>

            {/* Main Content */}
            <div className="px-4 py-6 space-y-4">
                {/* Logo and Title */}
                <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-green-700 font-semibold text-sm">
                        EDEN
                    </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Planting Recommendations
                </h2>

                {/* Location Card */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-800 mb-1">
                                Location
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                                State: Oindo State
                            </p>
                            <p className="text-sm text-gray-600">Crop: Maize</p>
                        </div>
                        <div className="w-20 h-16 bg-gradient-to-b from-blue-200 to-green-300 rounded-lg flex items-center justify-center">
                            <div className="text-xs text-center text-gray-600">
                                Farm Field
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weather Forecast Card */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Cloud className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        24°
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        5-Day
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">
                                Weather Forecast
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                                Rainfall: Moderate
                            </p>
                            <p className="text-sm text-gray-600">
                                Temperature: 28°C
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recommended Planting Window Card */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-1">
                                Recommended Planting Window
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                                July 5 - July 15
                            </p>
                            <p className="text-xs text-gray-500">
                                Optimal planting period based on climate data
                            </p>
                        </div>
                        <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center ml-4">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
