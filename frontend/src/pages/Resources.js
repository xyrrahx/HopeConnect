import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ResourceMap from '../components/ResourceMap';
import ResourceCard from '../components/ResourceCard';
import ResourceFilters from '../components/ResourceFilters';
import LocationInfo from '../components/LocationInfo';
import { useResourceFilters } from '../hooks/useResourceFilters';
import { useGeolocation } from '../hooks/useGeolocation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Resources() {
  const [communityResources, setCommunityResources] = useState([]);
  const [liveResources, setLiveResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [showSource, setShowSource] = useState('all');
  
  const { userLocation, locationError, getUserLocation } = useGeolocation();

  const allResources = showSource === 'community' ? communityResources
    : showSource === 'nearby' ? liveResources
    : [...communityResources, ...liveResources.filter(lr => !communityResources.some(cr => cr.name.toLowerCase() === lr.name.toLowerCase()))];
  
  const {
    filteredResources,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    searchRadius,
    setSearchRadius
  } = useResourceFilters(allResources, userLocation);

  const categories = ['all', 'Shelter', 'Food', 'Healthcare', 'Public Washroom', 'Community Centre', 'Free Laundromat', 'Clothing Bank', 'Phone Charging', 'Free WiFi', 'Water Refill', 'Free Meals', 'Harm Reduction', 'Legal Aid', 'ID Services', 'Veterans Services', 'Pet Services', 'Transportation', 'Seasonal Resources'];

  const fetchCommunityResources = useCallback(async () => {
    try {
      const params = {};
      if (selectedCity && selectedCity !== 'all') params.city = selectedCity;
      const response = await axios.get(`${API}/resources`, { params });
      setCommunityResources(response.data.map(r => ({ ...r, source: r.source || 'community' })));
    } catch (error) {
      // silently handled
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  const fetchLiveResources = useCallback(async (loc) => {
    if (!loc) return;
    setLiveLoading(true);
    try {
      const response = await axios.get(`${API}/resources/discover`, {
        params: { lat: loc.lat, lng: loc.lng, radius_miles: searchRadius }
      });
      setLiveResources(response.data.map(r => ({ ...r, source: 'osm' })));
    } catch (error) {
      // silently handled
    } finally {
      setLiveLoading(false);
    }
  }, [searchRadius]);

  useEffect(() => {
    fetchCommunityResources();
    axios.get(`${API}/resources/cities`).then(r => setCities(r.data)).catch(() => {});
    getUserLocation();
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setFavorites(res.data.favorites || []))
        .catch(() => {});
    }
  }, [getUserLocation, fetchCommunityResources]);

  useEffect(() => {
    if (userLocation) {
      fetchLiveResources(userLocation);
    }
  }, [userLocation, fetchLiveResources]);

  useEffect(() => {
    fetchCommunityResources();
  }, [selectedCity, fetchCommunityResources]);

  const toggleFavorite = async (resourceId) => {
    if (resourceId.startsWith('osm-')) {
      alert('Sign in and submit this as a community resource to save it to favorites');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { alert('Please sign in to save favorites'); return; }
    try {
      const response = await axios.post(`${API}/user/favorites/${resourceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      // silently handled
    }
  };

  const displayResources = verifiedOnly ? filteredResources.filter(r => r.verified) : filteredResources;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Find Resources Near You
          </h1>
          <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Discover shelters, food banks, and services anywhere in the world
          </p>
        </motion.div>

        <ResourceFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          verifiedOnly={verifiedOnly}
          onVerifiedToggle={() => setVerifiedOnly(!verifiedOnly)}
          cities={cities}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />

        <div className="mb-6 flex gap-2 flex-wrap" data-testid="source-filter">
          {[
            { id: 'all', label: 'All Sources', count: allResources.length },
            { id: 'community', label: 'Community', count: communityResources.length },
            { id: 'nearby', label: 'Nearby (Live)', count: liveResources.length },
          ].map(src => (
            <button
              key={src.id}
              onClick={() => setShowSource(src.id)}
              data-testid={`source-${src.id}`}
              className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                showSource === src.id
                  ? 'border-slate-900 bg-[#A7E6D7] text-slate-900 shadow-[3px_3px_0px_#0F172A]'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-900'
              }`}
            >
              {src.label} ({src.count})
            </button>
          ))}
          {liveLoading && (
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500">
              <span className="w-4 h-4 border-2 border-slate-400 border-t-[#FF9D8A] rounded-full animate-spin"></span>
              Finding nearby...
            </span>
          )}
        </div>

        <LocationInfo
          userLocation={userLocation}
          locationError={locationError}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
          onEnableLocation={getUserLocation}
          resourceCount={displayResources.length}
          allCount={allResources.length}
        />

        <ResourceMap resources={displayResources} userLocation={userLocation} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayResources.map((resource, index) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {!loading && displayResources.length === 0 && (
          <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-brutal-lg">
            <p className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No resources found
            </p>
            <p className="text-base text-slate-600 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
              {userLocation 
                ? 'Try a different filter or enable location to discover nearby resources'
                : 'Enable location to discover resources near you from OpenStreetMap'
              }
            </p>
            {!userLocation && (
              <button
                onClick={getUserLocation}
                data-testid="enable-location-btn"
                className="px-6 py-3 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
              >
                Enable Location
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Resources;
