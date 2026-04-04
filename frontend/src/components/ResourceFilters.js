import { Search, Filter } from 'iconoir-react';

function ResourceFilters({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange 
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

      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
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
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onCategoryChange('all')}
            data-testid="clear-filter-button"
            className="px-4 py-2 rounded-full border-2 border-slate-900 bg-[#FFE4B5] font-bold text-sm hover:bg-[#FFD7A5] transition-all"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
}

export default ResourceFilters;
