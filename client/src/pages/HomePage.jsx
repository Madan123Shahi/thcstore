import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiShield,
  FiTruck,
  FiAward,
  FiRefreshCw,
} from "react-icons/fi";
import { GiLeafSkeleton, GiMedicinePills, GiDroplets } from "react-icons/gi";
import { fetchFeatured, fetchBestSellers } from "../store/slices/productSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import ProductCard from "../components/product/ProductCard";
import { LoadingGrid } from "../components/common";

const HERO_STATS = [
  { value: "30+", label: "Trusted Brands" },
  { value: "500+", label: "Products" },
  { value: "50K+", label: "Happy Customers" },
  { value: "100%", label: "Lab Tested" },
];

const FEATURES = [
  {
    icon: FiShield,
    title: "AYUSH Approved",
    desc: "All THC/Vijaya products are Ayush licensed",
  },
  {
    icon: FiAward,
    title: "Lab Tested",
    desc: "Certificate of Analysis for every product",
  },
  {
    icon: FiTruck,
    title: "Pan-India Delivery",
    desc: "Free shipping on orders above ₹999",
  },
  {
    icon: FiRefreshCw,
    title: "Easy Returns",
    desc: "7-day return policy on eligible products",
  },
];

const CATEGORIES = [
  {
    name: "CBD Oils",
    slug: "cbd-oils",
    icon: GiDroplets,
    color: "from-green-500 to-emerald-600",
    desc: "Full & broad spectrum oils",
  },
  {
    name: "THC Gummies",
    slug: "thc-gummies",
    icon: GiMedicinePills,
    color: "from-purple-500 to-violet-600",
    desc: "Micro-dosed wellness gummies",
  },
  {
    name: "Vijaya Extract",
    slug: "vijaya-extract",
    icon: GiLeafSkeleton,
    color: "from-teal-500 to-cyan-600",
    desc: "AYUSH-approved extracts",
  },
  {
    name: "Hemp Wellness",
    slug: "hemp-wellness",
    icon: GiLeafSkeleton,
    color: "from-earth-500 to-amber-600",
    desc: "Seeds, oils & nutrition",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Mumbai",
    text: "The CBD oil completely transformed my sleep. I feel rested for the first time in years!",
    rating: 5,
  },
  {
    name: "Rahul K.",
    city: "Bangalore",
    text: "Outstanding product quality and fast delivery. Their customer support guided me through prescription requirements.",
    rating: 5,
  },
  {
    name: "Anita M.",
    city: "Delhi",
    text: "The Vijaya extract has helped my chronic pain immensely. Highly recommend THC Store!",
    rating: 5,
  },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { featured, bestSellers, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white text-4xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            >
              🌿
            </div>
          ))}
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-primary-800/60 text-primary-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-primary-700">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />{" "}
              India's #1 Hemp & CBD Wellness Store
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Natural Wellness,
              <br />
              <span className="text-primary-300">Scientifically Backed</span>
            </h1>
            <p className="text-primary-100 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              Shop premium THC gummies, CBD oils, Vijaya extracts and hemp
              wellness products. Lab-tested, AYUSH-approved and delivered
              pan-India.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary-400 hover:bg-primary-300 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-green-glow active:scale-95"
              >
                Shop Now <FiArrowRight />
              </Link>
              <Link
                to="/products?category=vijaya-extract"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl border border-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                Vijaya Extract
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14">
              {HERO_STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                >
                  <p className="font-display text-2xl font-bold text-primary-300">
                    {value}
                  </p>
                  <p className="text-xs text-primary-200 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-card"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 page-container">
        <div className="text-center mb-10">
          <h2 className="section-heading">Shop by Category</h2>
          <p className="text-gray-400 mt-2">
            Find products tailored to your wellness needs
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(({ name, slug, icon: Icon, color, desc }) => (
            <Link
              key={slug}
              to={`/products?category=${slug}`}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br text-white cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90`}
              />
              <div className="relative z-10">
                <Icon className="text-4xl mb-3 opacity-80" />
                <h3 className="font-display font-bold text-lg">{name}</h3>
                <p className="text-xs opacity-80 mt-1">{desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold">
                  Shop Now{" "}
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 bg-hemp-gradient">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="text-gray-400 mt-1">
                Hand-picked by our wellness experts
              </p>
            </div>
            <Link
              to="/products?isFeatured=true"
              className="btn-secondary text-sm px-4 py-2"
            >
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <LoadingGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Prescription Banner ── */}
      <section className="py-12 bg-white page-container">
        <div className="bg-gradient-to-r from-earth-700 to-earth-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="max-w-lg">
            <span className="badge bg-earth-400/30 text-earth-100 mb-3">
              Prescription Required
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Need a Prescription?
            </h2>
            <p className="text-earth-200 text-sm leading-relaxed">
              All orally consumable THC/Vijaya products require a valid
              prescription. Our partnered doctors provide virtual consultations
              to issue legal prescriptions pan-India.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              to="/products?requiresPrescription=true"
              className="bg-white text-earth-800 font-bold px-6 py-3 rounded-xl hover:bg-earth-50 transition-colors text-center text-sm whitespace-nowrap"
            >
              View Prescription Products
            </Link>
            <a
              href="tel:+919999999999"
              className="border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-center text-sm"
            >
              Consult a Doctor
            </a>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      {bestSellers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="page-container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-heading">Best Sellers</h2>
                <p className="text-gray-400 mt-1">
                  Most loved by our community
                </p>
              </div>
              <Link
                to="/products?isBestSeller=true"
                className="btn-secondary text-sm px-4 py-2"
              >
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      <section className="py-16 page-container">
        <div className="text-center mb-10">
          <h2 className="section-heading">What Our Customers Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, city, text, rating }) => (
            <div key={name} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                "{text}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">
                    {name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{name}</p>
                  <p className="text-xs text-gray-400">{city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 bg-primary-950 text-white">
        <div className="page-container text-center max-w-xl mx-auto">
          <GiLeafSkeleton className="text-4xl text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-3">
            Stay in the Loop
          </h2>
          <p className="text-primary-200 mb-6 text-sm">
            Get updates on new products, exclusive deals, and wellness guides.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-3 max-w-sm mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field flex-1 bg-primary-900 border-primary-700 text-white placeholder-primary-400 focus:ring-primary-400"
            />
            <button
              type="submit"
              className="btn-primary px-5 shrink-0 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-primary-400 mt-3">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
