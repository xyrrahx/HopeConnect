import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { X } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Auth({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem('token', response.data.token);
      onSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_#0F172A] p-8"
        data-testid="auth-modal"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {isLogin ? 'Welcome Back' : 'Join HopeConnect'}
          </h2>
          <button
            onClick={onClose}
            data-testid="close-auth-modal"
            className="p-2 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="auth-name-input"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              data-testid="auth-email-input"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              data-testid="auth-password-input"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="auth-phone-input"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900"
                placeholder="+1234567890"
              />
            </div>
          )}

          {error && (
            <div data-testid="auth-error-message" className="p-4 rounded-2xl border-2 border-slate-900 bg-red-100 text-red-700 font-semibold text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="auth-submit-button"
            className="w-full px-6 py-4 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            data-testid="toggle-auth-mode"
            className="text-slate-700 font-semibold hover:text-slate-900 transition-colors"
            style={{ fontFamily: 'Figtree, sans-serif' }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Auth;