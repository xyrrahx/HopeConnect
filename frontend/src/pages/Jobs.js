import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bag as Briefcase, MapPin, DollarCircle, Search, Filter } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);

  const jobTypes = ['all', 'Full-time', 'Part-time'];
  const radiusOptions = [5, 10, 25, 50];

  useEffect(() => {
    fetchJobs();
    getUserLocation();
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
          setLocationError('Unable to get location. Showing all jobs.');
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

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API}/jobs`);
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortByDistance = (jobsList) => {
    if (!userLocation) return jobsList;
    
    const jobsWithDistance = jobsList.map(job => ({
      ...job,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        job.lat,
        job.lng
      )
    }));
    
    return jobsWithDistance
      .filter(job => job.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);
  };

  useEffect(() => {
    let filtered = jobs;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(j => j.type === selectedType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered = sortByDistance(filtered);
    
    setFilteredJobs(filtered);
  }, [selectedType, searchQuery, jobs, userLocation, searchRadius]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Job Opportunities
          </h1>
          <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Find entry-level positions and start building your career
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-jobs-input"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#A7E6D7]/30 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            {jobTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                data-testid={`filter-${type.toLowerCase()}`}
                className={`px-4 py-2 rounded-full border-2 border-slate-900 font-bold text-sm uppercase tracking-wider transition-all ${
                  selectedType === type
                    ? 'bg-[#A7E6D7] text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                    : 'bg-white text-slate-700 hover:bg-[#FDE68A]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 p-6 bg-[#A7E6D7] rounded-3xl border-2 border-slate-900 shadow-brutal-lg" data-testid="location-notice">
          <div className="flex items-start space-x-3">
            <MapPin className="w-6 h-6 text-slate-900 flex-shrink-0" strokeWidth={2.5} />
            <div className="flex-1">
              {userLocation ? (
                <>
                  <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>📍 Showing Jobs Within {searchRadius} Miles</h3>
                  <p className="text-sm text-slate-700 font-medium mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
                    {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found near you
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
                            ? 'bg-white text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                            : 'bg-[#FFFDF9] text-slate-700 hover:bg-white'
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
                    {locationError || 'Allow location access to see jobs near you'}
                  </p>
                  <button
                    onClick={getUserLocation}
                    data-testid="enable-location-button"
                    className="px-4 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 shadow-[2px_2px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all text-sm"
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
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#A7E6D7] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`job-card-${job.id}`}
                className="p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#A7E6D7] rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
                    </div>
                    <div className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#FDE68A] text-xs font-bold uppercase tracking-wider">
                      {job.type}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {job.title}
                </h3>
                {job.distance !== undefined && (
                  <div className="mb-2 inline-block px-3 py-1 rounded-full bg-[#BFDBFE] border border-slate-900">
                    <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Figtree, sans-serif' }}>
                      📍 {job.distance < 1 ? `${(job.distance * 5280).toFixed(0)} ft` : `${job.distance.toFixed(1)} mi`} away
                    </span>
                  </div>
                )}
                <p className="text-lg font-semibold text-slate-700 mb-4 mt-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                  {job.company}
                </p>
                <p className="text-base leading-relaxed text-slate-700 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                  {job.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                    <span className="text-sm text-slate-700 font-medium">{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center space-x-2">
                      <DollarCircle className="w-4 h-4 text-slate-600" strokeWidth={2.5} />
                      <span className="text-sm text-slate-700 font-medium">{job.salary}</span>
                    </div>
                  )}
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-slate-900 mb-2">Requirements:</p>
                    <ul className="space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-slate-700 font-medium flex items-start">
                          <span className="mr-2">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-slate-900 flex flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">Contact:</p>
                    <a
                      href={job.contact.includes('@') ? `mailto:${job.contact}` : `tel:${job.contact}`}
                      data-testid={`job-contact-${job.id}`}
                      className="inline-block px-6 py-3 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      {job.contact}
                    </a>
                  </div>
                  {job.lat && job.lng && (
                    <div>
                      <p className="text-sm text-slate-600 font-semibold mb-2">Navigate:</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`job-directions-${job.id}`}
                        className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-slate-900 bg-[#BFDBFE] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                      >
                        <MapPin className="w-4 h-4" strokeWidth={2.5} />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12 p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-brutal-lg">
            <p className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No jobs found
            </p>
            <p className="text-base text-slate-600 font-medium mb-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
              {userLocation 
                ? `Try increasing your search radius above ${searchRadius} miles`
                : 'Enable location to find jobs near you'
              }
            </p>
            {userLocation && searchRadius < 50 && (
              <button
                onClick={() => setSearchRadius(50)}
                className="px-6 py-3 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
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

export default Jobs;