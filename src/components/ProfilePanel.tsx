import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfilePanelProps {
    isVisible: boolean;
    onClose: () => void;
    userName: string;
    onEditProfile: () => void;
    onChangePassword: () => void;
    onLogout: () => void;
}

function ProfilePanel({ 
    isVisible, 
    onClose, 
    userName, 
    onEditProfile,
    onChangePassword, 
    onLogout 
}: ProfilePanelProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Overlay con blur para el fondo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
                        onClick={onClose}
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
                            onClick={onClose}
                            className="absolute top-4 left-4 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div className="mt-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfil</h2>
                            <p className="text-lg text-gray-700 mb-6">{userName}</p>
                            <div className="space-y-3">
                                <button
                                    onClick={onEditProfile}
                                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
                                >
                                    Editar nombre
                                </button>
                                <button
                                    onClick={onChangePassword}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                                >
                                    Cambiar contraseña
                                </button>
                            </div>
                        </div>

                        <button
                            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                            onClick={onLogout}
                        >
                            Cerrar sesión
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default ProfilePanel;