import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface ModernTimePickerProps {
    selectedTime: string; // Format: "14:30 - 16:00"
    onTimeChange: (time: string) => void;
    maxDuration?: number; // in minutes
    label?: string;
    className?: string;
    selectedDate?: string; // To check if it's today and filter past times
}

// Generate time slots in 30-minute intervals only
function generateTimeSlots() {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
        // Add :00 for every hour
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        
        // Add :30 for every hour except the last one (22:30 is the last allowed time)
        if (hour < 22) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
    }
    return slots;
}

// Convert time string to minutes since midnight
function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes since midnight to time string
function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function ModernTimePicker({
    selectedTime,
    onTimeChange,
    maxDuration = 120,
    label = "Seleccionar Horario",
    className = "",
    selectedDate
}: ModernTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'visual' | 'manual'>('visual');
    
    // Check if selected date is today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // Parse current selected time
    const [currentStart, currentEnd] = selectedTime.split(" - ");
    const currentDuration = currentStart && currentEnd 
        ? timeToMinutes(currentEnd) - timeToMinutes(currentStart)
        : 60; // default 1 hour

    const timeSlots = generateTimeSlots();

    // Filter out past times if the selected date is today
    const availableTimeSlots = isToday 
        ? timeSlots.filter(slot => {
            const slotMinutes = timeToMinutes(slot);
            // Add 5 minutes buffer to current time
            return slotMinutes > (currentTotalMinutes + 5);
          })
        : timeSlots;

    // Calculate available end times for current start time
    const getAvailableEndTimes = (startTime: string) => {
        if (!startTime) return [];
        
        const startMinutes = timeToMinutes(startTime);
        const maxEndTime = Math.min(
            startMinutes + maxDuration,
            22 * 60 + 30 // 22:30
        );
        
        const endTimes = [];
        for (let duration = 30; duration <= maxDuration; duration += 30) {
            const endMinutes = startMinutes + duration;
            if (endMinutes <= maxEndTime) {
                endTimes.push({
                    time: minutesToTime(endMinutes),
                    duration: duration,
                    label: `${Math.floor(duration / 60)}h ${duration % 60 > 0 ? duration % 60 + 'm' : ''}`.replace('0h ', '')
                });
            }
        }
        return endTimes;
    };

    const handleStartTimeChange = (newStart: string) => {
        const availableEndTimes = getAvailableEndTimes(newStart);
        if (availableEndTimes.length > 0) {
            // Try to keep similar duration, or use the first available
            const targetDuration = Math.min(currentDuration, maxDuration);
            const bestEndTime = availableEndTimes.find(end => end.duration >= targetDuration) || availableEndTimes[0];
            onTimeChange(`${newStart} - ${bestEndTime.time}`);
        }
    };

    const handleEndTimeChange = (newEnd: string) => {
        if (currentStart) {
            onTimeChange(`${currentStart} - ${newEnd}`);
        }
    };

    const getDisplayTime = () => {
        if (!selectedTime || !selectedTime.includes(' - ')) {
            return "Seleccionar horario";
        }
        return selectedTime;
    };

    const availableEndTimes = currentStart ? getAvailableEndTimes(currentStart) : [];

    // Quick time presets
    const quickPresets = [
        { label: "30 min", duration: 30 },
        { label: "1 hora", duration: 60 },
        { label: "1.5 horas", duration: 90 },
        { label: "2 horas", duration: 120 },
    ].filter(preset => preset.duration <= maxDuration);

    const handleQuickPreset = (duration: number) => {
        if (currentStart) {
            const startMinutes = timeToMinutes(currentStart);
            const endMinutes = Math.min(startMinutes + duration, 22 * 60 + 30);
            const endTime = minutesToTime(endMinutes);
            onTimeChange(`${currentStart} - ${endTime}`);
        }
    };

    // Visual time picker with clock-like interface
    const VisualTimePicker = () => {
        const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
        
        return (
            <div className="space-y-6">
                {/* Hour Selection */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Hora de Inicio</h4>
                    <div className="grid grid-cols-6 gap-2">
                        {hours.map(hour => {
                            const timeString = `${hour.toString().padStart(2, '0')}:00`;
                            const isSelected = currentStart?.startsWith(hour.toString().padStart(2, '0'));
                            
                            return (
                                <button
                                    key={hour}
                                    onClick={() => handleStartTimeChange(timeString)}
                                    className={`
                                        p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${isSelected 
                                            ? "bg-gray-800 text-white shadow-lg" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                                        }
                                    `}
                                >
                                    {hour}:00
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Minutes Selection for Start Time */}
                {currentStart && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Minutos</h4>
                        <div className="flex gap-2">
                            {['00', '30'].map(minute => {
                                const hour = currentStart.split(':')[0];
                                const timeString = `${hour}:${minute}`;
                                const isSelected = currentStart === timeString;
                                
                                return (
                                    <button
                                        key={minute}
                                        onClick={() => handleStartTimeChange(timeString)}
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                            ${isSelected 
                                                ? "bg-gray-800 text-white shadow-lg" 
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }
                                        `}
                                    >
                                        :{minute}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Duration Selection */}
                {currentStart && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Duración</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {quickPresets.map(preset => (
                                <button
                                    key={preset.duration}
                                    onClick={() => handleQuickPreset(preset.duration)}
                                    className={`
                                        p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                        ${currentDuration === preset.duration
                                            ? "bg-gray-800 text-white shadow-lg" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }
                                    `}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Manual time picker with dropdowns
    const ManualTimePicker = () => (
        <div className="space-y-4">
            {/* Start Time Dropdown */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Hora de Inicio</h4>
                <div className="relative">
                    <select
                        value={currentStart || ""}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Selecciona hora de inicio</option>
                        {availableTimeSlots.map(slot => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* End Time Dropdown */}
            {currentStart && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Hora de Fin</h4>
                    <div className="relative">
                        <select
                            value={currentEnd || ""}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Selecciona hora de fin</option>
                            {availableEndTimes.map(option => (
                                <option key={option.time} value={option.time}>
                                    {option.time} ({option.label})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={`relative ${className}`}>
            {/* Time Input Display */}
            <div className="group">
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide mb-3">
                    <Clock className="w-4 h-4 text-gray-600" />
                    {label}
                </label>
                
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-600 focus:ring-4 focus:ring-gray-100 transition-all duration-300 text-left text-gray-700 font-medium shadow-sm hover:shadow-md bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                    <span className={selectedTime && selectedTime !== " - " ? "text-gray-800" : "text-gray-400"}>
                        {getDisplayTime()}
                    </span>
                    <Clock className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Time Picker Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Time Picker Panel */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-6 min-w-[360px]">
                        {/* Header with Mode Toggle */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Seleccionar Horario</h3>
                            
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setMode('visual')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                                        mode === 'visual' 
                                            ? 'bg-white text-gray-800 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Visual
                                </button>
                                <button
                                    onClick={() => setMode('manual')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all cursor-pointer ${
                                        mode === 'manual' 
                                            ? 'bg-white text-gray-800 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Manual
                                </button>
                            </div>
                        </div>

                        {/* Time Picker Content */}
                        {mode === 'visual' ? <VisualTimePicker /> : <ManualTimePicker />}

                        {/* Selected Time Display */}
                        {currentStart && currentEnd && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Horario Seleccionado</p>
                                        <p className="text-lg font-bold text-gray-800">{selectedTime}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Duración</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {Math.floor(currentDuration / 60)}h {currentDuration % 60 > 0 ? `${currentDuration % 60}m` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={!currentStart || !currentEnd}
                                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors cursor-pointer"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ModernTimePicker;