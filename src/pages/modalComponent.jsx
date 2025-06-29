import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Leaf,
    Sun,
    CloudRain,
    X,
} from "lucide-react";

const CropSelectionModal = ({
    isOpen,
    onClose,
    type = "success", // 'success', 'error', 'warning', 'positive', 'mixed', 'challenging'
    title,
    message,
    selectedCrops = [],
    onConfirm,
    conditionDetails = null, // Additional condition details for farming analysis
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
            case "positive":
                return <CheckCircle className="w-full h-full" />;
            case "error":
            case "challenging":
                return <XCircle className="w-full h-full" />;
            case "warning":
            case "mixed":
                return <AlertTriangle className="w-full h-full" />;
            default:
                return <CheckCircle className="w-full h-full" />;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case "success":
            case "positive":
                return "bg-green-500"; // Green for positive conditions
            case "error":
            case "challenging":
                return "bg-red-500"; // Red for challenging conditions
            case "warning":
            case "mixed":
                return "bg-amber-600"; // Brown/amber for mixed conditions
            default:
                return "bg-green-500";
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "success":
            case "positive":
                return "bg-green-600 hover:bg-green-700 active:bg-green-800";
            case "error":
            case "challenging":
                return "bg-red-600 hover:bg-red-700 active:bg-red-800";
            case "warning":
            case "mixed":
                return "bg-amber-600 hover:bg-amber-700 active:bg-amber-800";
            default:
                return "bg-green-600 hover:bg-green-700 active:bg-green-800";
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md md:max-w-lg w-full mx-2 sm:mx-4 text-center shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {/* Icon */}
                <div className="mb-4 sm:mb-6">
                    <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto ${getIconBgColor()} rounded-full flex items-center justify-center`}
                    >
                        <div className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                            {getIcon()}
                        </div>
                    </div>
                </div>

                {/* Title */}
                {title && (
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                        {title}
                    </h3>
                )}

                {/* Message */}
                <div className="mb-4 sm:mb-6">
                    <div className="text-gray-700 text-xs sm:text-sm leading-relaxed text-left px-1 sm:px-0">
                        {message.split("\n").map((line, index) => {
                            if (line.trim() === "") return <br key={index} />;

                            // Format section headers
                            if (
                                line.includes("✅ Favorable Conditions:") ||
                                line.includes("⚠️ Considerations:") ||
                                line.includes("💡 Recommendations:")
                            ) {
                                return (
                                    <div
                                        key={index}
                                        className="font-semibold text-gray-800 mt-2 sm:mt-3 mb-1 text-xs sm:text-sm"
                                    >
                                        {line}
                                    </div>
                                );
                            }

                            // Format bullet points
                            if (line.startsWith("• ")) {
                                return (
                                    <div
                                        key={index}
                                        className="ml-1 sm:ml-2 mb-1 text-gray-600 text-xs sm:text-sm leading-tight"
                                    >
                                        {line}
                                    </div>
                                );
                            }

                            // Format crop analysis header
                            if (line.includes("Analysis for ")) {
                                return (
                                    <div
                                        key={index}
                                        className="font-bold text-gray-900 mb-2 text-sm sm:text-base"
                                    >
                                        {line}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={index}
                                    className="mb-1 text-xs sm:text-sm"
                                >
                                    {line}
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Crops List */}
                    {selectedCrops.length > 0 && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                                Selected Crops:
                            </p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                {selectedCrops.map((crop, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                    >
                                        {crop}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className={`flex-1 ${getButtonColor()} text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base`}
                        >
                            Continue
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropSelectionModal;
