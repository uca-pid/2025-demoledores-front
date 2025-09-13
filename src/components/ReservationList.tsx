import ReservationCard from "./ReservationCard";
import type { Reservation } from "../types";

interface ReservationListProps {
    reservations: Reservation[];
    onCancelReservation: (reservationId: number) => void;
}

function ReservationList({ reservations, onCancelReservation }: ReservationListProps) {
    return (
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 tracking-wide">Mis reservas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.length === 0 && (
                    <p className="text-gray-600 col-span-full text-center">
                        No tienes reservas aún.
                    </p>
                )}

                {reservations.map((reservation) => (
                    <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onCancel={onCancelReservation}
                    />
                ))}
            </div>
        </section>
    );
}

export default ReservationList;