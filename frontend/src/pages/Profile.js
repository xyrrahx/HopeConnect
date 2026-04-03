import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { User, Heart, Phone, Bell, BellOff } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Profile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    try {
      const userResponse = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);
      setSmsEnabled(userResponse.data.sms_enabled || false);
      setPhone(userResponse.data.phone || '');

      if (userResponse.data.favorites && userResponse.data.favorites.length > 0) {
        const resourcesResponse = await axios.get(`${API}/resources`);
        const favoriteResources = resourcesResponse.data.filter(r => 
          userResponse.data.favorites.includes(r.id)
        );
        setFavorites(favoriteResources);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const handleSmsToggle = async () => {
    const token = localStorage.getItem('token');
    if (!phone && !smsEnabled) {
      alert('Please enter your phone number first');
      return;
    }

    try {
      await axios.post(`${API}/sms/subscribe`, {
        phone: phone,
        enabled: !smsEnabled
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmsEnabled(!smsEnabled);
      alert(`SMS notifications ${!smsEnabled ? 'enabled' : 'disabled'} (MOCKED)`);
    } catch (error) {
      console.error('Error toggling SMS:', error);
      alert('Failed to update SMS preferences');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-[#A7E6D7] rounded-full border-2 border-slate-900 flex items-center justify-center shadow-brutal-lg">
              <User className="w-10 h-10 text-slate-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {user.name}
              </h1>
              <p className="text-base text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A]"
            data-testid="sms-preferences-section"
          >
            <div className="flex items-center space-x-3 mb-4">
              {smsEnabled ? (
                <Bell className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
              ) : (
                <BellOff className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
              )}
              <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                SMS Notifications
              </h2>
            </div>

            <div className="p-4 bg-[#FDE68A] rounded-2xl border-2 border-slate-900 mb-4">
              <p className="text-sm text-slate-900 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                <strong>Note:</strong> SMS feature is currently MOCKED. Twilio integration will be enabled once you provide API credentials.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Phone Number</label>
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="phone-input"
                    placeholder="+1234567890"
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#A7E6D7]/30 outline-none text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleSmsToggle}
                data-testid="toggle-sms-button"
                className={`w-full px-6 py-4 rounded-full border-2 border-slate-900 font-bold shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all ${
                  smsEnabled ? 'bg-[#FF9D8A]' : 'bg-[#A7E6D7]'
                }`}
              >
                {smsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A]"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-slate-900" strokeWidth={2.5} fill="#FF9D8A" />
              <h2 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Saved Resources ({favorites.length})
              </h2>
            </div>

            {favorites.length === 0 ? (
              <p className="text-base text-slate-600 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                You haven't saved any resources yet. Visit the Resources page to save your favorites.
              </p>
            ) : (
              <div className="space-y-4">
                {favorites.map(resource => (
                  <div
                    key={resource.id}
                    data-testid={`favorite-resource-${resource.id}`}
                    className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {resource.name}
                          </h3>
                          <span className="px-2 py-1 rounded-full border border-slate-900 text-xs font-bold uppercase">
                            {resource.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                          {resource.address}
                        </p>
                        {resource.phone && (
                          <a href={`tel:${resource.phone}`} className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                            {resource.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;