import { Link } from "react-router-dom";
import { GiLeafSkeleton } from "react-icons/gi";
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const LINKS = {
  shop: [
    { label: "CBD Oils", to: "/products?category=cbd-oils" },
    { label: "THC Gummies", to: "/products?category=thc-gummies" },
    { label: "Vijaya Extract", to: "/products?category=vijaya-extract" },
    { label: "Hemp Wellness", to: "/products?category=hemp-wellness" },
    { label: "Pet CBD", to: "/products?category=pet-cbd" },
  ],
  company: [
    { label: "About Us", to: "/about" },
    { label: "Blog", to: "/blog" },
    { label: "Careers", to: "/careers" },
    { label: "Contact", to: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Refund Policy", to: "/refund" },
    { label: "Prescription Guide", to: "/prescription" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      {/* Disclaimer bar */}
      <div className="bg-earth-800 text-earth-100 text-xs text-center py-2 px-4">
        ⚠️ Products containing THC/CBD require a valid prescription. Must be 18+
        to purchase. For adult use only.
      </div>

      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <GiLeafSkeleton className="text-white text-xl" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-xl">
                  THC Store
                </span>
                <p className="text-xs text-gray-500 tracking-widest uppercase">
                  India
                </p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
              India's #1 hemp &amp; CBD wellness marketplace. Lab-tested,
              AYUSH-approved products from 30+ trusted brands, delivered
              pan-India.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:support@thcstore.in"
                className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiMail className="shrink-0" /> support@thcstore.in
              </a>
              <a
                href="tel:+919999999999"
                className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FiPhone className="shrink-0" /> +91 99999 99999
              </a>
              <span className="flex items-center gap-2 text-gray-400">
                <FiMapPin className="shrink-0" /> Mumbai, Maharashtra, India
              </span>
            </div>
          </div>

          {/* Links */}
          {[
            ["Shop", LINKS.shop],
            ["Company", LINKS.company],
            ["Legal", LINKS.legal],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {[
              "AYUSH Approved",
              "Lab Tested",
              "Secure Payments",
              "Pan-India Delivery",
            ].map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full"
              >
                <span className="text-primary-500">✓</span> {b}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} THC Store India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
