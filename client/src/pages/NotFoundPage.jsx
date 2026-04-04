import { Link } from "react-router-dom";
import { GiLeafSkeleton } from "react-icons/gi";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <GiLeafSkeleton className="text-6xl text-primary-200 mb-6 animate-float" />
      <h1 className="font-display text-7xl font-bold text-gray-100 mb-2">
        404
      </h1>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
        Page Not Found
      </h2>
      <p className="text-gray-400 mb-8 max-w-sm">
        Looks like this page got lost in the hemp fields. Let's take you back.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary px-6 py-2.5">
          Go Home
        </Link>
        <Link to="/products" className="btn-secondary px-6 py-2.5">
          Shop Products
        </Link>
      </div>
    </div>
  );
}
