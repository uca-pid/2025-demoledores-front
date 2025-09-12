import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createReservation } from "../api_calls/post_reservation";
import { updateUserName } from "../api_calls/update_user_name";
import { updateUserPassword } from "../api_calls/update_user_password";
import { User, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL as string;

interface UserData {
    user: {
        name: string;
        email: string;
        iat: number;
        exp: number;
    };
    message: string;
}

interface ReservationData {
    [space: string]: {
        [time: string]: number;
    };
}

interface Reservation {
    id: number;
    startTime: string;
    endTime: string;
    status: string;
    amenity: {
        id: number;
        name: string;
    };
}

function Dashboard() {
    const [token, setToken] = useState<string | null | undefined>(undefined);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<string>("Gym");
    const [selectedTime, setSelectedTime] = useState<string>("08:00 - 09:00");
    const [amenities, setAmenities] = useState<{ id: number; name: string; capacity: number; maxDuration: number }[]>([]);
    const [reservations, setReservations] = useState<ReservationData>({});
    const [timeError, setTimeError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userReservations, setUserReservations] = useState<Reservation[]>([]);

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
            const today = new Date();
            const startDateTime = new Date(today);
            const endDateTime = new Date(today);
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

    const spaces = amenities.map((a) => a.name);
    const times = reservations[selectedSpace] ? Object.keys(reservations[selectedSpace]) : [];

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative overflow-hidden">
            {/* HEADER */}
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    ¡Bienvenido, {userData?.user.name}!
                </h1>
                <button
                    onClick={() => setShowProfile((prev) => !prev)}
                    className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all cursor-pointer"
                    title="Perfil"
                >
                    <User className="w-6 h-6" />
                </button>
            </header>

            {/* PANEL PERFIL (Derecha) */}
            <AnimatePresence>
                {showProfile && (
                    <>
                        {/* Overlay con blur para el fondo */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
                            onClick={() => setShowProfile(false)}
                        />

                        {/* Panel lateral */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                            className="fixed top-0 right-0 h-full w-1/4 bg-white shadow-2xl p-6 flex flex-col justify-between z-50"
                        >
                            {/* Botón flecha para cerrar */}
                            <button
                                onClick={() => setShowProfile(false)}
                                className="absolute top-4 left-4 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>

                            <div className="mt-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil</h2>
                                <p className="text-lg text-gray-700 mb-6">{userData?.user.name}</p>
                                <button
                                    onClick={() => setShowEditPopup(true)}
                                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all mb-6"
                                >
                                    Editar datos
                                </button>
                            </div>

                            <button
                                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/login";
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* POPUP EDITAR */}
            <AnimatePresence>
                {showEditPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
                        // backdrop-blur-md aplica el blur y bg-black/20 agrega un leve oscurecimiento
                        onClick={() => setShowEditPopup(false)} // Cierra si se hace clic fuera del popup
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 15 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative"
                            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del popup lo cierre
                        >
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Editar nombre</h3>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-gray-400 outline-none"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowEditPopup(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveName}
                                    className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-all"
                                >
                                    Guardar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selección de espacio */}
            <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-4 text-gray-800 tracking-wide">Espacios disponibles</h2>
                <div className="flex gap-6">
                    {spaces.map((space) => (
                        <div
                            key={space}
                            className={`flex-1 p-6 rounded-3xl shadow-lg cursor-pointer transition-all transform hover:scale-105 hover:bg-gray-300 hover:cursor-pointer ${selectedSpace === space ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                                }`}
                            onClick={() => setSelectedSpace(space)}
                        >
                            <h3 className="text-xl font-bold mb-2">{space}</h3>
                            <p className="text-sm text-gray-500">{times.length} horarios disponibles</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Selección de horario dinámica e integrada */}

            <section className="mb-12">
                <h2 className="text-3xl font-semibold mb-6 text-gray-800 tracking-wide text-center">
                    Elige tu horario
                </h2>

                <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-3xl shadow-lg w-full md:w-80 flex flex-col gap-4">
                        <label className="text-gray-700 font-medium text-lg">Horario deseado:</label>

                        {/* Hora de inicio */}
                        <input
                            type="time"
                            value={selectedTime.split(" - ")[0]}
                            onChange={(e) => {
                                const start = e.target.value;
                                const [, end] = selectedTime.split(" - ");
                                setSelectedTime(`${start} - ${end}`);
                            }}
                            className="p-3 rounded-xl border border-gray-300 shadow-sm w-full"
                        />

                        {/* Hora de fin */}
                        <input
                            type="time"
                            value={selectedTime.split(" - ")[1]}
                            onChange={(e) => {
                                const end = e.target.value;
                                const [start] = selectedTime.split(" - ");

                                // Buscar maxDuration del espacio
                                const space = amenities.find(a => a.name === selectedSpace);
                                const maxDuration = space?.maxDuration || 60;

                                // Validar duración
                                const [sh, sm] = start.split(":").map(Number);
                                const [eh, em] = end.split(":").map(Number);
                                const duration = (eh * 60 + em) - (sh * 60 + sm);

                                if (duration > maxDuration) {
                                    setTimeError(`⛔ La duración máxima para ${selectedSpace} es de ${maxDuration} minutos`);
                                    return;
                                }

                                setSelectedTime(`${start} - ${end}`);
                                setTimeError(null);
                            }}
                            className="p-3 rounded-xl border border-gray-300 shadow-sm w-full"
                        />
                        {timeError && (
                            <p className="text-red-600 font-medium mt-1">{timeError}</p>
                        )}


                        <p className="text-gray-600">
                            Duración máxima: <span className="font-semibold">{amenities.find(a => a.name === selectedSpace)?.maxDuration} minutos</span>
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
                    onClick={handleReserve}
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


            {/* Resumen de reservas del usuario */}
            <section>
                <h2 className="text-3xl font-semibold mb-6 text-gray-800 tracking-wide">Mis reservas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userReservations.length === 0 && (
                        <p className="text-gray-600 col-span-full text-center">
                            No tienes reservas aún.
                        </p>
                    )}

                    {userReservations.map((res) => {
                        let statusColor = "bg-white"; // default
                        if (res.status === "confirmed") statusColor = "bg-green-100";
                        else if (res.status === "pending") statusColor = "bg-orange-100";
                        else if (res.status === "cancelled" || res.status === "denied") statusColor = "bg-red-100";

                        const handleCancel = async () => {
                            if (!token) return;
                            try {
                                const resApi = await fetch(`${API_URL}/reservations/${res.id}/cancel`, {
                                    method: "PATCH",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                });
                                const data = await resApi.json();
                                if (!resApi.ok) throw new Error(data.message || "Error canceling reservation");

                                // update local state
                                setUserReservations(prev =>
                                    prev.map(r => r.id === res.id ? { ...r, status: "cancelled" } : r)
                                );
                            } catch (err: any) {
                                console.error(err);
                                alert("Error canceling reservation: " + err.message);
                            }
                        };

                        return (
                            <div
                                key={res.id}
                                className={`p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all ${statusColor}`}
                            >
                                <h3 className="text-xl font-bold mb-2 text-gray-900">
                                    {res.amenity.name}
                                </h3>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Inicio:</span>{" "}
                                    {new Date(res.startTime).toLocaleString()}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Fin:</span>{" "}
                                    {new Date(res.endTime).toLocaleString()}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Estado:</span> {res.status}
                                </p>

                                {res.status !== "cancelled" && res.status !== "denied" && (
                                    <button
                                        onClick={handleCancel}
                                        className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                                    >
                                        Cancelar reserva
                                    </button>
                                )}
                            </div>
                        );
                    })}

                </div>
            </section>

        </div>
    );
}

export default Dashboard;
