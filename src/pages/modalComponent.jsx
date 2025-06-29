import { useState } from "react";

export default function PlantSuccessModal() {
    const [isOpen, setIsOpen] = useState(true);

    const handleConfirm = () => {
        setIsOpen(false);
        // You can add additional logic here
    };

    const handleReopen = () => {
        setIsOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
            {/* Background with blur effect */}
            <div className="fixed inset-0 bg-gradient-to-b from-green-200/30 via-orange-200/30 to-green-300/30 backdrop-blur-sm z-0">
                {/* Header - behind modal */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm p-2 z-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                🌱
                            </span>
                        </div>
                        <span className="text-green-600 font-semibold">
                            EDEN
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="relative z-20 bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="mb-8">
                        <p className="text-gray-800 text-lg font-medium leading-relaxed">
                            It's a good time
                            <br />
                            to plant
                            <span className="inline-block ml-2 text-2xl">
                                😊
                            </span>
                        </p>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 shadow-lg"
                    >
                        Confirm
                    </button>
                </div>
            )}

            {/* Button to reopen modal (for demo purposes) */}
            {!isOpen && (
                <button
                    onClick={handleReopen}
                    className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg"
                >
                    Show Modal
                </button>
            )}
        </div>
    );
}
