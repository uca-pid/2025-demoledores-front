import type { ReservationData, Amenity } from "../types";

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
    successMessage
}: TimeSelectorProps) {
    const selectedAmenity = amenities.find(a => a.name === selectedSpace);

    const handleStartTimeChange = (start: string) => {
        const [, end] = selectedTime.split(" - ");
        onTimeChange(`${start} - ${end}`);
    };

    const handleEndTimeChange = (end: string) => {
        const [start] = selectedTime.split(" - ");
        const maxDuration = selectedAmenity?.maxDuration || 60;

        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const duration = (eh * 60 + em) - (sh * 60 + sm);

        if (duration > maxDuration) {
            // El error se manejará en el componente padre
            return;
        }

        onTimeChange(`${start} - ${end}`);
    };

    return (
        <>
            {/* Selección de horario */}
            <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800 tracking-wide text-center">
                    Elige tu horario
                </h2>

                <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full md:w-80 flex flex-col gap-4">
                        {/* Fecha */}
                        <label className="text-gray-700 font-medium text-lg">Fecha deseada:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="p-3 rounded-xl border border-gray-300 shadow-sm w-full"
                        />

                        {/* Hora de inicio */}
                        <label className="text-gray-700 font-medium text-lg">Horario deseado:</label>
                        <input
                            type="time"
                            value={selectedTime.split(" - ")[0]}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="p-3 rounded-xl border border-gray-300 shadow-sm w-full"
                        />

                        {/* Hora de fin */}
                        <input
                            type="time"
                            value={selectedTime.split(" - ")[1]}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="p-3 rounded-xl border border-gray-300 shadow-sm w-full"
                        />

                        {timeError && (
                            <p className="text-red-600 font-medium mt-1">{timeError}</p>
                        )}

                        <p className="text-gray-600">
                            Duración máxima: <span className="font-semibold">{selectedAmenity?.maxDuration} minutos</span>
                        </p>

                        <p className="text-gray-600">
                            Reservas actuales: <span className="font-semibold">{reservations[selectedSpace]?.[selectedTime] || 0}</span> personas
                        </p>
                    </div>
                </div>
            </section>

            {/* Botón reservar */}
            <section className="mb-12">
                <button
                    onClick={onReserve}
                    className="w-full py-4 bg-gray-900 text-white text-xl font-bold rounded-3xl shadow-xl hover:bg-gray-700 hover:cursor-pointer hover:scale-105 transition-all transform"
                >
                    Reservar {selectedSpace} a las {selectedTime}
                </button>

                {successMessage && (
                    <p className="mt-4 text-green-600 font-medium text-center">
                        {successMessage}
                    </p>
                )}
            </section>
        </>
    );
}

export default TimeSelector;