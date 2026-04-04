import { MapPin } from 'iconoir-react';

function LocationInfo({ 
  userLocation, 
  locationError, 
  searchRadius, 
  onRadiusChange, 
  onEnableLocation, 
  resourceCount 
}) {
  const radiusOptions = [5, 10, 25, 50];

  return (
    <div className="mb-8 p-6 bg-[#BFDBFE] rounded-3xl border-2 border-slate-900 shadow-brutal-lg" data-testid="location-notice">
      <div className="flex items-start space-x-3">
        <MapPin className="w-6 h-6 text-slate-900 flex-shrink-0" strokeWidth={2.5} />
        <div className="flex-1">
          {userLocation ? (
            <>
              <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                📍 Showing Resources Within {searchRadius} Miles
              </h3>
              <p className="text-sm text-slate-700 font-medium mb-3" style={{ fontFamily: 'Figtree, sans-serif' }}>
                {resourceCount} resource{resourceCount !== 1 ? 's' : ''} found near you
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-700">Search radius:</span>
                {radiusOptions.map(radius => (
                  <button
                    key={radius}
                    onClick={() => onRadiusChange(radius)}
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
              <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Enable Location
              </h3>
              <p className="text-sm text-slate-700 font-medium mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>
                {locationError || 'Allow location access to see resources near you'}
              </p>
              <button
                onClick={onEnableLocation}
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
  );
}

export default LocationInfo;
