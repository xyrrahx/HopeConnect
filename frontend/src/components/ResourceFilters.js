import { Search, Filter, Check } from 'iconoir-react';

function ResourceFilters({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange,
  verifiedOnly,
  onVerifiedToggle,
  cities,
  selectedCity,
  onCityChange
}) {
  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="search-resources-input"
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-900 bg-white focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none text-slate-900 font-medium"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />

        {cities && cities.length > 1 && (
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            data-testid="city-filter-dropdown"
            className="px-6 py-3 rounded-full border-2 border-slate-900 bg-[#FF9D8A] font-bold text-sm uppercase tracking-wider focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none cursor-pointer shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] transition-all"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          data-testid="category-filter-dropdown"
          className="px-6 py-3 rounded-full border-2 border-slate-900 bg-white font-bold text-sm uppercase tracking-wider focus:ring-4 focus:ring-[#FF9D8A]/30 outline-none cursor-pointer shadow-[4px_4px_0px_#0F172A] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#0F172A] transition-all"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <button
          onClick={onVerifiedToggle}
          data-testid="verified-filter-toggle"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 font-bold text-sm uppercase tracking-wider transition-all cursor-pointer ${
            verifiedOnly
              ? 'border-emerald-700 bg-emerald-500 text-white shadow-[4px_4px_0px_#047857]'
              : 'border-slate-900 bg-white text-slate-700 shadow-[4px_4px_0px_#0F172A] hover:bg-emerald-50'
          }`}
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          <Check className="w-4 h-4" strokeWidth={3} />
          Verified Only
        </button>

        {(selectedCategory !== 'all' || verifiedOnly || selectedCity !== 'all') && (
          <button
            onClick={() => { onCategoryChange('all'); if (verifiedOnly) onVerifiedToggle(); onCityChange('all'); }}
            data-testid="clear-filter-button"
            className="px-4 py-2 rounded-full border-2 border-slate-900 bg-[#FFE4B5] font-bold text-sm hover:bg-[#FFD7A5] transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default ResourceFilters;
