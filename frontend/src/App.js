import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, MapPin, Bag as Briefcase, Gift, Group as Users, Phone, User, Menu, X, Heart, LogOut } from 'iconoir-react';
import '@/App.css';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Jobs from './pages/Jobs';
import Benefits from './pages/Benefits';
import Community from './pages/Community';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import Auth from './pages/Auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Navigation() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUser(res.data)).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/resources', icon: MapPin, label: 'Resources' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/benefits', icon: Gift, label: 'Benefits' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/emergency', icon: Phone, label: 'Emergency' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-900 shadow-brutal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="w-10 h-10 bg-[#FF9D8A] rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Heart className="w-6 h-6 text-slate-900" strokeWidth={3} />
              </div>
              <span className="text-xl font-black text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>HopeConnect</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#FF9D8A] text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_#0F172A]'
                        : 'text-slate-700 hover:bg-[#A7E6D7] hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    data-testid="profile-link"
                    className="px-4 py-2 rounded-full border-2 border-slate-900 font-bold text-slate-900 hover:bg-[#FDE68A] transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" strokeWidth={2.5} />
                      <span>{user.name}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    data-testid="logout-button"
                    className="px-4 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  data-testid="login-button"
                  className="px-6 py-2 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  Sign In
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2 rounded-full border-2 border-slate-900 bg-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t-2 border-slate-900 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                        isActive
                          ? 'bg-[#FF9D8A] text-slate-900 border-2 border-slate-900 shadow-brutal'
                          : 'text-slate-700 hover:bg-[#A7E6D7]'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="border-t-2 border-slate-900 pt-3 mt-3">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-slate-900 border-2 border-slate-900 bg-[#FDE68A] mb-2"
                      >
                        <User className="w-5 h-5" strokeWidth={2.5} />
                        <span>{user.name}</span>
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-slate-900 border-2 border-slate-900"
                      >
                        <LogOut className="w-5 h-5" strokeWidth={2.5} />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-brutal"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {showAuth && (
          <Auth onClose={() => setShowAuth(false)} onSuccess={(userData) => { setUser(userData); setShowAuth(false); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/community" element={<Community />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;