import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const CropSelectionModal = ({
    isOpen,
    onClose,
    type = "success", // 'success', 'error', 'warning'
    title,
    message,
    selectedCrops = [],
    onConfirm,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-10 h-10 text-white" />;
            case "error":
                return <XCircle className="w-10 h-10 text-white" />;
            case "warning":
                return <AlertTriangle className="w-10 h-10 text-white" />;
            default:
                return <CheckCircle className="w-10 h-10 text-white" />;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500";
            case "error":
                return "bg-red-500";
            case "warning":
                return "bg-yellow-500";
            default:
                return "bg-green-500";
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "success":
                return "bg-green-600 hover:bg-green-700 active:bg-green-800";
            case "error":
                return "bg-red-600 hover:bg-red-700 active:bg-red-800";
            case "warning":
                return "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800";
            default:
                return "bg-green-600 hover:bg-green-700 active:bg-green-800";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            {/* Modal */}
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
                {/* Icon */}
                <div className="mb-6">
                    <div
                        className={`w-16 h-16 mx-auto ${getIconBgColor()} rounded-full flex items-center justify-center`}
                    >
                        {getIcon()}
                    </div>
                </div>

                {/* Title */}
                {title && (
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {title}
                    </h3>
                )}

                {/* Message */}
                <div className="mb-6">
                    <p className="text-gray-700 text-base leading-relaxed">
                        {message}
                    </p>

                    {/* Selected Crops List */}
                    {selectedCrops.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600 mb-2">
                                Selected Crops:
                            </p>
                            <div className="flex flex-wrap gap-2">
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
                <div className="flex gap-3">
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className={`flex-1 ${getButtonColor()} text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg`}
                        >
                            Continue
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropSelectionModal;
