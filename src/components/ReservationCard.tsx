import type { Reservation } from "../types";

interface ReservationCardProps {
    reservation: Reservation;
    onCancel: (reservationId: number) => void;
}

function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
    let statusColor = "bg-white"; // default
    if (reservation.status === "confirmed") statusColor = "bg-green-100";
    else if (reservation.status === "pending") statusColor = "bg-orange-100";
    else if (reservation.status === "cancelled" || reservation.status === "denied") statusColor = "bg-red-100";

    const handleCancel = () => {
        onCancel(reservation.id);
    };

    return (
        <div
            className={`p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all ${statusColor}`}
        >
            <h3 className="text-xl font-bold mb-2 text-gray-900">
                {reservation.amenity.name}
            </h3>
            <p className="text-gray-700">
                <span className="font-semibold">Inicio:</span>{" "}
                {new Date(reservation.startTime).toLocaleString()}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold">Fin:</span>{" "}
                {new Date(reservation.endTime).toLocaleString()}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold">Estado:</span> {reservation.status}
            </p>

            {reservation.status !== "cancelled" && reservation.status !== "denied" && (
                <button
                    onClick={handleCancel}
                    className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                >
                    Cancelar reserva
                </button>
            )}
        </div>
    );
}

export default ReservationCard;