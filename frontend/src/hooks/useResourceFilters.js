import { useState, useEffect, useCallback } from 'react';

export const useResourceFilters = (resources, userLocation) => {
  const [filteredResources, setFilteredResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(25);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const sortByDistance = useCallback((resourcesList) => {
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
  }, [userLocation, searchRadius, calculateDistance]);

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
  }, [selectedCategory, searchQuery, resources, userLocation, searchRadius, sortByDistance]);

  return {
    filteredResources,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    searchRadius,
    setSearchRadius
  };
};
