import { motion } from 'framer-motion';
import { Bag as Briefcase, MapPin, DollarCircle } from 'iconoir-react';

function JobCard({ job, index }) {
  return (
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

      <div className="pt-4 border-t-2 border-slate-900">
        <p className="text-sm text-slate-600 font-semibold mb-2">Contact:</p>
        <a
          href={job.contact.includes('@') ? `mailto:${job.contact}` : `tel:${job.contact}`}
          data-testid={`job-contact-${job.id}`}
          className="inline-block px-6 py-3 rounded-full border-2 border-slate-900 bg-[#A7E6D7] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
        >
          {job.contact}
        </a>
      </div>
    </motion.div>
  );
}

export default JobCard;
