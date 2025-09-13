import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createReservation } from "../api_calls/post_reservation";

import AvailabilityViewer from "../components/reservation_available_dates";
import { getReservationsByAmenity } from "../api_calls/get_amenity_reservations";
import { updateUserName } from "../api_calls/update_user_name";
import { cancelReservation } from "../api_calls/cancel_reservation";
import { hideReservationFromUser } from "../api_calls/hide_reservation";

// Componentes reutilizables
import DashboardHeader from "../components/DashboardHeader";
import ProfilePanel from "../components/ProfilePanel";
import EditProfileModal from "../components/EditProfileModal";
import SpaceSelector from "../components/SpaceSelector";
import TimeSelector from "../components/TimeSelector";
import ReservationList from "../components/ReservationList";
import { LoadingOverlay } from "../components/LoadingSpinner";

// Tipos
import type { UserData, ReservationData, Reservation, Amenity } from "../types";

const API_URL = import.meta.env.VITE_API_URL as string;

function Dashboard() {
    const [token, setToken] = useState<string | null | undefined>(undefined);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<string>("Gym");
    const [selectedTime, setSelectedTime] = useState<string>("08:00 - 09:00");
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [reservations, setReservations] = useState<ReservationData>({});
    const [timeError, setTimeError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userReservations, setUserReservations] = useState<Reservation[]>([]);
    const [selectedDate, setSelectedDate] = useState("");

    const [showProfile, setShowProfile] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [newName, setNewName] = useState("");

    // Loading states
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isReserving, setIsReserving] = useState(false);
    const [isCancelling, setIsCancelling] = useState<number | null>(null);
    const [isHiding, setIsHiding] = useState<number | null>(null);
    const [isSavingName, setIsSavingName] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            setToken(null);
            setIsInitialLoading(false);
            return;
        }
        setToken(savedToken);

        Promise.all([
            fetch(`${API_URL}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                    "Content-Type": "application/json",
                },
            }).then((res) => res.json()),
            
            fetch(`${API_URL}/amenities`, {
                headers: { Authorization: `Bearer ${savedToken}` },
            }).then((res) => res.json())
        ])
        .then(([dashboardData, amenitiesData]) => {
            setUserData(dashboardData);
            setNewName(dashboardData.user.name);
            setAmenities(amenitiesData);
        })
        .catch(console.error)
        .finally(() => {
            setIsInitialLoading(false);
        });
    }, []);

    useEffect(() => {
        if (amenities.length > 0) {
            setSelectedSpace(amenities[0].name);
            setReservations((prev) => {
                const newReservations: ReservationData = { ...prev };
                amenities.forEach((a) => {
                    if (!newReservations[a.name]) {
                        newReservations[a.name] = { "08:00 - 09:00": 0, "09:00 - 10:00": 0 };
                    }
                });
                return newReservations;
            });
            setSelectedTime("08:00 - 09:00");
        }
    }, [amenities]);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_URL}/reservations`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(setUserReservations)
            .catch(console.error);
    }, [token]);

    if (token === undefined || isInitialLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <LoadingOverlay isVisible={true} text="Cargando dashboard..." />
            </div>
        );
    }
    if (!token) return <Navigate to="/login" />;

    const handleReserve = async () => {
        setIsReserving(true);
        try {
            const [startStr, endStr] = selectedTime.split(" - ");
            
            // Crear fecha en zona horaria local, no UTC
            const [year, month, day] = selectedDate.split('-').map(Number);
            const baseDate = new Date(year, month - 1, day); // month es 0-indexado
            const startDateTime = new Date(baseDate);
            const endDateTime = new Date(baseDate);

            const [sh, sm] = startStr.split(":").map(Number);
            const [eh, em] = endStr.split(":").map(Number);
            startDateTime.setHours(sh, sm, 0, 0);
            endDateTime.setHours(eh, em, 0, 0);

            console.log('Reserva creada para:', baseDate.toDateString(), 'de', startStr, 'a', endStr);

            const amenity = amenities.find((a) => a.name === selectedSpace);
            if (!amenity) return;

            const reservationData = await createReservation(token, {
                amenityId: amenity.id,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            });

            // Actualizar contador de reservas
            setReservations((prev) => ({
                ...prev,
                [selectedSpace]: {
                    ...prev[selectedSpace],
                    [selectedTime]: (prev[selectedSpace][selectedTime] || 0) + 1,
                },
            }));

            // Crear la nueva reserva para añadir a la lista
            const newReservation: Reservation = {
                id: reservationData.id || reservationData.reservation?.id || Date.now(),
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                status: reservationData.status || reservationData.reservation?.status || "pending",
                amenity: {
                    id: amenity.id,
                    name: amenity.name,
                }
            };

            // Añadir la nueva reserva al principio de la lista (más reciente primero)
            setUserReservations((prev) => [newReservation, ...prev]);

            setTimeError(null);
            setSuccessMessage(`✅ Reserva confirmada para ${selectedSpace} a las ${selectedTime}`);
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err: any) {
            setTimeError(err.message);
        } finally {
            setIsReserving(false);
        }
    };

    const handleSaveName = async () => {
        if (!token) return;
        setIsSavingName(true);
        try {
            await updateUserName(token, { name: newName });
            setUserData((prev) => prev && { ...prev, user: { ...prev.user, name: newName } });
            setShowEditPopup(false);
        } catch (err: any) {
            alert("Error al actualizar nombre: " + err.message);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCancelReservation = async (reservationId: number) => {
        if (!token) return;
        setIsCancelling(reservationId);
        try {
            await cancelReservation(token, reservationId);
            // Update local state to mark as cancelled
            setUserReservations(prev =>
                prev.map(r => r.id === reservationId ? { ...r, status: "cancelled" } : r)
            );
        } catch (err: any) {
            console.error(err);
            alert("Error canceling reservation: " + err.message);
        } finally {
            setIsCancelling(null);
        }
    };

    const handleRemoveFromView = async (reservationId: number) => {
        if (!token) return;
        setIsHiding(reservationId);
        try {
            // Llamar a la API para marcar como hidden_from_user = true
            await hideReservationFromUser(token, reservationId);
            
            // Remove the reservation from the local state (hide from view)
            setUserReservations(prev =>
                prev.filter(r => r.id !== reservationId)
            );
        } catch (err: any) {
            console.error(err);
            alert("Error ocultando reserva: " + err.message);
        } finally {
            setIsHiding(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative overflow-hidden">
            {/* HEADER */}
            <DashboardHeader
                userName={userData?.user.name || ""}
                onProfileClick={() => setShowProfile((prev) => !prev)}
            />

            {/* PANEL PERFIL (Derecha) */}
            <ProfilePanel
                isVisible={showProfile}
                onClose={() => setShowProfile(false)}
                userName={userData?.user.name || ""}
                onEditProfile={() => setShowEditPopup(true)}
                onLogout={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }}
            />

            {/* POPUP EDITAR */}
            <EditProfileModal
                isVisible={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                newName={newName}
                onNameChange={setNewName}
                onSave={handleSaveName}
                isSaving={isSavingName}
            />

            {/* Visor de disponibilidad - Ancho completo */}
            {selectedSpace && token && (() => {
                const amenity = amenities.find(a => a.name === selectedSpace);
                if (!amenity) return null;

                return (
                    <section className="mb-12">
                        <AvailabilityViewer
                            amenityId={amenity.id}
                            amenityName={selectedSpace}
                            capacity={amenity.capacity || 1}
                            isLoading={isInitialLoading}
                            fetchReservations={async (id) => {
                                if (!token) return [];
                                return getReservationsByAmenity(token, id);
                            }}
                        />
                    </section>
                );
            })()}

            {/* Layout de selección - Amenities a la izquierda, Horario a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
                {/* Columna izquierda - Selector de amenities */}
                <SpaceSelector
                    spaces={amenities}
                    selectedSpace={selectedSpace}
                    onSpaceSelect={setSelectedSpace}
                    getAvailableTimesCount={(spaceName) => {
                        const times = reservations[spaceName] ? Object.keys(reservations[spaceName]) : [];
                        return times.length;
                    }}
                />

                {/* Columna derecha - Selector de horario */}
                <TimeSelector
                    selectedSpace={selectedSpace}
                    selectedTime={selectedTime}
                    selectedDate={selectedDate}
                    amenities={amenities}
                    reservations={reservations}
                    timeError={timeError}
                    onTimeChange={(newTime) => {
                        const [start, end] = newTime.split(" - ");
                        const space = amenities.find(a => a.name === selectedSpace);
                        const maxDuration = space?.maxDuration || 60;

                        const [sh, sm] = start.split(":").map(Number);
                        const [eh, em] = end.split(":").map(Number);
                        const duration = (eh * 60 + em) - (sh * 60 + sm);

                        if (duration > maxDuration) {
                            setTimeError(`⛔ La duración máxima para ${selectedSpace} es de ${maxDuration} minutos`);
                            return;
                        }

                        setSelectedTime(newTime);
                        setTimeError(null);
                    }}
                    onDateChange={setSelectedDate}
                    onReserve={handleReserve}
                    successMessage={successMessage}
                    isReserving={isReserving}
                />
            </div>

            {/* Resumen de reservas del usuario - Ancho completo */}
            <ReservationList
                reservations={userReservations}
                onCancelReservation={handleCancelReservation}
                onRemoveFromView={handleRemoveFromView}
                cancellingId={isCancelling}
                hidingId={isHiding}
            />
        </div>
    );
}

export default Dashboard;
