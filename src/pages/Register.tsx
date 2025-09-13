import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { register } from '../api_calls/auth';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    let tempErrors: typeof errors = {};

    if (!name) tempErrors.name = 'El nombre es obligatorio';
    if (!email) tempErrors.email = 'El correo es obligatorio';
    if (!password) tempErrors.password = 'La contraseña es obligatoria';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length === 0) {
      register({ name, email, password }).then((result) => {
        if (result.success) navigate('/login');
        else setErrors({ email: result.message || 'Error en el registro' });
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-600">
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-3xl shadow-xl p-10 max-w-md w-full animate-fadeIn">
        <div className="text-center mb-6">
          <img src="src/assets/Logo_Us_2.png" alt="Logo US" className="mx-auto w-20 h-20 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500 mt-2">Registrate para gestionar tu consorcio</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <HiOutlineUser className="absolute top-3 left-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

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

          {/* Confirm Password */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute top-3 left-3 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Register button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 hover:from-gray-500 hover:via-gray-600 hover:to-gray-800 duration-300"
          >
            Registrarse
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          ¿Ya tenés cuenta?{' '}
          <span
            className="text-gray-800 hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
