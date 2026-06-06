import { Helmet } from "react-helmet-async";

// ─────────────────────────────────────────────
// ✅ SEO component — add to any page for meta tags
// Works with react-helmet-async + CDN prerender
// ─────────────────────────────────────────────
export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
}) {
  const siteName = "THC Store";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDesc =
    description ||
    "Premium CBD and THC wellness products. Lab tested, AYUSH approved.";
  const metaImage = image || "/og-image.jpg"; // ✅ put a default OG image in /public
  const metaUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* ── Basic ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph (Facebook, WhatsApp, LinkedIn) ── */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* ── Canonical URL ── */}
      {metaUrl && <link rel="canonical" href={metaUrl} />}
    </Helmet>
  );
}
