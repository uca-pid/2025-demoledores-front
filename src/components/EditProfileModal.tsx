import { motion, AnimatePresence } from "framer-motion";
import { LoadingButton } from "./LoadingSpinner";

interface EditProfileModalProps {
    isVisible: boolean;
    onClose: () => void;
    newName: string;
    onNameChange: (name: string) => void;
    onSave: () => void;
    isSaving?: boolean;
}

function EditProfileModal({ 
    isVisible, 
    onClose, 
    newName, 
    onNameChange, 
    onSave,
    isSaving = false
}: EditProfileModalProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Editar nombre</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => onNameChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-gray-400 outline-none"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <LoadingButton
                                onClick={onSave}
                                loading={isSaving}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-all"
                                loadingText="Guardando..."
                            >
                                Guardar
                            </LoadingButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default EditProfileModal;