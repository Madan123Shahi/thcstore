import mongoose from "mongoose";
import slugify from "slugify";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

const CATEGORIES = [
  {
    name: "CBD Oils",
    description: "Full spectrum, broad spectrum and isolate CBD oils",
    sortOrder: 1,
  },
  {
    name: "THC Gummies",
    description: "Micro-dosed THC/CBD wellness gummies",
    sortOrder: 2,
  },
  {
    name: "Vijaya Extract",
    description: "AYUSH-approved Vijaya (cannabis) extracts",
    sortOrder: 3,
  },
  {
    name: "Hemp Wellness",
    description: "Hemp seeds, oils, proteins and nutrition",
    sortOrder: 4,
  },
  {
    name: "Tinctures",
    description: "CBD and herbal tinctures for daily use",
    sortOrder: 5,
  },
  {
    name: "Pet CBD",
    description: "CBD products specially formulated for pets",
    sortOrder: 6,
  },
  {
    name: "Capsules",
    description: "CBD and hemp capsules for easy dosing",
    sortOrder: 7,
  },
  {
    name: "Topicals",
    description: "CBD-infused balms, creams and skincare",
    sortOrder: 8,
  },
  {
    name: "Vapes Cartridges",
    description: "Vaporizer cartridges and pens for fast-acting relief",
    sortOrder: 9,
  },
  {
    name: "Wellness Bundles",
    description: "Curated multi-product bundles for new and returning customers",
    sortOrder: 10,
  },
];

