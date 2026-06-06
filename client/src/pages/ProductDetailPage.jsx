import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMinus,
  FiPlus,
  FiHeart,
  FiShare2,
  FiShield,
  FiAlertCircle,
  FiChevronRight,
} from "react-icons/fi";
import { fetchProduct, addReview } from "../store/slices/productSlice";
import { formatPrice, getImageUrl, getDiscountPercent } from "../utils/helpers";
import { useCart, useWishlist } from "../hooks";
import {
  PageLoader,
  StarRating,
  StarInput,
  ErrorMessage,
} from "../components/common";
import toast from "react-hot-toast";
import { addReviewSchema } from "./../../../shared/schemas/product.schema";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: product, loading, error } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const { handleAddToCart } = useCart();
  const { isWishlisted, handleToggle } = useWishlist(product?._id);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(slug));
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return null;

  const discount = getDiscountPercent(product.price, product.mrp);

  // ✅ Use large for main product image — best quality for detail view
  const mainImage = product.images?.[activeImg];
  const mainImageUrl = getImageUrl(mainImage?.large || mainImage?.url);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    const result = addReviewSchema.safeParse(reviewForm);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmittingReview(true);
    const res = await dispatch(
      addReview({ id: product._id, data: result.data }),
    );
    setSubmittingReview(false);

    if (!res.error) {
      toast.success("Review submitted!");
      setReviewForm({ rating: 5, comment: "" });
      dispatch(fetchProduct(slug));
    } else {
      toast.error(res.payload || "Failed to submit review");
    }
  };

  const tabs = ["description", "specifications", "reviews"];

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <FiChevronRight className="text-xs" />
        <Link
          to="/products"
          className="hover:text-primary-600 transition-colors"
        >
          Products
        </Link>
        <FiChevronRight className="text-xs" />
        {product.category && (
          <>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-primary-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <FiChevronRight className="text-xs" />
          </>
        )}
        <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div className="space-y-3">
          {/* ✅ Main image — uses large (800x800) for best quality */}
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            <img
              src={mainImageUrl}
              alt={mainImage?.alt || product.name}
              className="w-full h-full object-contain p-4"
            />
          </div>

          {/* ✅ Thumbnails strip — uses thumbnail (100x100) for fast load */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all
                    ${activeImg === i ? "border-primary-500" : "border-transparent hover:border-gray-300"}`}
                >
                  {/* ✅ thumbnail for strip — tiny, loads instantly */}
                  <img
                    src={getImageUrl(img.thumbnail || img.url)}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-start gap-2 mb-2">
            {product.isAyushApproved && (
              <span className="badge-green">AYUSH Approved</span>
            )}
            {product.labTested && (
              <span className="badge-hemp">Lab Tested</span>
            )}
            {product.isBestSeller && (
              <span className="badge-earth">Best Seller</span>
            )}
            {product.isNewArrival && (
              <span className="badge bg-blue-100 text-blue-700">
                New Arrival
              </span>
            )}
          </div>

          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          {product.numReviews > 0 && (
            <div className="mb-4">
              <StarRating
                rating={product.rating}
                reviews={product.numReviews}
                size="md"
              />
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="badge bg-red-100 text-red-700 text-sm">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {product.shortDescription}
            </p>
          )}

          {(product.cbdContent || product.thcContent) && (
            <div className="flex gap-3 mb-5">
              {product.cbdContent && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">CBD</p>
                  <p className="font-bold text-primary-700">
                    {product.cbdContent}
                  </p>
                </div>
              )}
              {product.thcContent && (
                <div className="bg-earth-50 border border-earth-100 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">THC</p>
                  <p className="font-bold text-earth-700">
                    {product.thcContent}
                  </p>
                </div>
              )}
              {product.volume && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-gray-400">Volume</p>
                  <p className="font-bold text-gray-700">{product.volume}</p>
                </div>
              )}
            </div>
          )}

          {product.requiresPrescription && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5">
              <FiAlertCircle className="text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">
                <strong>Prescription Required:</strong> This product requires a
                valid prescription from a licensed doctor.
              </p>
            </div>
          )}

          <div className="mb-5">
            {product.stock > 0 ? (
              <p className="text-sm text-primary-600 font-medium">
                ✓ In Stock{" "}
                {product.stock <= 10 && `(Only ${product.stock} left)`}
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium">✗ Out of Stock</p>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiMinus />
                </button>
                <span className="px-5 py-3 font-semibold text-gray-900 min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(product, qty)}
                className="btn-primary flex-1 py-3 text-base"
              >
                Add to Cart — {formatPrice(product.price * qty)}
              </button>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${isWishlisted ? "border-red-200 text-red-600 bg-red-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              <FiHeart className={isWishlisted ? "fill-current" : ""} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button
              onClick={() =>
                navigator.share?.({
                  title: product.name,
                  url: window.location.href,
                })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
            >
              <FiShare2 /> Share
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "🔬", label: "Certificate of Analysis" },
              { icon: "🚚", label: "Pan-India Delivery" },
              { icon: "🔒", label: "Secure Payments" },
              { icon: "↩️", label: "7-Day Returns" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600"
              >
                <span>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px
                ${activeTab === tab ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab}{" "}
              {tab === "reviews" &&
                product.numReviews > 0 &&
                `(${product.numReviews})`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl">
        {activeTab === "description" && (
          <div className="prose prose-green max-w-none">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
            {product.features?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-bold text-gray-900 text-xl mb-3">
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-600 text-sm"
                    >
                      <FiShield className="text-primary-500 shrink-0 mt-0.5" />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <div>
            {product.specifications?.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map(({ key, value }, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-700 w-2/5">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {user && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-gray-50 rounded-2xl p-5 space-y-4"
              >
                <h3 className="font-semibold text-gray-800">Write a Review</h3>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    Your Rating
                  </label>
                  <StarInput
                    value={reviewForm.rating}
                    onChange={(r) =>
                      setReviewForm((f) => ({ ...f, rating: r }))
                    }
                  />
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, comment: e.target.value }))
                  }
                  placeholder="Share your experience with this product…"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}

            {product.reviews?.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              product.reviews?.map((r) => (
                <div key={r._id} className="border-b border-gray-100 pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-bold text-sm">
                          {r.name?.[0]}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">
                        {r.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <StarRating rating={r.rating} size="sm" />
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
