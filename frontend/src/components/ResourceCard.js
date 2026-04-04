import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Heart, OpenNewWindow } from 'iconoir-react';
import { getCategoryColor } from '../utils/categoryColors';

function ResourceCard({ resource, index, favorites, onToggleFavorite }) {
  const categoryColor = getCategoryColor(resource.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-testid={`resource-card-${resource.id}`}
      className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full border-2 border-slate-900 text-xs font-bold uppercase tracking-wider ${categoryColor}`}>
          {resource.category}
        </div>
        <button
          onClick={() => onToggleFavorite(resource.id)}
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
          {resource.services.map((service, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-[#FFFDF9] border border-slate-900 rounded-full text-xs font-semibold text-slate-700"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-slate-200">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`directions-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border-2 border-slate-900 bg-[#BFDBFE] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <OpenNewWindow className="w-4 h-4" strokeWidth={2.5} />
          <span>Get Directions</span>
        </a>
      </div>
    </motion.div>
  );
}

export default ResourceCard;
