import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapPin, Check, WarningTriangle } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const categories = ['Shelter', 'Food', 'Healthcare', 'Public Washroom', 'Community Centre', 'Free Laundromat', 'Clothing Bank', 'Phone Charging', 'Free WiFi', 'Water Refill', 'Free Meals', 'Harm Reduction', 'Legal Aid', 'ID Services', 'Veterans Services', 'Pet Services', 'Transportation', 'Seasonal Resources'];

function SuggestResource() {
  const [mapReady, setMapReady] = useState(false);
  const [marker, setMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: categories[0], description: '', address: '',
    phone: '', hours: '', lat: 0, lng: 0, services: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || window.google) {
      if (window.google) setMapReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  const initMap = useCallback((node) => {
    if (!node || !mapReady || !window.google) return;
    const map = new window.google.maps.Map(node, {
      center: { lat: 40.7589, lng: -73.9851 },
      zoom: 13,
    });
    setMapInstance(map);

    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setForm(prev => ({ ...prev, lat, lng }));
    });

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => {});
    }
  }, [mapReady]);

  useEffect(() => {
    if (!mapInstance || !window.google) return;
    if (marker) marker.setMap(null);
    if (form.lat && form.lng) {
      const m = new window.google.maps.Marker({
        position: { lat: form.lat, lng: form.lng },
        map: mapInstance,
        draggable: true,
        title: 'Resource Location',
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#FF9D8A', fillOpacity: 1, strokeColor: '#0F172A', strokeWeight: 2 },
      });
      m.addListener('dragend', (e) => {
        setForm(prev => ({ ...prev, lat: e.latLng.lat(), lng: e.latLng.lng() }));
      });
      setMarker(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.lat, form.lng, mapInstance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) { setError('Please drop a pin on the map or enter coordinates'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/resources/suggest`, {
        ...form,
        services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <WarningTriangle className="w-16 h-16 text-[#FF9D8A] mx-auto mb-4" strokeWidth={2} />
          <h1 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Sign In Required</h1>
          <p className="text-lg text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Please sign in to suggest a new resource.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#A7E6D7] rounded-full border-2 border-slate-900 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-slate-900" strokeWidth={3} />
          </motion.div>
          <h1 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Submission Received!</h1>
          <p className="text-lg text-slate-700 font-medium mb-6" style={{ fontFamily: 'Figtree, sans-serif' }}>An admin will review your suggestion shortly.</p>
          <button onClick={() => { setSubmitted(false); setForm({ name: '', category: categories[0], description: '', address: '', phone: '', hours: '', lat: 0, lng: 0, services: '' }); }} className="px-6 py-3 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all">
            Suggest Another
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900 font-medium";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>Suggest a Resource</h1>
          <p className="text-base text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>Know a place that helps? Drop a pin on the map or fill in the address. An admin will review your suggestion.</p>
        </motion.div>

        {GOOGLE_MAPS_API_KEY && (
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-700 mb-2">Click the map to set the location (drag the pin to adjust)</p>
            <div ref={initMap} className="w-full h-80 rounded-3xl border-2 border-slate-900 shadow-brutal-lg" data-testid="suggest-map" />
            {form.lat !== 0 && (
              <p className="text-xs text-slate-500 font-medium mt-2">Pin: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Resource Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputCls} data-testid="suggest-name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} data-testid="suggest-category">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required className={inputCls} data-testid="suggest-address" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} className={inputCls + " resize-none"} data-testid="suggest-description" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} data-testid="suggest-phone" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hours</label>
              <input type="text" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} className={inputCls} placeholder="e.g. Mon-Fri 9AM-5PM" data-testid="suggest-hours" />
            </div>
          </div>

          {!GOOGLE_MAPS_API_KEY && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude *</label>
                <input type="number" step="any" value={form.lat || ''} onChange={e => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })} required className={inputCls} data-testid="suggest-lat" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude *</label>
                <input type="number" step="any" value={form.lng || ''} onChange={e => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })} required className={inputCls} data-testid="suggest-lng" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Services (comma separated)</label>
            <input type="text" value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} className={inputCls} placeholder="e.g. Free WiFi, Showers, Meals" data-testid="suggest-services" />
          </div>

          {error && <div className="p-4 rounded-2xl border-2 border-slate-900 bg-red-100 text-red-700 font-semibold text-sm" data-testid="suggest-error">{error}</div>}

          <button type="submit" disabled={loading} data-testid="suggest-submit" className="w-full px-6 py-4 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SuggestResource;
