import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { login } from '../api_calls/auth';
import { forgotPassword } from '../api_calls/forgot_password';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // <--- prevent page reload

    const result = await login({ email, password });
    console.log('Login attempt:', { email, password });

    if (result.success) navigate("/dashboard");
    else setErrors({ email: result.message || 'Error en el inicio de sesión' });
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword({ email });
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-600">
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-3xl shadow-xl p-10 max-w-md w-full animate-fadeIn">
        <div className="text-center mb-4">
          <img
            src="src/assets/Logo_Us_2.png"
            alt="Logo US"
            className="mx-auto w-25 h-25 animate-bounce"
          />
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido a US</h1>
          <p className="text-gray-500 mt-2">Iniciá sesión para gestionar tu consorcio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <HiOutlineMail className="absolute top-3 left-3 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute top-3 left-3 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white font-bold py-3 rounded-lg shadow-md hover:from-gray-500 hover:via-gray-600 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          ¿No tenés cuenta?{' '}
          <span
            className="text-gray-800 hover:underline cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Registrate
          </span>
        </p>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isVisible={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSendEmail={handleForgotPassword}
        />
      </div>
    </div>
  );
}

export default Login;
