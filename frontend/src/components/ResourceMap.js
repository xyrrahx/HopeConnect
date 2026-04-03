import { useState, useEffect } from 'react';
import { MapPin } from 'iconoir-react';

function ResourceMap({ resources, userLocation }) {
  const [mapReady, setMapReady] = useState(false);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    if (!mapReady || !window.google || !userLocation) return;

    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 13,
    });

    new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map: map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    resources.forEach((resource) => {
      const marker = new window.google.maps.Marker({
        position: { lat: resource.lat, lng: resource.lng },
        map: map,
        title: resource.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: Nunito, sans-serif; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${resource.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${resource.category}</p>
            <p style="font-size: 13px; margin-bottom: 8px;">${resource.description}</p>
            <p style="font-size: 12px;"><strong>Hours:</strong> ${resource.hours || 'Call for hours'}</p>
            ${resource.phone ? `<p style="font-size: 12px;"><strong>Phone:</strong> ${resource.phone}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [mapReady, resources, userLocation]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="p-8 bg-[#BFDBFE] rounded-3xl border-2 border-slate-900 shadow-brutal-lg mb-6" data-testid="map-placeholder">
        <div className="flex items-start space-x-3">
          <MapPin className="w-6 h-6 text-slate-900 flex-shrink-0" strokeWidth={2.5} />
          <div>
            <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Interactive Map (Ready to Activate!)
            </h3>
            <p className="text-sm text-slate-700 font-medium mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
              Add your Google Maps API key to see all {resources.length} resources on an interactive map with:
            </p>
            <ul className="text-sm text-slate-700 font-medium space-y-1 ml-4">
              <li>• Color-coded markers by category</li>
              <li>• Click markers for details</li>
              <li>• Your location shown in blue</li>
              <li>• Zoom and pan controls</li>
            </ul>
            <p className="text-xs text-slate-600 mt-3 font-medium">
              Get your free API key at: <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div 
        id="map" 
        className="w-full h-96 rounded-3xl border-2 border-slate-900 shadow-brutal-lg"
        style={{ minHeight: '400px' }}
      />
      <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-slate-600">
        <MapPin className="w-4 h-4" strokeWidth={2.5} />
        <span className="font-medium">Click markers for details • Blue dot is your location</span>
      </div>
    </div>
  );
}

export default ResourceMap;
