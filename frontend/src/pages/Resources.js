import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapPin, Phone, Clock, Search, Filter, Heart } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);

  const categories = ['all', 'Shelter', 'Food', 'Healthcare', 'Public Washroom', 'Community Centre', 'Free Laundromat', 'Clothing Bank', 'Phone Charging', 'Free WiFi', 'Water Refill', 'Free Meals', 'Harm Reduction', 'Legal Aid', 'ID Services'];
  const radiusOptions = [5, 10, 25, 50];

  useEffect(() => {
    fetchResources();
    getUserLocation();
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setFavorites(res.data.favorites || []))
        .catch(() => {});
    }
  }, []);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
          setLocationError('Unable to get location. Showing all resources.');
        }
      );
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API}/resources`);
      setResources(response.data);
      setFilteredResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortByDistance = (resourcesList) => {
    if (!userLocation) return resourcesList;
    
    const resourcesWithDistance = resourcesList.map(resource => ({
      ...resource,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        resource.lat,
        resource.lng
      )
    }));
    
    return resourcesWithDistance
      .filter(resource => resource.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);
  };

  useEffect(() => {
    let filtered = resources;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered = sortByDistance(filtered);
    
    setFilteredResources(filtered);
  }, [selectedCategory, searchQuery, resources, userLocation, searchRadius]);

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

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-resources-input"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                data-testid={`filter-${cat.toLowerCase()}`}
                className={`px-4 py-2 rounded-full border-2 border-slate-900 font-bold text-sm uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FF9D8A] text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                    : 'bg-white text-slate-700 hover:bg-[#A7E6D7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 p-6 bg-[#BFDBFE] rounded-3xl border-2 border-slate-900 shadow-brutal-lg" data-testid="location-notice">
          <div className="flex items-start space-x-3">
            <MapPin className="w-6 h-6 text-slate-900 flex-shrink-0" strokeWidth={2.5} />
            <div className="flex-1">
              {userLocation ? (
                <>
                  <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>📍 Showing Resources Within {searchRadius} Miles</h3>
                  <p className="text-sm text-slate-700 font-medium mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found near you
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-semibold text-slate-700">Search radius:</span>
                    {radiusOptions.map(radius => (
                      <button
                        key={radius}
                        onClick={() => setSearchRadius(radius)}
                        data-testid={`radius-${radius}`}
                        className={`px-3 py-1 rounded-full border-2 border-slate-900 font-bold text-xs uppercase tracking-wider transition-all ${
                          searchRadius === radius
                            ? 'bg-[#A7E6D7] text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                            : 'bg-white text-slate-700 hover:bg-[#FDE68A]'
                        }`}
                      >
                        {radius} mi
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Enable Location</h3>
                  <p className="text-sm text-slate-700 font-medium mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    {locationError || 'Allow location access to see resources near you'}
                  </p>
                  <button
                    onClick={getUserLocation}
                    data-testid="enable-location-button"
                    className="px-4 py-2 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[2px_2px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all text-sm"
                  >
                    Enable Location
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FF9D8A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`resource-card-${resource.id}`}
                className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`px-3 py-1 rounded-full border-2 border-slate-900 text-xs font-bold uppercase tracking-wider ${
                      resource.category === 'Shelter' ? 'bg-[#FF9D8A]' :
                      resource.category === 'Food' ? 'bg-[#A7E6D7]' :
                      resource.category === 'Healthcare' ? 'bg-[#FDE68A]' :
                      resource.category === 'Public Washroom' ? 'bg-[#BFDBFE]' :
                      resource.category === 'Community Centre' ? 'bg-[#DDA7E6]' :
                      resource.category === 'Free Laundromat' ? 'bg-[#FFC9E6]' :
                      resource.category === 'Clothing Bank' ? 'bg-[#FFE4B5]' :
                      resource.category === 'Phone Charging' ? 'bg-[#B5E6D7]' :
                      resource.category === 'Free WiFi' ? 'bg-[#C4E6FF]' :
                      resource.category === 'Water Refill' ? 'bg-[#B3E5FC]' :
                      resource.category === 'Free Meals' ? 'bg-[#FFD7A5]' :
                      resource.category === 'Harm Reduction' ? 'bg-[#E6C9FF]' :
                      resource.category === 'Legal Aid' ? 'bg-[#D4E6A5]' :
                      resource.category === 'ID Services' ? 'bg-[#FFE6D5]' :
                      'bg-[#FDE68A]'
                    }`}
                  >
                    {resource.category}
                  </div>
                  <button
                    onClick={() => toggleFavorite(resource.id)}
                    data-testid={`favorite-button-${resource.id}`}
                    className="p-2 rounded-full border-2 border-slate-900 bg-white hover:bg-[#FF9D8A] transition-all"
                  >
                    <Heart
                      className="w-5 h-5"
                      strokeWidth={2.5}
                      fill={favorites.includes(resource.id) ? '#FF9D8A' : 'none'}
                    />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {resource.name}
                </h3>
                {resource.distance !== undefined && (
                  <div className="mb-2 inline-block px-3 py-1 rounded-full bg-[#A7E6D7] border border-slate-900">
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Figtree, sans-serif' }}>
                      📍 {resource.distance < 1 ? `${(resource.distance * 5280).toFixed(0)} ft` : `${resource.distance.toFixed(1)} mi`} away
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed text-slate-700 font-medium mb-4 mt-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                  {resource.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-slate-700 font-medium">{resource.address}</span>
                  </div>
                  {resource.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-600 flex-shrink-0" strokeWidth={2.5} />
                      <a href={`tel:${resource.phone}`} className="text-slate-700 font-medium hover:text-slate-900">
                        {resource.phone}
                      </a>
                    </div>
                  )}
                  {resource.hours && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-600 flex-shrink-0" strokeWidth={2.5} />
                      <span className="text-slate-700 font-medium">{resource.hours}</span>
                    </div>
                  )}
                </div>

                {resource.services && resource.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.services.map(service => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-[#FFFDF9] border border-slate-900 rounded-full text-xs font-semibold text-slate-700"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
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