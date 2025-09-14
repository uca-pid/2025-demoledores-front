import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface LogoutSuccessToastProps {
    isVisible: boolean;
    onComplete: () => void;
}

function LogoutSuccessToast({ isVisible, onComplete }: LogoutSuccessToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onComplete();
            }, 2000); // Show for 2 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    className="fixed top-4 right-4 z-[70] bg-white rounded-xl shadow-2xl border border-green-200 p-4 max-w-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">Sesión cerrada</h4>
                            <p className="text-sm text-gray-600">Redirigiendo al login...</p>
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="h-1 bg-green-500 rounded-full mt-3"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LogoutSuccessToast;