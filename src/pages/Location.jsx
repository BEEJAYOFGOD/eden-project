import { Leaf, ChevronDown } from "lucide-react";

const Location = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Header */}
                <div className="bg-white px-4 py-3 shadow-sm">
                    <div className="text-gray-500 text-sm">Sign In Screen</div>
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
                    <h1 className="text-xl font-semibold text-gray-800 text-center mb-12">
                        Select Your Location
                    </h1>

                    {/* Location Selection */}
                    <div className="mb-8">
                        <label className="block text-gray-700 text-sm font-medium mb-3">
                            Choose your location
                        </label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                                // value={selectedLocation}
                            >
                                <option value="">Choose your location</option>
                                <option value="lagos">Lagos, Nigeria</option>
                                <option value="abuja">Abuja, Nigeria</option>
                                <option value="kano">Kano, Nigeria</option>
                                <option value="ibadan">Ibadan, Nigeria</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        // onClick={() => setCurrentScreen("crops")}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    );
};

export default Location;
