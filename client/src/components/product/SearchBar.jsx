import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { getImageUrl, formatPrice } from '../../utils/helpers';
import api from '../../utils/api';

// ─────────────────────────────────────────────
// ✅ Debounce hook — delays API call until user
// stops typing for 300ms (prevents spamming)
// ─────────────────────────────────────────────
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export default function SearchBar({ className = '' }) {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const dropdownRef = useRef(null);

  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1); // keyboard nav

  const debouncedQuery = useDebounce(query, 300); // ✅ 300ms debounce

  // ─── Fetch autocomplete suggestions ──────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        setSuggestions(data.suggestions || []);
        setOpen(true);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // ─── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current    && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Submit search — go to products page ─────────────────────────────────
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  }, [query, navigate]);

  // ─── Click suggestion ─────────────────────────────────────────────────────
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion.name);
    setOpen(false);
    navigate(`/products/${suggestion.slug || suggestion._id}`);
  }, [navigate]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0) {
        handleSuggestionClick(suggestions[activeIdx]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* ── Search input ── */}
      <form onSubmit={handleSubmit} className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products, brands..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
          autoComplete="off"
        />

        {/* Clear button or loader */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <FiLoader className="text-gray-400 text-sm animate-spin" />
          ) : query ? (
            <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
              <FiX className="text-sm" />
            </button>
          ) : null}
        </div>
      </form>

      {/* ── Autocomplete dropdown ── */}
      {open && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <button
              key={s._id}
              onClick={() => handleSuggestionClick(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0
                ${activeIdx === i ? 'bg-primary-50' : ''}`}
            >
              {/* ✅ Product thumbnail in dropdown */}
              {s.image && (
                <img
                  src={getImageUrl(s.image)}
                  alt={s.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{s.name}</p>
                <p className="text-xs text-gray-400">{s.brand}</p>
              </div>
              {s.price && (
                <span className="text-sm font-semibold text-primary-600 shrink-0">
                  {formatPrice(s.price)}
                </span>
              )}
            </button>
          ))}

          {/* ✅ "See all results" footer */}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 text-sm text-primary-600 font-semibold bg-primary-50 hover:bg-primary-100 transition-colors text-center"
          >
            See all results for "{query}" →
          </button>
        </div>
      )}

      {/* ── No results state ── */}
      {open && !loading && debouncedQuery.length >= 2 && suggestions.length === 0 && (
        <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 p-4 text-center">
          <p className="text-sm text-gray-400">No results for "{debouncedQuery}"</p>
          <button onClick={handleSubmit} className="text-xs text-primary-600 font-medium mt-1 hover:underline">
            Search anyway →
          </button>
        </div>
      )}
    </div>
  );
}