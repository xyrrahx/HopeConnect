import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Clock, Heart, OpenNewWindow, ShareAndroid, Copy, MessageText, QrCode, Check, BadgeCheck, ThumbsUp, ThumbsDown } from 'iconoir-react';
import { QRCodeSVG } from 'qrcode.react';
import { getCategoryColor } from '../utils/categoryColors';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ResourceCard({ resource, index, favorites, onToggleFavorite }) {
  const [showShare, setShowShare] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claimForm, setClaimForm] = useState({ business_name: '', owner_name: '', contact_email: '', contact_phone: '', proof: '' });
  const [claimStatus, setClaimStatus] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(resource.helpful_count || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(resource.not_helpful_count || 0);
  const [voted, setVoted] = useState(null);
  const categoryColor = getCategoryColor(resource.category);
  const token = localStorage.getItem('token');

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`;
  const shareText = `${resource.name}\n${resource.address}${resource.hours ? `\nHours: ${resource.hours}` : ''}${resource.phone ? `\nPhone: ${resource.phone}` : ''}\nDirections: ${mapsUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = async (vote) => {
    if (voted) return;
    try {
      const res = await axios.post(`${API}/resources/${resource.id}/rate?vote=${vote}`);
      setHelpfulCount(res.data.helpful_count);
      setNotHelpfulCount(res.data.not_helpful_count);
      setVoted(vote);
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleSMSShare = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: resource.name, text: shareText, url: mapsUrl });
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!token) { setClaimStatus('Please sign in to claim this resource'); return; }
    setClaimLoading(true);
    try {
      await axios.post(`${API}/resources/${resource.id}/claim`, claimForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaimStatus('success');
    } catch (err) {
      setClaimStatus(err.response?.data?.detail || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const isVerified = resource.verified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-testid={`resource-card-${resource.id}`}
      className={`p-6 rounded-3xl border-2 transition-all relative ${
        isVerified
          ? 'bg-gradient-to-br from-white to-[#F0FDF4] border-emerald-600 shadow-[6px_6px_0px_#059669] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#059669]'
          : 'bg-white border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A]'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1 rounded-full border-2 border-slate-900 text-xs font-bold uppercase tracking-wider ${categoryColor}`}>
            {resource.category}
          </div>
          {isVerified && (
            <div
              data-testid={`verified-badge-${resource.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider border-2 border-emerald-700 shadow-[2px_2px_0px_#047857]"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              Verified
            </div>
          )}
        </div>
        <button
          onClick={() => onToggleFavorite(resource.id)}
          data-testid={`favorite-button-${resource.id}`}
          className="p-2 rounded-full border-2 border-slate-900 bg-white hover:bg-[#FF9D8A] transition-all"
        >
          <Heart className="w-5 h-5" strokeWidth={2.5} fill={favorites.includes(resource.id) ? '#FF9D8A' : 'none'} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
        {resource.name}
        {isVerified && <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />}
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

      <div className="mt-4 flex items-center gap-3" data-testid={`rating-section-${resource.id}`}>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Helpful?</span>
        <button
          onClick={() => handleVote('helpful')}
          disabled={!!voted}
          data-testid={`thumbs-up-${resource.id}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
            voted === 'helpful'
              ? 'border-emerald-600 bg-emerald-100 text-emerald-800'
              : voted ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-500 hover:bg-emerald-50'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2.5} />
          {helpfulCount}
        </button>
        <button
          onClick={() => handleVote('not_helpful')}
          disabled={!!voted}
          data-testid={`thumbs-down-${resource.id}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
            voted === 'not_helpful'
              ? 'border-red-400 bg-red-50 text-red-700'
              : voted ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : 'border-slate-300 bg-white text-slate-600 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2.5} />
          {notHelpfulCount}
        </button>
      </div>

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
          onClick={() => { setShowShare(!showShare); setShowQR(false); setShowClaim(false); }}
          data-testid={`share-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-slate-900 bg-[#FDE68A] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <ShareAndroid className="w-4 h-4" strokeWidth={2.5} />
          <span>Share</span>
        </button>
        <button
          onClick={() => { setShowQR(!showQR); setShowShare(false); setShowClaim(false); }}
          data-testid={`qr-button-${resource.id}`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-slate-900 bg-[#E9D5FF] font-bold text-slate-900 text-sm shadow-[3px_3px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <QrCode className="w-4 h-4" strokeWidth={2.5} />
          <span>QR</span>
        </button>
        {!isVerified && (
          <button
            onClick={() => { setShowClaim(!showClaim); setShowShare(false); setShowQR(false); }}
            data-testid={`claim-button-${resource.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 border-emerald-700 bg-emerald-50 font-bold text-emerald-800 text-sm shadow-[3px_3px_0px_#047857] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#047857] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <BadgeCheck className="w-4 h-4" strokeWidth={2.5} />
            <span>Claim & Verify</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 bg-[#FFFDF9] rounded-2xl border-2 border-slate-900 overflow-hidden"
            data-testid={`share-panel-${resource.id}`}
          >
            <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Share this resource</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleCopy} data-testid={`copy-link-${resource.id}`} className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all">
                <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{copied ? 'Copied!' : 'Copy Info'}</span>
              </button>
              <button onClick={handleSMSShare} data-testid={`sms-share-${resource.id}`} className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all">
                <MessageText className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>SMS</span>
              </button>
              {typeof navigator.share === 'function' && (
                <button onClick={handleNativeShare} data-testid={`native-share-${resource.id}`} className="inline-flex items-center space-x-2 px-3 py-2 rounded-full border-2 border-slate-900 bg-white font-bold text-xs hover:bg-[#A7E6D7] transition-all">
                  <ShareAndroid className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>More</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 bg-white rounded-2xl border-2 border-slate-900 flex flex-col items-center overflow-hidden"
            data-testid={`qr-panel-${resource.id}`}
          >
            <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Scan for directions</p>
            <div className="p-3 bg-white rounded-xl border-2 border-slate-200">
              <QRCodeSVG value={mapsUrl} size={140} level="M" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2 text-center">{resource.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClaim && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-700 overflow-hidden"
            data-testid={`claim-panel-${resource.id}`}
          >
            {claimStatus === 'success' ? (
              <div className="text-center py-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" strokeWidth={3} />
                <p className="text-sm font-bold text-emerald-800">Claim submitted! An admin will review it shortly.</p>
                <p className="text-xs text-emerald-600 mt-1">Free during beta period</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-emerald-800 mb-1 uppercase tracking-wider">Claim & Verify This Resource</p>
                <p className="text-xs text-emerald-700 mb-3">Free during beta. Verified listings rank higher and get a badge.</p>
                {claimStatus && claimStatus !== 'success' && (
                  <p className="text-xs text-red-600 font-semibold mb-2">{claimStatus}</p>
                )}
                <form onSubmit={handleClaim} className="space-y-2">
                  <input type="text" placeholder="Business Name *" required value={claimForm.business_name} onChange={e => setClaimForm({ ...claimForm, business_name: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-sm focus:border-emerald-600 outline-none" data-testid={`claim-business-name-${resource.id}`} />
                  <input type="text" placeholder="Your Name *" required value={claimForm.owner_name} onChange={e => setClaimForm({ ...claimForm, owner_name: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-sm focus:border-emerald-600 outline-none" data-testid={`claim-owner-name-${resource.id}`} />
                  <input type="email" placeholder="Contact Email *" required value={claimForm.contact_email} onChange={e => setClaimForm({ ...claimForm, contact_email: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-sm focus:border-emerald-600 outline-none" data-testid={`claim-email-${resource.id}`} />
                  <input type="text" placeholder="Phone (optional)" value={claimForm.contact_phone} onChange={e => setClaimForm({ ...claimForm, contact_phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-sm focus:border-emerald-600 outline-none" data-testid={`claim-phone-${resource.id}`} />
                  <textarea placeholder="How can you prove ownership? (optional)" value={claimForm.proof} onChange={e => setClaimForm({ ...claimForm, proof: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-sm focus:border-emerald-600 outline-none resize-none" data-testid={`claim-proof-${resource.id}`} />
                  <button type="submit" disabled={claimLoading} data-testid={`claim-submit-${resource.id}`} className="w-full px-4 py-2.5 rounded-full border-2 border-emerald-700 bg-emerald-500 text-white font-bold text-sm shadow-[3px_3px_0px_#047857] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#047857] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50">
                    {claimLoading ? 'Submitting...' : 'Submit Claim (Free Beta)'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ResourceCard;
