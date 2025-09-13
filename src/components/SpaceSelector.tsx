import { ChevronRight, MapPin } from "lucide-react";
import type { Amenity } from "../types";

interface SpaceSelectorProps {
    spaces: Amenity[];
    selectedSpace: string;
    onSpaceSelect: (spaceName: string) => void;
    getAvailableTimesCount: (spaceName: string) => number;
}

function SpaceSelector({ 
    spaces, 
    selectedSpace, 
    onSpaceSelect, 
    getAvailableTimesCount 
}: SpaceSelectorProps) {
    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 h-full">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-gray-600" />
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Amenities
                    </h2>
                </div>
                <p className="text-gray-600 text-lg mt-2">Selecciona un espacio para reservar</p>
            </div>

            {/* Amenities List */}
            <div className="space-y-6 overflow-hidden">
                {spaces.map((space) => (
                    <div
                        key={space.name}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                            selectedSpace === space.name 
                                ? "bg-gray-800 text-white shadow-lg" 
                                : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => onSpaceSelect(space.name)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{space.name}</h3>
                                <div className="space-y-2">
                                    <p className={`text-sm font-medium ${
                                        selectedSpace === space.name ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        Capacidad: {space.capacity || 'N/A'}
                                    </p>
                                    <p className={`text-sm font-medium ${
                                        selectedSpace === space.name ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        Duración máx: {space.maxDuration || 60} min
                                    </p>
                                </div>
                            </div>
                            {selectedSpace === space.name && (
                                <ChevronRight className="w-6 h-6 text-white" />
                            )}
                        </div>
                        
                        {/* Progress indicator for available times */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${
                                    selectedSpace === space.name ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    Disponibilidad
                                </span>
                                <span className={`text-sm font-medium ${
                                    selectedSpace === space.name ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {getAvailableTimesCount(space.name)} slots
                                </span>
                            </div>
                            <div className={`w-full bg-gray-200 rounded-full h-3 ${
                                selectedSpace === space.name ? 'bg-gray-600' : ''
                            }`}>
                                <div 
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                        selectedSpace === space.name 
                                            ? 'bg-white' 
                                            : 'bg-gray-600'
                                    }`}
                                    style={{ 
                                        width: `${Math.min(100, (getAvailableTimesCount(space.name) / 10) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SpaceSelector;