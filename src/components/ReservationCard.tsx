import type { Reservation } from "../types";
import { LoadingButton } from "./LoadingSpinner";
import { MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2, X } from "lucide-react";

interface ReservationCardProps {
    reservation: Reservation;
    onCancel: (reservationId: number) => void;
    onRemoveFromView: (reservationId: number) => void;
    isCancelling?: boolean;
    isHiding?: boolean;
}

function ReservationCard({ 
    reservation, 
    onCancel, 
    onRemoveFromView,
    isCancelling = false,
    isHiding = false
}: ReservationCardProps) {
    // Status configuration - Neutral color scheme with subtle accent colors
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "confirmed":
                return {
                    accentColor: "from-emerald-500 to-emerald-600",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-emerald-600",
                    icon: CheckCircle,
                    label: "Confirmada",
                    dotColor: "bg-emerald-500"
                };
            case "pending":
                return {
                    accentColor: "from-amber-500 to-amber-600",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-amber-600",
                    icon: AlertCircle,
                    label: "Pendiente",
                    dotColor: "bg-amber-500"
                };
            case "cancelled":
                return {
                    accentColor: "from-gray-500 to-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-300",
                    textColor: "text-gray-600",
                    statusTextColor: "text-gray-600",
                    icon: XCircle,
                    label: "Cancelada",
                    dotColor: "bg-gray-500"
                };
            case "denied":
                return {
                    accentColor: "from-gray-600 to-gray-700",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-300",
                    textColor: "text-gray-600",
                    statusTextColor: "text-gray-600",
                    icon: XCircle,
                    label: "Denegada",
                    dotColor: "bg-gray-600"
                };
            default:
                return {
                    accentColor: "from-gray-400 to-gray-500",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                    statusTextColor: "text-gray-600",
                    icon: AlertCircle,
                    label: "Desconocido",
                    dotColor: "bg-gray-400"
                };
        }
    };

    const statusConfig = getStatusConfig(reservation.status);

    // Format dates
    const startDate = new Date(reservation.startTime);
    const endDate = new Date(reservation.endTime);
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getDuration = () => {
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}min` : `${diffHours}h`;
        }
        return `${diffMinutes}min`;
    };

    const handleCancel = () => {
        onCancel(reservation.id);
    };

    const isActive = reservation.status !== "cancelled" && reservation.status !== "denied";

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${statusConfig.borderColor} ${statusConfig.bgColor} shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300`}>
            {/* Status Indicator - Minimal dot and text */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig.dotColor} shadow-sm`}></div>
                <span className={`${statusConfig.statusTextColor} font-semibold text-sm`}>{statusConfig.label}</span>
            </div>

            <div className="p-6 pt-16">
                {/* Amenity Name */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gray-800 shadow-md">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        {reservation.amenity.name}
                    </h3>
                </div>

                {/* Date and Time Info */}
                <div className="space-y-4 mb-6">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 capitalize">
                                {formatDate(startDate)}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                    {formatTime(startDate)} - {formatTime(endDate)}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    {getDuration()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {isActive ? (
                        <LoadingButton
                            onClick={handleCancel}
                            loading={isCancelling}
                            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                            loadingText="Cancelando..."
                        >
                            <X className="w-4 h-4" />
                            Cancelar reserva
                        </LoadingButton>
                    ) : (
                        <LoadingButton
                            onClick={() => onRemoveFromView(reservation.id)}
                            loading={isHiding}
                            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                            loadingText="Eliminando..."
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar de vista
                        </LoadingButton>
                    )}
                </div>
            </div>

            {/* Subtle accent border on the left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${statusConfig.accentColor}`}></div>
        </div>
    );
}

export default ReservationCard;