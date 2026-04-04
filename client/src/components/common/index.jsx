import { FiStar } from 'react-icons/fi';

// Spinner
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${s[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  );
}

// Full page loader
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

// Loading grid skeleton
export function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded-xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Star rating
export function StarRating({ rating, reviews, size = 'sm' }) {
  const s = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FiStar key={i} className={`${s} ${i < Math.round(rating) ? 'text-amber-400 fill-current' : 'text-gray-200'}`} />
        ))}
      </div>
      {reviews !== undefined && <span className={`${s} text-gray-400`}>({reviews})</span>}
    </div>
  );
}

// Interactive star input
export function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-2xl transition-colors ${n <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

// Pagination
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPage(page - 1)} disabled={page === 1}
        className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
        ← Prev
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = pages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= pages - 2 ? pages - 4 + i : page - 2 + i;
          return (
            <button key={p} onClick={() => onPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                ${p === page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onPage(page + 1)} disabled={page === pages}
        className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
        Next →
      </button>
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {Icon && <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="text-2xl text-gray-300" />
      </div>}
      <div>
        <p className="font-semibold text-gray-700 text-lg">{title}</p>
        {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// Error message
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-red-600 font-medium">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary px-6 py-2.5 text-sm">Try Again</button>
      )}
    </div>
  );
}