// 5 products per category x 10 categories = 50 products.
// Keys here must match the slug each category resolves to (slugify(name, { lower: true })).
const PRODUCTS_BY_CATEGORY_SLUG = {
  "cbd-oils": [
    {
      name: "Broad Spectrum CBD Oil - 1500mg",
      brand: "Hemp Hub",
      shortDescription: "Premium broad spectrum CBD oil for daily wellness",
      description:
        "Our flagship Broad Spectrum CBD Oil is extracted from premium hemp plants using CO2 extraction. Contains 1500mg CBD per 30ml bottle with no THC. Perfect for sleep, anxiety, and chronic pain relief.",
      price: 2999,
      mrp: 3999,
      stock: 50,
      volume: "30ml",
      cbdContent: "1500mg",
      thcContent: "0%",
      images: [
        { url: "https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil", alt: "CBD Oil 1500mg" },
      ],
      features: ["CO2 extracted", "Lab tested COA", "THC free", "Vegan & organic"],
      specifications: [
        { key: "Volume", value: "30ml" },
        { key: "CBD Content", value: "1500mg" },
        { key: "Serving Size", value: "1ml (50mg CBD)" },
      ],
      tags: ["cbd", "oil", "sleep", "anxiety", "pain"],
      isFeatured: true,
      isBestSeller: true,
    },
    {
      name: "Full Spectrum CBD Oil - 1000mg",
      brand: "HempLeaf",
      shortDescription: "Full spectrum entourage effect for daily balance",
      description:
        "A full spectrum CBD oil that preserves the complete range of cannabinoids and terpenes for an enhanced entourage effect. Suspended in organic MCT oil for fast absorption.",
      price: 1899,
      mrp: 2299,
      stock: 60,
      volume: "30ml",
      cbdContent: "1000mg",
      thcContent: "<0.3%",
      images: [
        {
          url: "https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil",
          alt: "Full Spectrum CBD Oil 1000mg",
        },
      ],
      features: ["Full spectrum", "Organic MCT base", "Lab tested"],
      tags: ["cbd", "oil", "full-spectrum"],
      isNewArrival: true,
    },
    {
      name: "CBD Oil for Beginners - 250mg",
      brand: "PureCan",
      shortDescription: "Low-dose entry point for first-time CBD users",
      description:
        "Designed for those new to CBD, this gentle 250mg formula lets you find your ideal dose without overwhelming effects. Mild, neutral taste in a coconut MCT base.",
      price: 799,
      mrp: 999,
      stock: 80,
      volume: "15ml",
      cbdContent: "250mg",
      thcContent: "0%",
      images: [
        {
          url: "https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil",
          alt: "CBD Oil for Beginners",
        },
      ],
      features: ["Beginner friendly", "Neutral taste", "THC free"],
      tags: ["cbd", "oil", "beginner"],
    },
    {
      name: "High Potency CBD Oil - 2000mg",
      brand: "HempLeaf",
      shortDescription: "Maximum strength oil for experienced users",
      description:
        "Our strongest CBD oil formulation at 2000mg per bottle, intended for experienced users managing chronic discomfort or seeking pronounced wellness effects.",
      price: 2999,
      mrp: 3499,
      stock: 35,
      volume: "30ml",
      cbdContent: "2000mg",
      thcContent: "0%",
      images: [
        {
          url: "https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil",
          alt: "High Potency CBD Oil",
        },
      ],
      features: ["Maximum strength", "CO2 extracted", "Lab tested"],
      tags: ["cbd", "oil", "high-potency"],
      isBestSeller: true,
    },
    {
      name: "Organic CBD Oil with MCT - 750mg",
      brand: "GreenRoots",
      shortDescription: "Certified organic hemp in a clean MCT base",
      description:
        "Made from certified organic hemp and blended with organic MCT oil, this 750mg formula is free from pesticides, solvents, and artificial additives.",
      price: 1499,
      mrp: 1799,
      stock: 45,
      volume: "30ml",
      cbdContent: "750mg",
      thcContent: "0%",
      images: [
        { url: "https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil", alt: "Organic CBD Oil" },
      ],
      features: ["Certified organic", "Pesticide free", "Lab tested"],
      tags: ["cbd", "oil", "organic"],
    },
  ],

  "thc-gummies": [
    {
      name: "CBD + THC Wellness Gummies - 750mg",
      brand: "Hemp Hub",
      shortDescription: "30 gummies with 25mg CBD per piece",
      description:
        "Delicious mango-flavored wellness gummies infused with broad spectrum CBD. Each gummy contains exactly 25mg CBD for precise dosing. Perfect for on-the-go stress and anxiety management.",
      price: 1499,
      mrp: 1999,
      stock: 100,
      weight: "90g (30 gummies)",
      cbdContent: "750mg (25mg/gummy)",
      thcContent: "<0.3%",
      images: [
        { url: "https://placehold.co/400x400/bbf7d0/15803d?text=CBD+Gummies", alt: "CBD Gummies" },
      ],
      features: ["25mg CBD per gummy", "Natural mango flavor", "Vegan", "Lab tested"],
      tags: ["gummies", "cbd", "stress", "anxiety", "mango"],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      name: "Mixed Berry THC Gummies - 10pk",
      brand: "CloudNine",
      shortDescription: "Microdosed THC gummies in mixed berry flavor",
      description:
        "10 individually dosed gummies at 5mg THC each, blended with mixed berry flavor for a smooth, manageable experience.",
      price: 1099,
      mrp: 1299,
      stock: 70,
      weight: "10 gummies",
      thcContent: "5mg per piece",
      images: [
        {
          url: "https://placehold.co/400x400/bbf7d0/15803d?text=THC+Gummies",
          alt: "Mixed Berry THC Gummies",
        },
      ],
      features: ["5mg THC per piece", "Mixed berry flavor", "Lab tested"],
      tags: ["gummies", "thc", "berry"],
    },
    {
      name: "High Dose THC Gummies - 5pk",
      brand: "Elevate",
      shortDescription: "Stronger 10mg dose for experienced users",
      description:
        "A higher-strength option for users already familiar with THC edibles, with 10mg THC per gummy across a 5-piece pack.",
      price: 1399,
      mrp: 1599,
      stock: 40,
      weight: "5 gummies",
      thcContent: "10mg per piece",
      images: [
        {
          url: "https://placehold.co/400x400/bbf7d0/15803d?text=THC+Gummies",
          alt: "High Dose THC Gummies",
        },
      ],
      features: ["10mg THC per piece", "Lab tested"],
      tags: ["gummies", "thc", "high-dose"],
      requiresPrescription: true,
    },
    {
      name: "Sleep THC+CBN Gummies - 10pk",
      brand: "Elevate",
      shortDescription: "THC and CBN blend formulated for restful sleep",
      description:
        "Combining 5mg THC with 5mg CBN per gummy, this blend is designed to support a calm wind-down and deeper sleep.",
      price: 1499,
      mrp: 1799,
      stock: 55,
      weight: "10 gummies",
      thcContent: "5mg THC / 5mg CBN per piece",
      images: [
        {
          url: "https://placehold.co/400x400/bbf7d0/15803d?text=THC+Gummies",
          alt: "Sleep THC+CBN Gummies",
        },
      ],
      features: ["THC + CBN blend", "Supports sleep", "Lab tested"],
      tags: ["gummies", "thc", "cbn", "sleep"],
      isNewArrival: true,
    },
    {
      name: "Sour Citrus THC Gummies - 10pk",
      brand: "CloudNine",
      shortDescription: "Tangy citrus-flavored microdose gummies",
      description:
        "A tangy citrus take on our classic 5mg THC gummy line, 10 pieces per pack for easy, repeatable dosing.",
      price: 1199,
      mrp: 1399,
      stock: 65,
      weight: "10 gummies",
      thcContent: "5mg per piece",
      images: [
        {
          url: "https://placehold.co/400x400/bbf7d0/15803d?text=THC+Gummies",
          alt: "Sour Citrus THC Gummies",
        },
      ],
      features: ["5mg THC per piece", "Citrus flavor", "Lab tested"],
      tags: ["gummies", "thc", "citrus"],
    },
  ],

  "vijaya-extract": [
    {
      name: "Full Spectrum Vijaya Extract - 5000mg",
      brand: "Cannazo India",
      shortDescription: "AYUSH-approved Vijaya extract for chronic pain",
      description:
        "Cannazo India's Full Spectrum Vijaya Extract is an AYUSH-licensed Ayurvedic formulation derived from Cannabis Sativa leaves. Contains a balanced ratio of cannabinoids for maximum therapeutic benefit.",
      price: 4999,
      mrp: 6500,
      stock: 25,
      volume: "5ml",
      cbdContent: "4500mg",
      thcContent: "500mg",
      images: [
        {
          url: "https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Extract",
          alt: "Vijaya Extract",
        },
      ],
      features: [
        "AYUSH licensed",
        "Full spectrum",
        "Ayurvedic formulation",
        "Prescription required",
      ],
      tags: ["vijaya", "thc", "pain", "ayush", "full-spectrum"],
      isAyushApproved: true,
      requiresPrescription: true,
      isFeatured: true,
    },
    {
      name: "Vijaya Resin Extract - 5g",
      brand: "Ayush Herbals",
      shortDescription: "Traditional resin-form Vijaya extract",
      description:
        "A traditional resin preparation of Vijaya extract, AYUSH-approved and intended for use under medical guidance.",
      price: 1699,
      mrp: 1999,
      stock: 30,
      weight: "5g",
      images: [
        {
          url: "https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Extract",
          alt: "Vijaya Resin Extract",
        },
      ],
      features: ["AYUSH approved", "Traditional preparation"],
      tags: ["vijaya", "ayush", "resin"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
    {
      name: "Vijaya Tablets - 30ct",
      brand: "Ayush Herbals",
      shortDescription: "Convenient tablet form, 30 count",
      description:
        "AYUSH-approved Vijaya extract in tablet form for easy, consistent dosing, 30 tablets per bottle.",
      price: 999,
      mrp: 1199,
      stock: 50,
      weight: "30 tablets",
      images: [
        {
          url: "https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Tablets",
          alt: "Vijaya Tablets",
        },
      ],
      features: ["AYUSH approved", "Tablet form", "Consistent dosing"],
      tags: ["vijaya", "ayush", "tablets"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
    {
      name: "Vijaya Tincture - 30ml",
      brand: "Vedic Wellness",
      shortDescription: "Sublingual Vijaya tincture for faster onset",
      description:
        "A sublingual tincture formulation of Vijaya extract for faster absorption compared to tablets, AYUSH-licensed and lab tested.",
      price: 1299,
      mrp: 1599,
      stock: 40,
      volume: "30ml",
      images: [
        {
          url: "https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Tincture",
          alt: "Vijaya Tincture",
        },
      ],
      features: ["AYUSH approved", "Sublingual", "Fast acting"],
      tags: ["vijaya", "ayush", "tincture"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
    {
      name: "Vijaya Churna - 50g",
      brand: "Vedic Wellness",
      shortDescription: "Classic powdered Vijaya preparation",
      description:
        "A classical Ayurvedic churna (powder) preparation of Vijaya, intended for traditional use under medical supervision.",
      price: 599,
      mrp: 799,
      stock: 35,
      weight: "50g",
      images: [
        {
          url: "https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Churna",
          alt: "Vijaya Churna",
        },
      ],
      features: ["AYUSH approved", "Classical preparation"],
      tags: ["vijaya", "ayush", "churna"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
  ],

  "hemp-wellness": [
    {
      name: "Hemp Protein Powder - 500g",
      brand: "Indus Hemp",
      shortDescription: "Plant-based protein with omega 3 & 6",
      description:
        "Cold-pressed hemp seed protein powder with all 9 essential amino acids. Contains 50g protein per 100g, rich in Omega-3 and Omega-6 fatty acids. Ideal post-workout recovery supplement.",
      price: 999,
      mrp: 1299,
      stock: 75,
      weight: "500g",
      images: [
        {
          url: "https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Protein",
          alt: "Hemp Protein Powder",
        },
      ],
      features: [
        "50g protein/100g",
        "All 9 essential amino acids",
        "Rich in Omega 3&6",
        "No artificial flavors",
      ],
      tags: ["hemp", "protein", "fitness", "vegan", "nutrition"],
      isBestSeller: true,
    },
    {
      name: "Hemp Heart Seeds - 250g",
      brand: "Indus Hemp",
      shortDescription: "Shelled hemp seeds, nutrient-dense superfood",
      description:
        "Hulled hemp hearts ready to sprinkle on meals — a complete protein source rich in fiber and healthy fats.",
      price: 499,
      mrp: 599,
      stock: 90,
      weight: "250g",
      images: [
        {
          url: "https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Seeds",
          alt: "Hemp Heart Seeds",
        },
      ],
      features: ["Complete protein", "High in fiber", "Vegan"],
      tags: ["hemp", "seeds", "nutrition"],
    },
    {
      name: "Hemp Wellness Tea - 20 Bags",
      brand: "GreenRoots",
      shortDescription: "Calming hemp leaf herbal tea blend",
      description:
        "A soothing herbal tea blend made with hemp leaf and chamomile, caffeine-free and ideal for evening wind-down.",
      price: 399,
      mrp: 499,
      stock: 100,
      weight: "20 tea bags",
      images: [
        {
          url: "https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Tea",
          alt: "Hemp Wellness Tea",
        },
      ],
      features: ["Caffeine free", "Calming blend"],
      tags: ["hemp", "tea", "wellness"],
    },
    {
      name: "Hemp Multivitamin Gummies - 30ct",
      brand: "Indus Hemp",
      shortDescription: "Daily multivitamin gummies with hemp extract",
      description:
        "Daily multivitamin gummies fortified with hemp seed extract, supporting general wellness as part of a daily routine.",
      price: 899,
      mrp: 1099,
      stock: 60,
      weight: "30 gummies",
      images: [
        {
          url: "https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Gummies",
          alt: "Hemp Multivitamin Gummies",
        },
      ],
      features: ["Daily multivitamin", "Hemp seed extract"],
      tags: ["hemp", "gummies", "multivitamin"],
      isNewArrival: true,
    },
    {
      name: "Hemp Oil Soap Bar",
      brand: "PureCan",
      shortDescription: "Moisturizing hemp seed oil soap bar",
      description:
        "A gentle, moisturizing soap bar made with cold-pressed hemp seed oil, suitable for daily use on sensitive skin.",
      price: 299,
      mrp: 349,
      stock: 120,
      weight: "100g",
      images: [
        {
          url: "https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Soap",
          alt: "Hemp Oil Soap Bar",
        },
      ],
      features: ["Moisturizing", "Cold-pressed hemp oil"],
      tags: ["hemp", "soap", "skincare"],
    },
  ],

  tinctures: [
    {
      name: "Balance - CBD+Hemp Seed Oil Tincture",
      brand: "CannaBliss",
      shortDescription: "Daily balance tincture with CBD and Hemp Seed Oil",
      description:
        "CannaBliss Balance combines premium CBD extract with cold-pressed hemp seed oil for a powerful daily wellness tincture. The synergistic blend supports mood, sleep, and chronic pain management.",
      price: 1899,
      mrp: 2499,
      stock: 60,
      volume: "30ml",
      cbdContent: "1000mg",
      images: [
        { url: "https://placehold.co/400x400/ecfdf5/065f46?text=Tincture", alt: "CBD Tincture" },
      ],
      features: ["CBD + Hemp Seed Oil", "Sublingual delivery", "Fast acting", "Naturally flavored"],
      tags: ["tincture", "cbd", "hemp", "balance", "daily"],
      isFeatured: true,
      isNewArrival: true,
    },
    {
      name: "Calming Tincture - 30ml",
      brand: "PureCan",
      shortDescription: "Evening tincture for relaxation",
      description:
        "A calming blend designed for evening use, combining CBD with chamomile and lavender terpenes.",
      price: 1399,
      mrp: 1699,
      stock: 45,
      volume: "30ml",
      cbdContent: "600mg",
      images: [
        {
          url: "https://placehold.co/400x400/ecfdf5/065f46?text=Tincture",
          alt: "Calming Tincture",
        },
      ],
      features: ["Calming blend", "Sublingual"],
      tags: ["tincture", "cbd", "calm"],
    },
    {
      name: "Focus Tincture - 30ml",
      brand: "Elevate",
      shortDescription: "Daytime tincture for clarity and focus",
      description:
        "Formulated with energizing terpenes alongside CBD, this tincture is intended for daytime use to support mental clarity.",
      price: 1499,
      mrp: 1799,
      stock: 40,
      volume: "30ml",
      cbdContent: "600mg",
      images: [
        { url: "https://placehold.co/400x400/ecfdf5/065f46?text=Tincture", alt: "Focus Tincture" },
      ],
      features: ["Daytime formula", "Sublingual"],
      tags: ["tincture", "cbd", "focus"],
    },
    {
      name: "Night-Time Tincture - 30ml",
      brand: "PureCan",
      shortDescription: "Higher-strength tincture for sleep support",
      description:
        "An 800mg CBD tincture blended with CBN, formulated specifically to support a full night's rest.",
      price: 1599,
      mrp: 1899,
      stock: 38,
      volume: "30ml",
      cbdContent: "800mg",
      images: [
        {
          url: "https://placehold.co/400x400/ecfdf5/065f46?text=Tincture",
          alt: "Night-Time Tincture",
        },
      ],
      features: ["CBD + CBN", "Sleep support"],
      tags: ["tincture", "cbd", "sleep"],
      isBestSeller: true,
    },
    {
      name: "Unflavored Tincture - 30ml",
      brand: "HempLeaf",
      shortDescription: "No-flavor option for mixing into food or drink",
      description:
        "A neutral, unflavored CBD tincture ideal for those who prefer to mix it into food or beverages rather than take it sublingually.",
      price: 1299,
      mrp: 1499,
      stock: 50,
      volume: "30ml",
      cbdContent: "500mg",
      images: [
        {
          url: "https://placehold.co/400x400/ecfdf5/065f46?text=Tincture",
          alt: "Unflavored Tincture",
        },
      ],
      features: ["No flavor added", "Versatile use"],
      tags: ["tincture", "cbd", "unflavored"],
    },
  ],

  "pet-cbd": [
    {
      name: "CBD Oil for Pets - 900mg",
      brand: "Qurist",
      shortDescription: "100% THC-free CBD oil for medium dogs",
      description:
        "Specially formulated for medium-sized dogs (5-20kg). Helps with anxiety, joint pain, seizures and overall health. Contains 900mg pure CBD in MCT oil base. Vet-recommended dosing guide included.",
      price: 3499,
      mrp: 4200,
      stock: 30,
      volume: "30ml",
      cbdContent: "900mg",
      thcContent: "0% (THC-free)",
      images: [
        { url: "https://placehold.co/400x400/dbeafe/1e40af?text=Pet+CBD", alt: "Pet CBD Oil" },
      ],
      features: ["100% THC-free", "MCT oil base", "Vet recommended", "Lab tested"],
      tags: ["pet", "dog", "cbd", "anxiety", "joints"],
      isNewArrival: true,
    },
    {
      name: "CBD Oil for Cats - 450mg",
      brand: "Qurist",
      shortDescription: "Gentle, low-dose CBD oil formulated for cats",
      description:
        "A lower-strength CBD oil specifically dosed for cats, helping with stress and mobility in a THC-free MCT base.",
      price: 2999,
      mrp: 3599,
      stock: 25,
      volume: "15ml",
      cbdContent: "450mg",
      thcContent: "0%",
      images: [
        { url: "https://placehold.co/400x400/dbeafe/1e40af?text=Pet+CBD", alt: "CBD Oil for Cats" },
      ],
      features: ["THC-free", "Cat-specific dosing"],
      tags: ["pet", "cat", "cbd"],
    },
    {
      name: "CBD Dog Treats - 30ct",
      brand: "PetCalm",
      shortDescription: "Tasty CBD-infused treats for daily wellness",
      description:
        "Bacon-flavored dog treats infused with a mild dose of CBD, easy to incorporate into a daily routine.",
      price: 699,
      mrp: 849,
      stock: 55,
      weight: "30 treats",
      images: [
        {
          url: "https://placehold.co/400x400/dbeafe/1e40af?text=Dog+Treats",
          alt: "CBD Dog Treats",
        },
      ],
      features: ["Bacon flavor", "Daily wellness"],
      tags: ["pet", "dog", "treats"],
    },
    {
      name: "CBD Calming Spray for Pets",
      brand: "PetCalm",
      shortDescription: "Fast-acting spray for stressful situations",
      description:
        "A topical CBD spray designed for quick application before stressful situations like vet visits or car rides.",
      price: 599,
      mrp: 749,
      stock: 40,
      volume: "60ml",
      images: [
        {
          url: "https://placehold.co/400x400/dbeafe/1e40af?text=Pet+Spray",
          alt: "CBD Calming Spray",
        },
      ],
      features: ["Fast acting", "Easy application"],
      tags: ["pet", "spray", "calming"],
    },
    {
      name: "CBD Joint Care Chews for Dogs",
      brand: "PetCalm",
      shortDescription: "Joint support chews with CBD and glucosamine",
      description:
        "Chews combining CBD with glucosamine and chondroitin to support joint health in older or active dogs.",
      price: 999,
      mrp: 1199,
      stock: 35,
      weight: "30 chews",
      images: [
        {
          url: "https://placehold.co/400x400/dbeafe/1e40af?text=Joint+Chews",
          alt: "CBD Joint Care Chews",
        },
      ],
      features: ["Glucosamine + Chondroitin", "Joint support"],
      tags: ["pet", "dog", "joint-care"],
    },
  ],

  capsules: [
    {
      name: "Cannabis Leaf Extract Capsules - 250mg",
      brand: "MEDICANN",
      shortDescription: "30 capsules with 250mg extract each",
      description:
        "MEDICANN's premium Cannabis Leaf Extract capsules are AYUSH-approved Ayurvedic formulations. Each capsule contains 250mg Vijaya leaf extract for convenient dosing.",
      price: 2499,
      mrp: 3000,
      stock: 40,
      weight: "30 capsules",
      cbdContent: "Vijaya extract 250mg",
      images: [
        {
          url: "https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules",
          alt: "Cannabis Capsules",
        },
      ],
      features: ["AYUSH approved", "30 capsules per pack", "Easy to swallow", "Precise dosing"],
      tags: ["capsules", "vijaya", "ayush", "ayurvedic"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
    {
      name: "CBD Capsules - 25mg, 30ct",
      brand: "GreenRoots",
      shortDescription: "Standard-strength CBD softgel capsules",
      description:
        "Easy-to-swallow softgel capsules with 25mg CBD each, suspended in MCT oil for consistent absorption.",
      price: 1099,
      mrp: 1299,
      stock: 60,
      weight: "30 capsules",
      cbdContent: "25mg per capsule",
      images: [
        {
          url: "https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules",
          alt: "CBD Capsules 25mg",
        },
      ],
      features: ["MCT oil base", "Consistent dosing"],
      tags: ["capsules", "cbd"],
    },
    {
      name: "CBD Capsules - 10mg, 60ct",
      brand: "PureCan",
      shortDescription: "Lower-dose capsules for daily maintenance",
      description:
        "A gentler 10mg dose per capsule, with 60 capsules per bottle, suited to ongoing daily use.",
      price: 1199,
      mrp: 1399,
      stock: 55,
      weight: "60 capsules",
      cbdContent: "10mg per capsule",
      images: [
        {
          url: "https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules",
          alt: "CBD Capsules 10mg",
        },
      ],
      features: ["Low dose", "60 count"],
      tags: ["capsules", "cbd"],
    },
    {
      name: "CBN Sleep Capsules - 30ct",
      brand: "Elevate",
      shortDescription: "CBN-forward capsules formulated for sleep",
      description:
        "Capsules formulated primarily around CBN, a cannabinoid associated with sedative effects, intended for nighttime use.",
      price: 1399,
      mrp: 1599,
      stock: 30,
      weight: "30 capsules",
      images: [
        {
          url: "https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules",
          alt: "CBN Sleep Capsules",
        },
      ],
      features: ["CBN forward", "Nighttime use"],
      tags: ["capsules", "cbn", "sleep"],
      isNewArrival: true,
    },
    {
      name: "Hemp Extract Capsules - 50mg, 30ct",
      brand: "Indus Hemp",
      shortDescription: "High-strength hemp extract capsules",
      description:
        "Higher-strength 50mg hemp extract capsules for users seeking a stronger daily dose in convenient capsule form.",
      price: 1499,
      mrp: 1799,
      stock: 35,
      weight: "30 capsules",
      cbdContent: "50mg per capsule",
      images: [
        {
          url: "https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules",
          alt: "Hemp Extract Capsules",
        },
      ],
      features: ["High strength", "30 count"],
      tags: ["capsules", "hemp"],
    },
  ],

  topicals: [
    {
      name: "CBD Broad Spectrum Cream - 5000mg",
      brand: "Hemp Hub",
      shortDescription: "Deep relief cream for muscle and joint pain",
      description:
        "High-potency CBD cream with 5000mg broad spectrum extract. Enhanced with menthol and arnica for targeted relief. Ideal for arthritis, sports injuries, and muscle soreness.",
      price: 2299,
      mrp: 2999,
      stock: 45,
      weight: "60g",
      cbdContent: "5000mg",
      thcContent: "0%",
      images: [
        { url: "https://placehold.co/400x400/fce7f3/9d174d?text=CBD+Cream", alt: "CBD Cream" },
      ],
      features: ["5000mg CBD", "With menthol & arnica", "Fast absorbing", "Non-greasy"],
      tags: ["topical", "cream", "pain", "muscle", "joint"],
      isBestSeller: true,
    },
    {
      name: "CBD Pain Relief Balm - 50g",
      brand: "PureCan",
      shortDescription: "Targeted balm for localized pain relief",
      description:
        "A thicker balm formulation for targeted application on sore joints and muscles, infused with 500mg CBD.",
      price: 799,
      mrp: 999,
      stock: 50,
      weight: "50g",
      cbdContent: "500mg",
      images: [
        {
          url: "https://placehold.co/400x400/fce7f3/9d174d?text=CBD+Balm",
          alt: "CBD Pain Relief Balm",
        },
      ],
      features: ["Targeted relief", "500mg CBD"],
      tags: ["topical", "balm", "pain"],
    },
    {
      name: "CBD Muscle Roll-On - 75ml",
      brand: "GreenRoots",
      shortDescription: "Convenient roll-on for on-the-go relief",
      description:
        "A roll-on applicator format for quick, mess-free application of CBD directly to sore areas.",
      price: 699,
      mrp: 849,
      stock: 60,
      volume: "75ml",
      cbdContent: "300mg",
      images: [
        {
          url: "https://placehold.co/400x400/fce7f3/9d174d?text=Roll-On",
          alt: "CBD Muscle Roll-On",
        },
      ],
      features: ["Roll-on applicator", "Mess-free"],
      tags: ["topical", "roll-on"],
    },
    {
      name: "CBD Moisturizing Cream - 100g",
      brand: "HempLeaf",
      shortDescription: "Daily moisturizer infused with CBD",
      description:
        "A daily-use facial and body moisturizer infused with 400mg CBD for hydration alongside wellness benefits.",
      price: 899,
      mrp: 1099,
      stock: 55,
      weight: "100g",
      cbdContent: "400mg",
      images: [
        {
          url: "https://placehold.co/400x400/fce7f3/9d174d?text=Moisturizer",
          alt: "CBD Moisturizing Cream",
        },
      ],
      features: ["Daily moisturizer", "400mg CBD"],
      tags: ["topical", "skincare", "moisturizer"],
    },
    {
      name: "CBD Lip Balm",
      brand: "GreenRoots",
      shortDescription: "Nourishing lip balm with a touch of CBD",
      description:
        "A small-format lip balm with 20mg CBD, beeswax, and shea butter for daily lip care.",
      price: 249,
      mrp: 299,
      stock: 100,
      weight: "4.5g",
      cbdContent: "20mg",
      images: [
        { url: "https://placehold.co/400x400/fce7f3/9d174d?text=Lip+Balm", alt: "CBD Lip Balm" },
      ],
      features: ["Beeswax & shea butter", "20mg CBD"],
      tags: ["topical", "lip-balm"],
    },
  ],

  "vapes-cartridges": [
    {
      name: "OG Kush Vape Cartridge - 1g",
      brand: "CloudNine",
      shortDescription: "Classic OG Kush strain cartridge",
      description:
        "A 1g 510-thread cartridge with an OG Kush-derived terpene profile, lab tested for purity and potency.",
      price: 1799,
      mrp: 2099,
      stock: 30,
      weight: "1g",
      thcContent: "85%",
      images: [
        {
          url: "https://placehold.co/400x400/e0f2fe/075985?text=Vape+Cartridge",
          alt: "OG Kush Vape Cartridge",
        },
      ],
      features: ["510-thread compatible", "Lab tested"],
      tags: ["vape", "cartridge", "thc"],
      requiresPrescription: true,
    },
    {
      name: "Blue Dream Vape Cartridge - 1g",
      brand: "CloudNine",
      shortDescription: "Fruity, uplifting Blue Dream profile",
      description:
        "A 1g cartridge featuring a Blue Dream-derived terpene profile known for its fruity aroma.",
      price: 1799,
      mrp: 2099,
      stock: 28,
      weight: "1g",
      thcContent: "82%",
      images: [
        {
          url: "https://placehold.co/400x400/e0f2fe/075985?text=Vape+Cartridge",
          alt: "Blue Dream Vape Cartridge",
        },
      ],
      features: ["510-thread compatible", "Lab tested"],
      tags: ["vape", "cartridge", "thc"],
      requiresPrescription: true,
    },
    {
      name: "CBD Vape Pen Disposable",
      brand: "Elevate",
      shortDescription: "THC-free disposable CBD vape pen",
      description:
        "A disposable, draw-activated vape pen filled with 300mg CBD distillate, no THC included.",
      price: 1299,
      mrp: 1499,
      stock: 45,
      cbdContent: "300mg",
      thcContent: "0%",
      images: [
        { url: "https://placehold.co/400x400/e0f2fe/075985?text=Vape+Pen", alt: "CBD Vape Pen" },
      ],
      features: ["Disposable", "THC-free", "Draw activated"],
      tags: ["vape", "cbd", "disposable"],
    },
    {
      name: "Mixed Fruit Vape Cartridge - 0.5g",
      brand: "CloudNine",
      shortDescription: "Smaller-format cartridge with fruit blend terpenes",
      description:
        "A 0.5g cartridge with a mixed fruit terpene blend, suited to those wanting a smaller initial purchase.",
      price: 1099,
      mrp: 1299,
      stock: 32,
      weight: "0.5g",
      thcContent: "80%",
      images: [
        {
          url: "https://placehold.co/400x400/e0f2fe/075985?text=Vape+Cartridge",
          alt: "Mixed Fruit Vape Cartridge",
        },
      ],
      features: ["510-thread compatible", "Lab tested"],
      tags: ["vape", "cartridge", "thc"],
      requiresPrescription: true,
    },
    {
      name: "Relax Blend Vape Pen",
      brand: "Elevate",
      shortDescription: "CBD and terpene blend for relaxation",
      description:
        "A rechargeable vape pen pre-filled with a relaxation-focused CBD and terpene blend.",
      price: 1499,
      mrp: 1749,
      stock: 25,
      cbdContent: "350mg",
      images: [
        {
          url: "https://placehold.co/400x400/e0f2fe/075985?text=Vape+Pen",
          alt: "Relax Blend Vape Pen",
        },
      ],
      features: ["Rechargeable", "Relaxation blend"],
      tags: ["vape", "cbd", "relax"],
      isNewArrival: true,
    },
  ],

  "wellness-bundles": [
    {
      name: "Starter Wellness Bundle",
      brand: "GreenRoots",
      shortDescription: "Everything a first-time customer needs to get started",
      description:
        "A curated bundle combining a beginner CBD oil, capsules, and a topical balm — ideal for first-time customers exploring different formats.",
      price: 2499,
      mrp: 3199,
      stock: 30,
      images: [
        {
          url: "https://placehold.co/400x400/fef9c3/854d0e?text=Bundle",
          alt: "Starter Wellness Bundle",
        },
      ],
      features: ["3-product bundle", "Beginner friendly"],
      tags: ["bundle", "starter"],
      isFeatured: true,
    },
    {
      name: "Sleep & Relax Bundle",
      brand: "Elevate",
      shortDescription: "Night-time tincture, CBN capsules, and calming tea",
      description:
        "A bundle focused on rest and relaxation, combining our night-time tincture, CBN sleep capsules, and hemp wellness tea.",
      price: 2999,
      mrp: 3699,
      stock: 25,
      images: [
        {
          url: "https://placehold.co/400x400/fef9c3/854d0e?text=Bundle",
          alt: "Sleep & Relax Bundle",
        },
      ],
      features: ["3-product bundle", "Sleep focused"],
      tags: ["bundle", "sleep"],
    },
    {
      name: "Pet Care Bundle",
      brand: "PetCalm",
      shortDescription: "CBD oil, treats, and joint chews for your pet",
      description:
        "A complete pet wellness bundle including CBD oil for dogs, joint care chews, and calming treats.",
      price: 1799,
      mrp: 2199,
      stock: 20,
      images: [
        { url: "https://placehold.co/400x400/fef9c3/854d0e?text=Bundle", alt: "Pet Care Bundle" },
      ],
      features: ["3-product bundle", "Pet focused"],
      tags: ["bundle", "pet"],
    },
    {
      name: "Daily Essentials Bundle",
      brand: "PureCan",
      shortDescription: "CBD oil, capsules, and lip balm for everyday use",
      description:
        "An everyday bundle combining our most popular daily-use products across oils, capsules, and topicals.",
      price: 2199,
      mrp: 2799,
      stock: 28,
      images: [
        {
          url: "https://placehold.co/400x400/fef9c3/854d0e?text=Bundle",
          alt: "Daily Essentials Bundle",
        },
      ],
      features: ["3-product bundle", "Everyday use"],
      tags: ["bundle", "daily"],
    },
    {
      name: "Ayush Wellness Bundle",
      brand: "Ayush Herbals",
      shortDescription: "AYUSH-approved Vijaya products bundled together",
      description:
        "A bundle of AYUSH-approved Vijaya extract products including resin extract, tablets, and tincture for traditional Ayurvedic use.",
      price: 2799,
      mrp: 3399,
      stock: 15,
      images: [
        {
          url: "https://placehold.co/400x400/fef9c3/854d0e?text=Bundle",
          alt: "Ayush Wellness Bundle",
        },
      ],
      features: ["3-product bundle", "AYUSH approved"],
      tags: ["bundle", "ayush", "vijaya"],
      isAyushApproved: true,
      requiresPrescription: true,
    },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data");

    // ── Seed admin user ──────────────────────────────────────
    const admin = await User.create({
      name: "THC Store Admin",
      email: "admin@thcstore.in",
      password: "Admin@123",
      role: "admin",
      isVerified: true,
    });
    console.log("Admin Created:", admin.email);

    // ── Seed categories ──────────────────────────────────────
    // Using .create() in a loop (not insertMany) so the Category
    // model's pre("save") hook still runs for any docs missing a slug.
    const categoryDocs = {};
    for (const cat of CATEGORIES) {
      const slug = slugify(cat.name, { lower: true });
      const doc = await Category.create({ ...cat, slug });
      categoryDocs[doc.slug] = doc;
    }
    console.log(`✅ ${Object.keys(categoryDocs).length} categories seeded`);

    // ── Seed products ────────────────────────────────────────
    // Using .create() in a loop (not insertMany) so the Product
    // model's pre("save") hook runs — this generates `sku` automatically
    // and computes `discount` from price/mrp.
    let productCount = 0;
    for (const [categorySlug, products] of Object.entries(PRODUCTS_BY_CATEGORY_SLUG)) {
      const categoryDoc = categoryDocs[categorySlug];
      if (!categoryDoc) {
        console.warn(`⚠ No category matched slug "${categorySlug}", skipping its products.`);
        continue;
      }

      for (const p of products) {
        await Product.create({
          ...p,
          category: categoryDoc._id,
          slug: slugify(p.name, { lower: true }),
          labTested: true,
          isActive: true,
        });
        productCount++;
      }
    }
    console.log(`✅ ${productCount} products seeded`);

    console.log("\n🎉 Seed complete!\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
