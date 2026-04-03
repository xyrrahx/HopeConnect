import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Gift, Search, Filter, OpenInWindow, Phone } from 'iconoir-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [filteredBenefits, setFilteredBenefits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Food Assistance', 'Healthcare', 'Housing'];

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const response = await axios.get(`${API}/benefits`);
      setBenefits(response.data);
      setFilteredBenefits(response.data);
    } catch (error) {
      console.error('Error fetching benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = benefits;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredBenefits(filtered);
  }, [selectedCategory, searchQuery, benefits]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Government Benefits
          </h1>
          <p className="text-base leading-relaxed text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
            Learn about assistance programs you may be eligible for
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-benefits-input"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FDE68A]/30 outline-none text-slate-900 font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                data-testid={`filter-${cat.toLowerCase().replace(' ', '-')}`}
                className={`px-4 py-2 rounded-full border-2 border-slate-900 font-bold text-sm uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FDE68A] text-slate-900 shadow-[2px_2px_0px_#0F172A]'
                    : 'bg-white text-slate-700 hover:bg-[#BFDBFE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-[#FDE68A] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`benefit-card-${benefit.id}`}
                className="p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_#0F172A] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#0F172A] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#FDE68A] rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
                    </div>
                    <div className="px-3 py-1 rounded-full border-2 border-slate-900 bg-[#BFDBFE] text-xs font-bold uppercase tracking-wider">
                      {benefit.category}
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {benefit.name}
                </h3>
                <p className="text-base leading-relaxed text-slate-700 font-medium mb-6" style={{ fontFamily: 'Figtree, sans-serif' }}>
                  {benefit.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-slate-900">
                    <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Eligibility</h4>
                    <p className="text-sm text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                      {benefit.eligibility}
                    </p>
                  </div>
                  <div className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-slate-900">
                    <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">How to Apply</h4>
                    <p className="text-sm text-slate-700 font-medium" style={{ fontFamily: 'Figtree, sans-serif' }}>
                      {benefit.how_to_apply}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {benefit.website && (
                    <a
                      href={benefit.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`benefit-website-${benefit.id}`}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-slate-900 bg-[#FDE68A] font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      <OpenInWindow className="w-4 h-4" strokeWidth={2.5} />
                      <span>Visit Website</span>
                    </a>
                  )}
                  {benefit.phone && (
                    <a
                      href={`tel:${benefit.phone}`}
                      data-testid={`benefit-phone-${benefit.id}`}
                      className="inline-flex items-center space-x-2 px-6 py-3 rounded-full border-2 border-slate-900 bg-white font-bold text-slate-900 shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] active:translate-y-[1px] active:shadow-none transition-all"
                    >
                      <Phone className="w-4 h-4" strokeWidth={2.5} />
                      <span>{benefit.phone}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredBenefits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600 font-medium">No benefits found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Benefits;