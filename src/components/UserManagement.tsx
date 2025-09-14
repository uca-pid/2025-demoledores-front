import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Crown, Home, AlertTriangle } from "lucide-react";
import { getAdminUsers, updateUserRole, type AdminUser } from "../api_calls/admin";

// Helper function to safely get reservation count from user object
const getReservationCount = (user: AdminUser): number => {
    return user._count?.reservations ?? user.reservationCount ?? 0;
};

interface UserManagementProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

function UserManagement({ isOpen, onClose, token }: UserManagementProps) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && token) {
            loadUsers();
        }
    }, [isOpen, token]);

    useEffect(() => {
        // Filtrar usuarios basado en búsqueda y role
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterRole !== "all") {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, filterRole]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersData = await getAdminUsers(token);
            // Asegurar que siempre sea un array
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            } else {
                console.error("Users data is not an array:", usersData);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error loading users:", error);
            setUsers([]); // Establecer array vacío en caso de error
            // Mostrar error pero no bloquear la UI
            console.warn("Failed to load users, showing empty list");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        if (!confirm(`¿Estás seguro de cambiar el role de este usuario a "${newRole}"?`)) {
            return;
        }

        setUpdatingUserId(userId);
        try {
            const updatedUser = await updateUserRole(token, userId, newRole);
            
            // Actualizar la lista local
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, role: updatedUser.role } : user
            ));
            
            alert("Role actualizado exitosamente");
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Error al actualizar role: " + (error instanceof Error ? error.message : "Error desconocido"));
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin": return <Crown className="w-4 h-4 text-yellow-500" />;
            case "owner": return <Home className="w-4 h-4 text-blue-500" />;
            case "tenant": return <Users className="w-4 h-4 text-green-500" />;
            default: return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "owner": return "bg-blue-100 text-blue-800 border-blue-300";
            case "tenant": return "bg-green-100 text-green-800 border-green-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] mx-4 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="admin">Administradores</option>
                            <option value="owner">Propietarios</option>
                            <option value="tenant">Inquilinos</option>
                        </select>
                    </div>

                    {/* Users List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 mb-1">{user.email}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Reservas: {getReservationCount(user)}</span>
                                                    {user.apartment && (
                                                        <span>Apt: {user.apartment.unit} {user.apartment.floor ? `(Piso ${user.apartment.floor})` : ''}</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={updatingUserId === user.id}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 cursor-pointer"
                                                >
                                                    <option value="tenant">Inquilino</option>
                                                    <option value="owner">Propietario</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                                
                                                {updatingUserId === user.id && (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {filteredUsers.length === 0 && !loading && (
                                    <div className="text-center py-12">
                                        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
                                        <p className="text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.length : 0}</div>
                                <div className="text-sm text-gray-500">Total Usuarios</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">{Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}</div>
                                <div className="text-sm text-gray-500">Administradores</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{Array.isArray(users) ? users.filter(u => u.role === 'owner').length : 0}</div>
                                <div className="text-sm text-gray-500">Propietarios</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{Array.isArray(users) ? users.filter(u => u.role === 'tenant').length : 0}</div>
                                <div className="text-sm text-gray-500">Inquilinos</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default UserManagement;