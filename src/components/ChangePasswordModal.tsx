import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ChangePasswordModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (currentPassword: string, newPassword: string) => Promise<void>;
}

function ChangePasswordModal({ 
    isVisible, 
    onClose, 
    onSave 
}: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);

    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setIsLoading(false);
        setShowRequirements(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        setError("");

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas nuevas no coinciden");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setError("La nueva contraseña debe tener al menos una letra mayúscula");
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setError("La nueva contraseña debe tener al menos un número");
            return;
        }

        if (currentPassword === newPassword) {
            setError("La nueva contraseña debe ser diferente a la actual");
            return;
        }

        setIsLoading(true);
        try {
            await onSave(currentPassword, newPassword);
            resetForm();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cambiar la contraseña");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Cambiar contraseña</h3>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="password"
                                placeholder="Contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none"
                                disabled={isLoading}
                            />
                            
                            <div>
                                <input
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    onFocus={() => setShowRequirements(true)}
                                    onBlur={() => setShowRequirements(false)}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none"
                                    disabled={isLoading}
                                />
                                
                                {/* Password requirements - only shown when focused */}
                                {showRequirements && (
                                    <div className="mt-2 text-xs space-y-1">
                                        <p className="text-gray-600 font-medium">La contraseña debe tener:</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                                                Al menos 6 caracteres
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                                Al menos una letra mayúscula
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                                Al menos un número
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${currentPassword && newPassword && currentPassword !== newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            <span className={currentPassword && newPassword && currentPassword !== newPassword ? 'text-green-600' : 'text-gray-500'}>
                                                Diferente a la contraseña actual
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <input
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all cursor-pointer"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-all disabled:opacity-50 cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ChangePasswordModal;