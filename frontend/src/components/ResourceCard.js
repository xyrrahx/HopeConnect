import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Heart, OpenNewWindow, ShareAndroid, Copy, MessageText, QrCode } from 'iconoir-react';
import { QRCodeSVG } from 'qrcode.react';
import { getCategoryColor } from '../utils/categoryColors';

function ResourceCard({ resource, index, favorites, onToggleFavorite }) {
  const [showShare, setShowShare] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const categoryColor = getCategoryColor(resource.category);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`;
  const shareText = `${resource.name}\n${resource.address}${resource.hours ? `\nHours: ${resource.hours}` : ''}${resource.phone ? `\nPhone: ${resource.phone}` : ''}\nDirections: ${mapsUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSMSShare = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: resource.name, text: shareText, url: mapsUrl });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-testid={`resource-card-${resource.id}`}
      className="p-6 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all relative"
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
          <Heart className="w-5 h-5" strokeWidth={2.5} fill={favorites.includes(resource.id) ? '#FF9D8A' : 'none'} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
        {resource.name}
      </h3>

      {resource.distance !== undefined && (
        <div className="mb-2 inline-block px-3 py-1 rounded-full bg-[#A7E6D7] border border-slate-900">
          <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Figtree, sans-serif' }}>
            {resource.distance < 1 ? `${(resource.distance * 5280).toFixed(0)} ft` : `${resource.distance.toFixed(1)} mi`} away
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
            <a href={`tel:${resource.phone}`} className="text-slate-700 font-medium hover:text-slate-900">{resource.phone}</a>
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
            <span key={idx} className="px-2 py-1 bg-[#FFFDF9] border border-slate-900 rounded-full text-xs font-semibold text-slate-700">
              {service}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t-2 border-slate-200 flex flex-wrap gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`directions-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-slate-900 bg-[#BFDBFE] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <OpenNewWindow className="w-4 h-4" strokeWidth={2.5} />
          <span>Directions</span>
        </a>
        <button
          onClick={() => { setShowShare(!showShare); setShowQR(false); }}
          data-testid={`share-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-slate-900 bg-[#FDE68A] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <ShareAndroid className="w-4 h-4" strokeWidth={2.5} />
          <span>Share</span>
        </button>
        <button
          onClick={() => { setShowQR(!showQR); setShowShare(false); }}
          data-testid={`qr-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-slate-900 bg-[#E9D5FF] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <QrCode className="w-4 h-4" strokeWidth={2.5} />
          <span>QR</span>
        </button>
      </div>

      {showShare && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 bg-[#FFFDF9] rounded-2xl border-2 border-slate-900"
          data-testid={`share-panel-${resource.id}`}
        >
          <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Share this resource</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              data-testid={`copy-link-${resource.id}`}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>{copied ? 'Copied!' : 'Copy Info'}</span>
            </button>
            <button
              onClick={handleSMSShare}
              data-testid={`sms-share-${resource.id}`}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all"
            >
              <MessageText className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>SMS</span>
            </button>
            {typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                data-testid={`native-share-${resource.id}`}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all"
              >
                <ShareAndroid className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>More</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {showQR && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 bg-white rounded-2xl border-2 border-slate-900 flex flex-col items-center"
          data-testid={`qr-panel-${resource.id}`}
        >
          <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Scan for directions</p>
          <div className="p-3 bg-white rounded-xl border-2 border-slate-200">
            <QRCodeSVG value={mapsUrl} size={140} level="M" />
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2 text-center">{resource.name}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ResourceCard;
