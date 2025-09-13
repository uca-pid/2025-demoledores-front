import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createReservation } from "../api_calls/post_reservation";

import AvailabilityViewer from "../components/reservation_available_dates";
import { getReservationsByAmenity } from "../api_calls/get_amenity_reservations";
import { updateUserName } from "../api_calls/update_user_name";

// Componentes reutilizables
import DashboardHeader from "../components/DashboardHeader";
import ProfilePanel from "../components/ProfilePanel";
import EditProfileModal from "../components/EditProfileModal";
import SpaceSelector from "../components/SpaceSelector";
import TimeSelector from "../components/TimeSelector";
import ReservationList from "../components/ReservationList";

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

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            setToken(null);
            return;
        }
        setToken(savedToken);

        fetch(`${API_URL}/dashboard`, {
            headers: {
                Authorization: `Bearer ${savedToken}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setUserData(data);
                setNewName(data.user.name);
            })
            .catch(console.error);

        fetch(`${API_URL}/amenities`, {
            headers: { Authorization: `Bearer ${savedToken}` },
        })
            .then((res) => res.json())
            .then(setAmenities)
            .catch(console.error);
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

    if (token === undefined) return <p>Loading...</p>;
    if (!token) return <Navigate to="/login" />;

    const handleReserve = async () => {
        try {
            const [startStr, endStr] = selectedTime.split(" - ");
            const baseDate = new Date(selectedDate);
            const startDateTime = new Date(baseDate);
            const endDateTime = new Date(baseDate);

            const [sh, sm] = startStr.split(":").map(Number);
            const [eh, em] = endStr.split(":").map(Number);
            startDateTime.setHours(sh, sm, 0, 0);
            endDateTime.setHours(eh, em, 0, 0);

            const amenity = amenities.find((a) => a.name === selectedSpace);
            if (!amenity) return;

            await createReservation(token, {
                amenityId: amenity.id,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
            });

            setReservations((prev) => ({
                ...prev,
                [selectedSpace]: {
                    ...prev[selectedSpace],
                    [selectedTime]: (prev[selectedSpace][selectedTime] || 0) + 1,
                },
            }));

            setTimeError(null);
            setSuccessMessage(`✅ Reserva confirmada para ${selectedSpace} a las ${selectedTime}`);
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setTimeError(err.message);
        }
    };

    const handleSaveName = async () => {
        if (!token) return;
        try {
            await updateUserName(token, { name: newName });
            setUserData((prev) => prev && { ...prev, user: { ...prev.user, name: newName } });
            setShowEditPopup(false);
        } catch (err: any) {
            alert("Error al actualizar nombre: " + err.message);
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
            />

            {/* Selección de espacio */}
            <SpaceSelector
                spaces={amenities}
                selectedSpace={selectedSpace}
                onSpaceSelect={setSelectedSpace}
                getAvailableTimesCount={(spaceName) => {
                    const times = reservations[spaceName] ? Object.keys(reservations[spaceName]) : [];
                    return times.length;
                }}
            />

            {selectedSpace && token && (() => {
                const amenity = amenities.find(a => a.name === selectedSpace);
                if (!amenity) return null; // or a loading placeholder

                return (
                    <section className="mb-12">
                        <AvailabilityViewer
                            amenityId={amenity.id}
                            amenityName={selectedSpace}
                            capacity={amenity.capacity || 1}
                            fetchReservations={async (id) => {
                                if (!token) return [];
                                return getReservationsByAmenity(token, id);
                            }}
                        />
                    </section>
                );
            })()}



            {/* Selección de horario dinámica e integrada */}
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
            />


            {/* Resumen de reservas del usuario */}
            <ReservationList
                reservations={userReservations}
                onCancelReservation={async (reservationId) => {
                    if (!token) return;
                    try {
                        const resApi = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
                            method: "PATCH",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const data = await resApi.json();
                        if (!resApi.ok) throw new Error(data.message || "Error canceling reservation");

                        // update local state
                        setUserReservations(prev =>
                            prev.map(r => r.id === reservationId ? { ...r, status: "cancelled" } : r)
                        );
                    } catch (err: any) {
                        console.error(err);
                        alert("Error canceling reservation: " + err.message);
                    }
                }}
            />

        </div>
    );
}

export default Dashboard;
