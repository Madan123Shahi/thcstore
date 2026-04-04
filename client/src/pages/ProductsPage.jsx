import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { fetchProducts, setFilters } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/product/ProductCard';
import { LoadingGrid, Pagination, EmptyState, ErrorMessage } from '../components/common';
import { SORT_OPTIONS } from '../utils/helpers';
import { FiShoppingBag } from 'react-icons/fi';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: '', max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹3,000', min: 1000, max: 3000 },
  { label: '₹3,000 - ₹6,000', min: 3000, max: 6000 },
  { label: 'Above ₹6,000', min: 6000, max: '' },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, pagination, loading, error } = useSelector(s => s.products);
  const { list: categories } = useSelector(s => s.categories);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const params = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isBestSeller: searchParams.get('isBestSeller') || '',
    requiresPrescription: searchParams.get('requiresPrescription') || '',
  };

  const loadProducts = useCallback(() => {
    const q = {};
    Object.entries({ ...params, page }).forEach(([k, v]) => { if (v !== '') q[k] = v; });
    dispatch(fetchProducts(q));
  }, [dispatch, page, searchParams]); // eslint-disable-line

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { setPage(1); }, [searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const activeCategoryObj = categories.find(c => c.slug === params.category);
  const hasFilters = params.search || params.category || params.minPrice || params.maxPrice;

  const Sidebar = () => (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-1">
          <button onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!params.category ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
            All Products
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => updateParam('category', cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${params.category === cat.slug ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map(r => {
            const active = params.minPrice == r.min && params.maxPrice == r.max;
            return (
              <button key={r.label}
                onClick={() => { updateParam('minPrice', r.min); updateParam('maxPrice', r.max); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${active ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Filter By</h3>
        <div className="space-y-2">
          {[
            { key: 'isFeatured', label: 'Featured' },
            { key: 'isBestSeller', label: 'Best Sellers' },
            { key: 'requiresPrescription', label: 'Prescription Required' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={!!params[key]} onChange={e => updateParam(key, e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="w-full btn-secondary text-sm py-2">
          <FiX /> Clear All Filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="section-heading text-2xl">
            {activeCategoryObj?.name || params.search ? `"${params.search}"` : 'All Products'}
          </h1>
          {!loading && pagination && (
            <p className="text-sm text-gray-400 mt-1">{pagination.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-secondary text-sm py-2 px-4">
            <FiFilter /> Filters
          </button>
          <div className="relative">
            <select
              value={params.sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="input-field py-2 pr-8 text-sm appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>
        </div>
      </div>

      {/* Active filters chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {params.search && <Chip label={`Search: ${params.search}`} onRemove={() => updateParam('search', '')} />}
          {params.category && <Chip label={activeCategoryObj?.name || params.category} onRemove={() => updateParam('category', '')} />}
          {(params.minPrice || params.maxPrice) && <Chip label={`₹${params.minPrice || '0'} - ₹${params.maxPrice || '∞'}`} onRemove={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }} />}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-60 shrink-0"><Sidebar /></div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 overflow-y-auto p-6 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}><FiX /></button>
              </div>
              <Sidebar />
            </div>
          </>
        )}

        {/* Products */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingGrid count={12} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={loadProducts} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={FiShoppingBag}
              title="No products found"
              description="Try adjusting your filters or search terms"
              action={<button onClick={clearAll} className="btn-primary px-6 py-2.5 text-sm">Clear Filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {list.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pagination?.pages || 1} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900">
        <FiX className="text-xs" />
      </button>
    </span>
  );
}
