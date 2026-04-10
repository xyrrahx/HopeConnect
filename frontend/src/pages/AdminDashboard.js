import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, Xmark, MapPin, Clock, Phone, WarningTriangle } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        axios.get(`${API}/resources/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPending(pendingRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access required' : err.response?.data?.detail || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`${API}/resources/pending/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(prev => prev.filter(p => p.id !== id));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending_submissions: prev.pending_submissions - 1,
          ...(action === 'approve' ? { resources: prev.resources + 1 } : {})
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action}`);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <WarningTriangle className="w-16 h-16 text-[#FF9D8A] mx-auto mb-4" strokeWidth={2} />
          <h1 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Sign In Required</h1>
          <p className="text-lg text-slate-700 font-medium">Please sign in with an admin account.</p>
        </div>
      </div>
    );
  }

  if (error === 'Admin access required') {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <WarningTriangle className="w-16 h-16 text-[#FDE68A] mx-auto mb-4" strokeWidth={2} />
          <h1 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Access Denied</h1>
          <p className="text-lg text-slate-700 font-medium">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-base text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Review user-submitted resources and manage the platform.</p>
        </motion.div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Resources', value: stats.resources, color: 'bg-[#A7E6D7]' },
              { label: 'Jobs', value: stats.jobs, color: 'bg-[#BFDBFE]' },
              { label: 'Users', value: stats.users, color: 'bg-[#FDE68A]' },
              { label: 'Pending', value: stats.pending_submissions, color: 'bg-[#FF9D8A]' },
            ].map(s => (
              <div key={s.label} className={`p-6 ${s.color} rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A]`} data-testid={`stat-${s.label.toLowerCase()}`}>
                <p className="text-3xl font-black text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Pending Submissions ({pending.length})
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-brutal-lg">
            <p className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>No pending submissions</p>
            <p className="text-base text-slate-600 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>All caught up! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`pending-card-${item.id}`}
                className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#FDE68A] text-xs font-bold uppercase tracking-wider">{item.category}</span>
                      <span className="text-xs text-slate-500 font-medium">by {item.submitted_by_name}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>{item.name}</h3>
                    <p className="text-sm text-slate-700 font-medium mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>{item.description}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                        <span className="text-slate-700 font-medium">{item.address}</span>
                      </div>
                      {item.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                          <span className="text-slate-700 font-medium">{item.hours}</span>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                          <span className="text-slate-700 font-medium">{item.phone}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1">Coords: {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}</p>
                    </div>
                    {item.services && item.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.services.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-[#FFFDF9] border border-slate-900 rounded-full text-xs font-semibold text-slate-700">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 lg:flex-col">
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      data-testid={`approve-${item.id}`}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      data-testid={`reject-${item.id}`}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-slate-900 bg-[#FECACA] font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      <Xmark className="w-5 h-5" strokeWidth={2.5} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {error && error !== 'Admin access required' && (
          <div className="mt-4 p-4 rounded-2xl border-2 border-slate-900 bg-red-100 text-red-700 font-semibold text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
