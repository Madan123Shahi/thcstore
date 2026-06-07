import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar, FiAlertCircle } from "react-icons/fi";
import {
  formatPrice,
  getDiscountPercent,
  getImageUrl,
} from "../../utils/helpers";
import { useCart, useWishlist } from "../../hooks";
import { trackAddToCart} from '../../utils/useAnalytics';

// ✅ React.memo — prevents re-render if product prop hasn't changed
const ProductCard = memo(function ProductCard({ product }) {
  const { handleAddToCart } = useCart();
  const { isWishlisted, handleToggle } = useWishlist(product._id);
  const discount = getDiscountPercent(product.price, product.mrp);

  // ✅ useCallback — stable reference, prevents child re-renders
 

const handleAdd = useCallback(() => {
  if (product.stock > 0) {
    handleAddToCart(product);
    trackAddToCart(product._id, product.name); // ✅ track event
  }
}, [product, handleAddToCart]);

  // ✅ Use thumbnail for cards — smallest size, fastest load
  const cardImage = product.images?.[0]?.thumbnail || product.images?.[0]?.url;

  return (
    <div className="product-card bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="product-img-wrapper relative bg-gray-50 aspect-square overflow-hidden">
        <Link to={`/products/${product.slug || product._id}`}>
          <img
            src={getImageUrl(cardImage)}
            alt={product.images?.[0]?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" // ✅ lazy load — images load only when in viewport
            decoding="async" // ✅ async decode — doesn't block main thread
            width={400}
            height={400}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="badge bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="badge bg-earth-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              Best Seller
            </span>
          )}
          {product.isAyushApproved && (
            <span className="badge bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              AYUSH ✓
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
            ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
        >
          <FiHeart
            className={`text-sm ${isWishlisted ? "fill-current" : ""}`}
          />
        </button>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-semibold text-sm px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-primary-600 font-semibold uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <Link to={`/products/${product.slug || product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`text-xs ${i < Math.round(product.rating) ? "text-amber-400 fill-current" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              ({product.numReviews})
            </span>
          </div>
        )}

        {/* Prescription warning */}
        {product.requiresPrescription && (
          <div className="flex items-center gap-1 mb-2 text-xs text-orange-600 bg-orange-50 rounded-lg px-2 py-1">
            <FiAlertCircle className="shrink-0" />
            <span>Prescription required</span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200
              ${
                product.stock > 0
                  ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <FiShoppingCart className="text-sm" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {product.volume && (
          <p className="text-xs text-gray-400 mt-1">{product.volume}</p>
        )}
      </div>
    </div>
  );
});

export default ProductCard;
