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
        <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 tracking-wide">
                Espacios disponibles
            </h2>
            <div className="flex gap-6">
                {spaces.map((space) => (
                    <div
                        key={space.name}
                        className={`flex-1 p-6 rounded-3xl shadow-lg cursor-pointer transition-all transform hover:scale-105 hover:bg-gray-300 hover:cursor-pointer ${
                            selectedSpace === space.name 
                                ? "bg-gray-800 text-white" 
                                : "bg-white text-gray-900"
                        }`}
                        onClick={() => onSpaceSelect(space.name)}
                    >
                        <h3 className="text-xl font-bold mb-2">{space.name}</h3>
                        <p className="text-sm text-gray-500">
                            {getAvailableTimesCount(space.name)} horarios disponibles
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default SpaceSelector;