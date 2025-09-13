import { User } from "lucide-react";

interface DashboardHeaderProps {
    userName: string;
    onProfileClick: () => void;
}

function DashboardHeader({ userName, onProfileClick }: DashboardHeaderProps) {
    return (
        <header className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900">
                ¡Bienvenido, {userName}!
            </h1>
            <button
                onClick={onProfileClick}
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all cursor-pointer"
                title="Perfil"
            >
                <User className="w-6 h-6" />
            </button>
        </header>
    );
}

export default DashboardHeader;