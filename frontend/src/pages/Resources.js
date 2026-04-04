import { useState, useEffect } from 'react';
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
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  
  const { userLocation, locationError, getUserLocation } = useGeolocation();
  
  const {
    filteredResources,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    searchRadius,
    setSearchRadius
  } = useResourceFilters(resources, userLocation);

  const categories = ['all', 'Shelter', 'Food', 'Healthcare', 'Public Washroom', 'Community Centre', 'Free Laundromat', 'Clothing Bank', 'Phone Charging', 'Free WiFi', 'Water Refill', 'Free Meals', 'Harm Reduction', 'Legal Aid', 'ID Services', 'Veterans Services', 'Pet Services', 'Transportation', 'Seasonal Resources'];

  useEffect(() => {
    fetchResources();
    getUserLocation();
    
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setFavorites(res.data.favorites || []))
        .catch(() => {});
    }
  }, [getUserLocation]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (resourceId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to save favorites');
      return;
    }
    
    try {
      const response = await axios.post(`${API}/user/favorites/${resourceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Find Resources Near You
          </h1>
          <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Browse shelters, food banks, and healthcare services in your area
          </p>
        </motion.div>

        <ResourceFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <LocationInfo
          userLocation={userLocation}
          locationError={locationError}
          searchRadius={searchRadius}
          onRadiusChange={setSearchRadius}
          onEnableLocation={getUserLocation}
          resourceCount={filteredResources.length}
        />

        <ResourceMap resources={filteredResources} userLocation={userLocation} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
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

        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-brutal-lg">
            <p className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No resources found
            </p>
            <p className="text-base text-slate-600 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
              {userLocation 
                ? `Try increasing your search radius above ${searchRadius} miles`
                : 'Enable location to find resources near you'
              }
            </p>
            {userLocation && searchRadius < 50 && (
              <button
                onClick={() => setSearchRadius(50)}
                className="px-6 py-3 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
              >
                Search within 50 miles
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Resources;
