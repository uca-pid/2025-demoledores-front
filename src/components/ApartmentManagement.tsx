import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Search, Plus, Edit3, Trash2, User, Users, Home, AlertTriangle, X } from "lucide-react";
import { 
    getAdminApartments, 
    createApartment, 
    updateApartment, 
    deleteApartment,
    getAdminUsers,
    type AdminApartment,
    type AdminUser
} from "../api_calls/admin";

// Helper function to safely get user/reservation count
const getUserCount = (apartment: AdminApartment): number => {
    return apartment._count?.users ?? apartment.userCount ?? 0;
};

const getReservationCount = (apartment: AdminApartment): number => {
    return apartment._count?.reservations ?? apartment.reservationCount ?? 0;
};

interface ApartmentManagementProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

function ApartmentManagement({ isOpen, onClose, token }: ApartmentManagementProps) {
    const [apartments, setApartments] = useState<AdminApartment[]>([]);
    const [filteredApartments, setFilteredApartments] = useState<AdminApartment[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterFloor, setFilterFloor] = useState<string>("all");
    const [filterOccupancy, setFilterOccupancy] = useState<string>("all");
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedApartment, setSelectedApartment] = useState<AdminApartment | null>(null);
    const [processing, setProcessing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        unit: "",
        floor: "",
        rooms: "",
        areaM2: "",
        observations: "",
        ownerId: ""
    });

    useEffect(() => {
        if (isOpen && token) {
            loadApartments();
            loadUsers();
        }
    }, [isOpen, token]);

    useEffect(() => {
        // Filtrar apartamentos
        let filtered = apartments;

        if (searchTerm) {
            filtered = filtered.filter(apartment => 
                apartment.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apartment.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apartment.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apartment.observations?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterFloor !== "all") {
            filtered = filtered.filter(apartment => apartment.floor.toString() === filterFloor);
        }

        if (filterOccupancy !== "all") {
            filtered = filtered.filter(apartment => {
                if (filterOccupancy === "occupied") return apartment.isOccupied;
                if (filterOccupancy === "vacant") return !apartment.isOccupied;
                return true;
            });
        }

        setFilteredApartments(filtered);
    }, [apartments, searchTerm, filterFloor, filterOccupancy]);

    const loadApartments = async () => {
        setLoading(true);
        try {
            const apartmentsData = await getAdminApartments(token);
            if (Array.isArray(apartmentsData)) {
                setApartments(apartmentsData);
            } else {
                console.error("Apartments data is not an array:", apartmentsData);
                setApartments([]);
            }
        } catch (error) {
            console.error("Error loading apartments:", error);
            setApartments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const usersData = await getAdminUsers(token);
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const handleCreateApartment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const apartmentData = {
                unit: formData.unit.trim(),
                floor: parseInt(formData.floor),
                rooms: parseInt(formData.rooms),
                areaM2: formData.areaM2 ? parseFloat(formData.areaM2) : undefined,
                observations: formData.observations.trim() || undefined,
                ownerId: formData.ownerId ? parseInt(formData.ownerId) : undefined
            };

            await createApartment(token, apartmentData);
            await loadApartments();
            setShowCreateModal(false);
            setFormData({ unit: "", floor: "", rooms: "", areaM2: "", observations: "", ownerId: "" });
            alert("Apartamento creado exitosamente");
        } catch (error) {
            console.error("Error creating apartment:", error);
            alert(`Error al crear apartamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleEditApartment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApartment) return;

        setProcessing(true);
        try {
            const updateData: any = {};
            
            if (formData.unit.trim() !== selectedApartment.unit) {
                updateData.unit = formData.unit.trim();
            }
            if (parseInt(formData.floor) !== selectedApartment.floor) {
                updateData.floor = parseInt(formData.floor);
            }
            if (parseInt(formData.rooms) !== selectedApartment.rooms) {
                updateData.rooms = parseInt(formData.rooms);
            }
            if (formData.areaM2 !== (selectedApartment.areaM2?.toString() || "")) {
                updateData.areaM2 = formData.areaM2 ? parseFloat(formData.areaM2) : null;
            }
            if (formData.observations !== (selectedApartment.observations || "")) {
                updateData.observations = formData.observations.trim() || null;
            }
            if (formData.ownerId !== (selectedApartment.owner?.id?.toString() || "")) {
                updateData.ownerId = formData.ownerId ? parseInt(formData.ownerId) : null;
            }

            await updateApartment(token, selectedApartment.id, updateData);
            await loadApartments();
            setShowEditModal(false);
            setSelectedApartment(null);
            alert("Apartamento actualizado exitosamente");
        } catch (error) {
            console.error("Error updating apartment:", error);
            alert(`Error al actualizar apartamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteApartment = async (apartment: AdminApartment) => {
        const userCount = getUserCount(apartment);
        const reservationCount = getReservationCount(apartment);
        
        let confirmMessage = `¿Estás seguro de eliminar el apartamento ${apartment.unit}?`;
        if (userCount > 0 || reservationCount > 0) {
            confirmMessage += `\n\nADVERTENCIA: Este apartamento tiene ${userCount} usuario(s) y ${reservationCount} reserva(s).`;
        }

        if (!confirm(confirmMessage)) return;

        setProcessing(true);
        try {
            await deleteApartment(token, apartment.id);
            await loadApartments();
            alert("Apartamento eliminado exitosamente");
        } catch (error) {
            console.error("Error deleting apartment:", error);
            alert(`Error al eliminar apartamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setProcessing(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ unit: "", floor: "", rooms: "", areaM2: "", observations: "", ownerId: "" });
        setShowCreateModal(true);
    };

    const openEditModal = (apartment: AdminApartment) => {
        setSelectedApartment(apartment);
        setFormData({
            unit: apartment.unit,
            floor: apartment.floor.toString(),
            rooms: apartment.rooms.toString(),
            areaM2: apartment.areaM2?.toString() || "",
            observations: apartment.observations || "",
            ownerId: apartment.owner?.id?.toString() || ""
        });
        setShowEditModal(true);
    };

    const getOccupancyBadgeColor = (isOccupied: boolean) => {
        return isOccupied 
            ? "bg-red-100 text-red-800 border-red-200" 
            : "bg-green-100 text-green-800 border-green-200";
    };

    const getFloorOptions = () => {
        const floors = [...new Set(apartments.map(apt => apt.floor))].sort((a, b) => a - b);
        return floors;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Building className="w-8 h-8 text-white" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Gestión de Apartamentos</h2>
                                <p className="text-blue-100 mt-1">Administrar apartamentos del edificio</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-blue-200 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por unidad, propietario, inquilino u observaciones..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-3">
                                <select
                                    value={filterFloor}
                                    onChange={(e) => setFilterFloor(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los pisos</option>
                                    {getFloorOptions().map(floor => (
                                        <option key={floor} value={floor.toString()}>Piso {floor}</option>
                                    ))}
                                </select>

                                <select
                                    value={filterOccupancy}
                                    onChange={(e) => setFilterOccupancy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todos</option>
                                    <option value="occupied">Ocupados</option>
                                    <option value="vacant">Disponibles</option>
                                </select>
                            </div>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={openCreateModal}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Apartamento
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredApartments.length === 0 ? (
                        <div className="text-center py-12">
                            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron apartamentos</h3>
                            <p className="text-gray-500">
                                {apartments.length === 0 
                                    ? "No hay apartamentos registrados en el sistema" 
                                    : "Intenta ajustar los filtros de búsqueda"
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredApartments.map((apartment) => (
                                <motion.div
                                    key={apartment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                Unidad {apartment.unit}
                                            </h3>
                                            <p className="text-gray-600">Piso {apartment.floor}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getOccupancyBadgeColor(apartment.isOccupied)}`}>
                                            {apartment.isOccupied ? "Ocupado" : "Disponible"}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Home className="w-4 h-4" />
                                            <span>{apartment.rooms} habitación{apartment.rooms !== 1 ? 'es' : ''}</span>
                                            {apartment.areaM2 && (
                                                <span className="ml-2">• {apartment.areaM2}m²</span>
                                            )}
                                        </div>

                                        {apartment.observations && (
                                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                <strong>Observaciones:</strong> {apartment.observations}
                                            </div>
                                        )}

                                        {apartment.owner && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span>Propietario: {apartment.owner.name}</span>
                                            </div>
                                        )}

                                        {apartment.tenant && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span>Inquilino: {apartment.tenant.name}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Usuarios: {getUserCount(apartment)}</span>
                                            <span>Reservas: {getReservationCount(apartment)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => openEditModal(apartment)}
                                            disabled={processing}
                                            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteApartment(apartment)}
                                            disabled={processing}
                                            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Apartamento</h3>
                                
                                <form onSubmit={handleCreateApartment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unidad *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej: 101, 102A, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Piso *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.floor}
                                            onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Habitaciones *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="10"
                                            value={formData.rooms}
                                            onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área (m²) (opcional)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.1"
                                            value={formData.areaM2}
                                            onChange={(e) => setFormData({...formData, areaM2: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej: 85.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Observaciones (opcional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.observations}
                                            onChange={(e) => setFormData({...formData, observations: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Notas adicionales sobre el apartamento..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Propietario (opcional)
                                        </label>
                                        <select
                                            value={formData.ownerId}
                                            onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sin asignar</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? "Creando..." : "Crear Apartamento"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            disabled={processing}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && selectedApartment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                    Editar Apartamento {selectedApartment.unit}
                                </h3>
                                
                                <form onSubmit={handleEditApartment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unidad *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Piso *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.floor}
                                            onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Habitaciones *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="10"
                                            value={formData.rooms}
                                            onChange={(e) => setFormData({...formData, rooms: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área (m²) (opcional)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.1"
                                            value={formData.areaM2}
                                            onChange={(e) => setFormData({...formData, areaM2: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej: 85.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Observaciones (opcional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.observations}
                                            onChange={(e) => setFormData({...formData, observations: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Notas adicionales sobre el apartamento..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Propietario
                                        </label>
                                        <select
                                            value={formData.ownerId}
                                            onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Sin asignar</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? "Actualizando..." : "Actualizar"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            disabled={processing}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ApartmentManagement;