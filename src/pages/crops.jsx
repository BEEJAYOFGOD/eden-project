import { useState } from "react";

export default function CropSelectionScreen() {
    const [selectedCrop, setSelectedCrop] = useState(null);

    const crops = [
        { id: 1, name: "Maize", bgColor: "bg-yellow-100" },
        { id: 2, name: "Cassava", bgColor: "bg-orange-100" },
        { id: 3, name: "Millet", bgColor: "bg-amber-50" },
        { id: 4, name: "Paddy Rice", bgColor: "bg-red-100" },
        { id: 5, name: "Irrigated Rice", bgColor: "bg-yellow-50" },
        { id: 6, name: "Soybeans", bgColor: "bg-yellow-100" },
        { id: 7, name: "Yam", bgColor: "bg-orange-100" },
        { id: 8, name: "Cowpea", bgColor: "bg-green-100" },
    ];

    const handleCropSelect = (crop) => {
        setSelectedCrop(crop);
    };

    const handleRecommendation = () => {
        if (selectedCrop) {
            alert(`Getting recommendations for ${selectedCrop.name}`);
        } else {
            alert("Please select a crop first");
        }
    };

    return (
        <div className="bg-gray-800 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                {/* Header */}
                <div className="bg-white p-4 rounded-t-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                🌱
                            </span>
                        </div>
                        <span className="text-green-600 font-semibold">
                            KISAN
                        </span>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Select Your Crop
                    </h2>
                </div>

                {/* Crop Grid */}
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        {crops.map((crop) => (
                            <div
                                key={crop.id}
                                onClick={() => handleCropSelect(crop)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                                    selectedCrop?.id === crop.id
                                        ? "ring-2 ring-green-500 transform scale-105"
                                        : "hover:shadow-md hover:scale-102"
                                }`}
                            >
                                {/* Image placeholder */}
                                <div
                                    className={`${crop.bgColor} h-24 flex items-center justify-center border-2 border-gray-200`}
                                >
                                    <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">
                                            IMG
                                        </span>
                                    </div>
                                </div>

                                {/* Crop name */}
                                <div className="bg-white p-2 text-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {crop.name}
                                    </span>
                                </div>

                                {/* Selection indicator */}
                                {selectedCrop?.id === crop.id && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">
                                            ✓
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendation Button */}
                <div className="p-4">
                    <button
                        onClick={handleRecommendation}
                        disabled={!selectedCrop}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                            selectedCrop
                                ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        GET RECOMMENDATION
                    </button>
                </div>

                {/* Bottom indicator */}
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium rounded-b-lg">
                    375 × 1071
                </div>
            </div>
        </div>
    );
}
