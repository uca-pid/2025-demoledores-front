import type { ReservationData, Amenity } from "../types";
import { LoadingButton } from "./LoadingSpinner";
import { Calendar, Clock, Users, ChevronDown } from "lucide-react";

interface TimeSelectorProps {
    selectedSpace: string;
    selectedTime: string;
    selectedDate: string;
    amenities: Amenity[];
    reservations: ReservationData;
    timeError: string | null;
    onTimeChange: (newTime: string) => void;
    onDateChange: (newDate: string) => void;
    onReserve: () => void;
    successMessage: string | null;
    isReserving?: boolean;
}

// Generate time slots in 30-minute intervals
function generateTimeSlots() {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 22) { // Don't add :30 for the last hour to avoid going past 22:30
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }
    return slots;
}

// Generate valid duration options based on start time and max duration
function generateDurationOptions(maxDuration: number, startTime?: string) {
    const durations = [];
    
    // If no start time, show all possible durations up to max
    if (!startTime) {
        for (let duration = 30; duration <= maxDuration; duration += 30) {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            const label = hours > 0 
                ? (minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`)
                : `${minutes}min`;
            durations.push({ value: duration, label });
        }
        return durations;
    }

    // Calculate max possible duration based on start time (can't go past 22:30)
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const maxEndTime = 22 * 60 + 30; // 22:30 in minutes
    const maxPossibleDuration = maxEndTime - startTimeMinutes;
    
    // Use the smaller of maxDuration and maxPossibleDuration
    const effectiveMaxDuration = Math.min(maxDuration, maxPossibleDuration);
    
    for (let duration = 30; duration <= effectiveMaxDuration; duration += 30) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        const label = hours > 0 
            ? (minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`)
            : `${minutes}min`;
        durations.push({ value: duration, label });
    }
    return durations;
}

// Calculate end time based on start time and duration
function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

function TimeSelector({
    selectedSpace,
    selectedTime,
    selectedDate,
    amenities,
    reservations,
    timeError,
    onTimeChange,
    onDateChange,
    onReserve,
    successMessage,
    isReserving = false
}: TimeSelectorProps) {
    const selectedAmenity = amenities.find(a => a.name === selectedSpace);
    const maxDuration = selectedAmenity?.maxDuration || 60;
    
    const timeSlots = generateTimeSlots();
    
    // Parse current selected time
    const [currentStart, currentEnd] = selectedTime.split(" - ");
    const currentDuration = currentStart && currentEnd ? (() => {
        const [sh, sm] = currentStart.split(':').map(Number);
        const [eh, em] = currentEnd.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    })() : 30;

    const durationOptions = generateDurationOptions(maxDuration, currentStart);

    const handleStartTimeChange = (newStart: string) => {
        // Keep the same duration, calculate new end time
        const newEnd = calculateEndTime(newStart, currentDuration);
        
        // Validate end time doesn't go past 22:30
        const [endHour, endMinute] = newEnd.split(':').map(Number);
        if (endHour > 22 || (endHour === 22 && endMinute > 30)) {
            // If it would exceed 22:30, adjust the duration to fit
            const [startHour, startMinute] = newStart.split(':').map(Number);
            const maxEndTime = 22 * 60 + 30; // 22:30 in minutes
            const startTimeMinutes = startHour * 60 + startMinute;
            const maxDurationForThisStart = maxEndTime - startTimeMinutes;
            
            // Round down to nearest 30-minute interval
            const adjustedDuration = Math.floor(maxDurationForThisStart / 30) * 30;
            
            if (adjustedDuration >= 30) {
                const adjustedEnd = calculateEndTime(newStart, adjustedDuration);
                onTimeChange(`${newStart} - ${adjustedEnd}`);
            }
            return;
        }
        
        onTimeChange(`${newStart} - ${newEnd}`);
    };

    const handleDurationChange = (newDuration: number) => {
        // Keep the same start time, calculate new end time
        const newEnd = calculateEndTime(currentStart, newDuration);
        
        // Validate end time doesn't go past 22:30
        const [endHour, endMinute] = newEnd.split(':').map(Number);
        if (endHour > 22 || (endHour === 22 && endMinute > 30)) {
            return; // Don't allow this duration
        }
        
        onTimeChange(`${currentStart} - ${newEnd}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 h-full">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Selecciona tu Horario
                </h2>
                <p className="text-gray-600 text-lg">Elige la fecha y hora perfecta para tu reserva</p>
            </div>

            <div className="space-y-6">
                {/* Fecha */}
                <div className="group">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        Fecha
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                        />
                    </div>
                </div>

                {/* Hora de inicio */}
                <div className="group">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                        <Clock className="w-4 h-4 text-gray-600" />
                        Hora de Inicio
                    </label>
                    <div className="relative">
                        <select
                            value={currentStart || ""}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md appearance-none bg-white cursor-pointer"
                        >
                            <option value="" disabled className="text-gray-400">
                                Selecciona una hora
                            </option>
                            {timeSlots.map(slot => (
                                <option key={slot} value={slot} className="text-gray-700">
                                    {slot}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Duración */}
                <div className="group">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                        <Clock className="w-4 h-4 text-gray-600" />
                        Duración
                    </label>
                    <div className="relative">
                        <select
                            value={currentDuration}
                            onChange={(e) => handleDurationChange(Number(e.target.value))}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                            disabled={!currentStart}
                        >
                            {durationOptions.map(option => (
                                <option key={option.value} value={option.value} className="text-gray-700">
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Tiempo seleccionado */}
                {currentStart && currentEnd && (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm">TIEMPO SELECCIONADO</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                            {currentStart} - {currentEnd}
                        </p>
                    </div>
                )}

                {/* Error */}
                {timeError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                        <p className="text-red-700 font-medium">{timeError}</p>
                    </div>
                )}

                {/* Info adicional */}
                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Duración máxima</span>
                        <span className="font-bold text-gray-800">{selectedAmenity?.maxDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Reservas actuales
                        </span>
                        <span className="font-bold text-gray-800">
                            {reservations[selectedSpace]?.[selectedTime] || 0}
                        </span>
                    </div>
                </div>

                {/* Botón reservar */}
                <div className="pt-4">
                    <LoadingButton
                        onClick={onReserve}
                        loading={isReserving}
                        className="w-full py-5 bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                        loadingText="Reservando..."
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Reservar {selectedSpace}
                        </span>
                    </LoadingButton>
                </div>

                {successMessage && (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-6 py-3 rounded-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-green-700 font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TimeSelector;