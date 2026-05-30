import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Check, Xmark, MapPin, Clock, Phone, WarningTriangle, BadgeCheck, Mail, User } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('submissions');
  const [allResources, setAllResources] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes, claimsRes, resourcesRes] = await Promise.all([
        axios.get(`${API}/resources/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/resources/claims`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/resources`),
      ]);
      setPending(pendingRes.data);
      setStats(statsRes.data);
      setClaims(claimsRes.data);
      setAllResources(resourcesRes.data);
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

  const handleClaimAction = async (claimId, action) => {
    try {
      await axios.post(`${API}/resources/claims/${claimId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(prev => prev.filter(c => c.id !== claimId));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending_claims: prev.pending_claims - 1,
          ...(action === 'approve' ? { verified_resources: prev.verified_resources + 1 } : {})
        }));
      }
      if (action === 'approve') {
        setAllResources(prev => prev.map(r => {
          const claim = claims.find(c => c.id === claimId);
          return claim && r.id === claim.resource_id ? { ...r, verified: true } : r;
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} claim`);
    }
  };

  const toggleVerified = async (resourceId) => {
    try {
      const res = await axios.post(`${API}/resources/${resourceId}/toggle-verified`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllResources(prev => prev.map(r => r.id === resourceId ? { ...r, verified: res.data.verified } : r));
      if (stats) {
        setStats(prev => ({
          ...prev,
          verified_resources: prev.verified_resources + (res.data.verified ? 1 : -1)
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to toggle');
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

  const tabs = [
    { id: 'submissions', label: 'Submissions', count: pending.length },
    { id: 'claims', label: 'Verification Claims', count: claims.length },
    { id: 'resources', label: 'All Resources', count: allResources.length },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-base text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Review submissions, verification claims, and manage resources.</p>
        </motion.div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Resources', value: stats.resources, color: 'bg-[#A7E6D7]' },
              { label: 'Verified', value: stats.verified_resources, color: 'bg-emerald-200' },
              { label: 'Jobs', value: stats.jobs, color: 'bg-[#BFDBFE]' },
              { label: 'Users', value: stats.users, color: 'bg-[#FDE68A]' },
              { label: 'Pending', value: stats.pending_submissions, color: 'bg-[#FF9D8A]' },
              { label: 'Claims', value: stats.pending_claims, color: 'bg-[#E9D5FF]' },
            ].map(s => (
              <div key={s.label} className={`p-5 ${s.color} rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A]`} data-testid={`stat-${s.label.toLowerCase()}`}>
                <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'Nunito, sans-serif' }}>{s.value}</p>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`px-5 py-3 rounded-full border-2 font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'border-slate-900 bg-[#FF9D8A] text-slate-900 shadow-[3px_3px_0px_#0F172A]'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'submissions' && (
              <div>
                {pending.length === 0 ? (
                  <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900">
                    <p className="text-xl font-bold text-slate-900 mb-2">No pending submissions</p>
                    <p className="text-base text-slate-600 font-medium">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pending.map((item, index) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} data-testid={`pending-card-${item.id}`} className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[4px_4px_0px_#0F172A]">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#FDE68A] text-xs font-bold uppercase tracking-wider">{item.category}</span>
                              <span className="text-xs text-slate-500 font-medium">by {item.submitted_by_name}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.name}</h3>
                            <p className="text-sm text-slate-700 font-medium mb-3">{item.description}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{item.address}</span></div>
                              {item.hours && <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{item.hours}</span></div>}
                              {item.phone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{item.phone}</span></div>}
                            </div>
                          </div>
                          <div className="flex gap-2 lg:flex-col">
                            <button onClick={() => handleAction(item.id, 'approve')} data-testid={`approve-${item.id}`} className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all">
                              <Check className="w-5 h-5" strokeWidth={2.5} /><span>Approve</span>
                            </button>
                            <button onClick={() => handleAction(item.id, 'reject')} data-testid={`reject-${item.id}`} className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-slate-900 bg-[#FECACA] font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all">
                              <Xmark className="w-5 h-5" strokeWidth={2.5} /><span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'claims' && (
              <div>
                {claims.length === 0 ? (
                  <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900">
                    <p className="text-xl font-bold text-slate-900 mb-2">No pending verification claims</p>
                    <p className="text-base text-slate-600 font-medium">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim, index) => (
                      <motion.div key={claim.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} data-testid={`claim-card-${claim.id}`} className="p-6 bg-white rounded-3xl border-2 border-emerald-600 shadow-[4px_4px_0px_#059669]">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-emerald-700 bg-emerald-100 text-xs font-bold uppercase tracking-wider text-emerald-800">
                                <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                Verification Claim
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Resource: {claim.resource_name}</h3>
                            <p className="text-sm font-semibold text-emerald-700 mb-3">Business: {claim.business_name}</p>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center space-x-2"><User className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{claim.owner_name}</span></div>
                              <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{claim.contact_email}</span></div>
                              {claim.contact_phone && <div className="flex items-center space-x-2"><Phone className="w-4 h-4 text-slate-600" strokeWidth={2.5} /><span className="text-slate-700 font-medium">{claim.contact_phone}</span></div>}
                              {claim.proof && (
                                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                  <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Proof of Ownership</p>
                                  <p className="text-sm text-slate-700">{claim.proof}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 lg:flex-col">
                            <button onClick={() => handleClaimAction(claim.id, 'approve')} data-testid={`approve-claim-${claim.id}`} className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-emerald-700 bg-emerald-400 font-bold text-white shadow-[3px_3px_0px_#047857] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#047857] active:translate-y-[1px] active:shadow-none transition-all">
                              <Check className="w-5 h-5" strokeWidth={2.5} /><span>Verify</span>
                            </button>
                            <button onClick={() => handleClaimAction(claim.id, 'reject')} data-testid={`reject-claim-${claim.id}`} className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-full border-2 border-slate-900 bg-[#FECACA] font-bold text-slate-900 shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all">
                              <Xmark className="w-5 h-5" strokeWidth={2.5} /><span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <p className="text-sm text-slate-600 font-medium mb-4">Toggle verification status for any resource.</p>
                <div className="space-y-3">
                  {allResources.map((resource, index) => (
                    <motion.div key={resource.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${resource.verified ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white'}`} data-testid={`admin-resource-${resource.id}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 truncate">{resource.name}</h4>
                          {resource.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                              <Check className="w-3 h-3" strokeWidth={3} /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{resource.category} - {resource.address}</p>
                      </div>
                      <button
                        onClick={() => toggleVerified(resource.id)}
                        data-testid={`toggle-verified-${resource.id}`}
                        className={`flex-shrink-0 px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                          resource.verified
                            ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border-emerald-600 bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {resource.verified ? 'Remove Verified' : 'Mark Verified'}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && error !== 'Admin access required' && (
          <div className="mt-4 p-4 rounded-2xl border-2 border-slate-900 bg-red-100 text-red-700 font-semibold text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
