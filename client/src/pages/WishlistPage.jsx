import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { EmptyState } from '../components/common';

export default function WishlistPage() {
  const { items } = useSelector(s => s.wishlist);
  const { user } = useSelector(s => s.auth);

  // Merge ids with full product objects from user.wishlist (if populated)
  const products = user?.wishlist?.filter(p => typeof p === 'object') || [];

  return (
    <div className="page-container py-8 animate-fade-in">
      <h1 className="section-heading text-2xl mb-6 flex items-center gap-3">
        <FiHeart className="text-red-500" /> My Wishlist
        {products.length > 0 && <span className="text-lg text-gray-400">({products.length})</span>}
      </h1>

      {products.length === 0 ? (
        <EmptyState
          icon={FiHeart}
          title="Your wishlist is empty"
          description="Save products you love by tapping the heart icon"
          action={<Link to="/products" className="btn-primary px-6 py-2.5 text-sm">Discover Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
