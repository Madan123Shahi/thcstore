const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const CATEGORIES = [
  { name: 'CBD Oils', slug: 'cbd-oils', description: 'Full spectrum, broad spectrum and isolate CBD oils', sortOrder: 1 },
  { name: 'THC Gummies', slug: 'thc-gummies', description: 'Micro-dosed THC/CBD wellness gummies', sortOrder: 2 },
  { name: 'Vijaya Extract', slug: 'vijaya-extract', description: 'AYUSH-approved Vijaya (cannabis) extracts', sortOrder: 3 },
  { name: 'Hemp Wellness', slug: 'hemp-wellness', description: 'Hemp seeds, oils, proteins and nutrition', sortOrder: 4 },
  { name: 'Tinctures', slug: 'tinctures', description: 'CBD and herbal tinctures for daily use', sortOrder: 5 },
  { name: 'Pet CBD', slug: 'pet-cbd', description: 'CBD products specially formulated for pets', sortOrder: 6 },
  { name: 'Capsules', slug: 'capsules', description: 'CBD and hemp capsules for easy dosing', sortOrder: 7 },
  { name: 'Topicals', slug: 'topicals', description: 'CBD-infused balms, creams and skincare', sortOrder: 8 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Seed admin user
    const admin = await User.create({
      name: 'THC Store Admin',
      email: 'admin@thcstore.in',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@thcstore.in',
      password: 'Test@123',
      role: 'user',
      isVerified: true,
    });
    console.log('✅ Users seeded');

    // Seed categories
    const cats = await Category.insertMany(CATEGORIES);
    const catMap = Object.fromEntries(cats.map(c => [c.slug, c._id]));
    console.log('✅ Categories seeded');

    // Seed sample products
    const PRODUCTS = [
      {
        name: 'Broad Spectrum CBD Oil - 1500mg',
        brand: 'Hemp Hub',
        category: catMap['cbd-oils'],
        shortDescription: 'Premium broad spectrum CBD oil for daily wellness',
        description: 'Our flagship Broad Spectrum CBD Oil is extracted from premium hemp plants using CO2 extraction. Contains 1500mg CBD per 30ml bottle with no THC. Perfect for sleep, anxiety, and chronic pain relief.',
        price: 2999,
        mrp: 3999,
        stock: 50,
        sku: 'CBD-OIL-1500',
        volume: '30ml',
        cbdContent: '1500mg',
        thcContent: '0%',
        images: [{ url: 'https://placehold.co/400x400/dcfce7/166534?text=CBD+Oil', alt: 'CBD Oil 1500mg' }],
        features: ['CO2 extracted', 'Lab tested COA', 'THC free', 'Vegan & organic'],
        specifications: [{ key: 'Volume', value: '30ml' }, { key: 'CBD Content', value: '1500mg' }, { key: 'Serving Size', value: '1ml (50mg CBD)' }],
        tags: ['cbd', 'oil', 'sleep', 'anxiety', 'pain'],
        labTested: true,
        isAyushApproved: false,
        requiresPrescription: false,
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
      },
      {
        name: 'Full Spectrum Vijaya Extract - 5000mg',
        brand: 'Cannazo India',
        category: catMap['vijaya-extract'],
        shortDescription: 'AYUSH-approved Vijaya extract for chronic pain',
        description: 'Cannazo India\'s Full Spectrum Vijaya Extract is an AYUSH-licensed Ayurvedic formulation derived from Cannabis Sativa leaves. Contains a balanced ratio of cannabinoids for maximum therapeutic benefit.',
        price: 4999,
        mrp: 6500,
        stock: 25,
        sku: 'VIJ-EXT-5000',
        volume: '5ml',
        cbdContent: '4500mg',
        thcContent: '500mg',
        images: [{ url: 'https://placehold.co/400x400/fef3c7/92400e?text=Vijaya+Extract', alt: 'Vijaya Extract' }],
        features: ['AYUSH licensed', 'Full spectrum', 'Ayurvedic formulation', 'Prescription required'],
        tags: ['vijaya', 'thc', 'pain', 'ayush', 'full-spectrum'],
        labTested: true,
        isAyushApproved: true,
        requiresPrescription: true,
        isFeatured: true,
        isBestSeller: false,
        isActive: true,
      },
      {
        name: 'CBD + THC Wellness Gummies - 750mg',
        brand: 'Hemp Hub',
        category: catMap['thc-gummies'],
        shortDescription: '30 gummies with 25mg CBD per piece',
        description: 'Delicious mango-flavored wellness gummies infused with broad spectrum CBD. Each gummy contains exactly 25mg CBD for precise dosing. Perfect for on-the-go stress and anxiety management.',
        price: 1499,
        mrp: 1999,
        stock: 100,
        sku: 'GUM-CBD-750',
        weight: '90g (30 gummies)',
        cbdContent: '750mg (25mg/gummy)',
        thcContent: '<0.3%',
        images: [{ url: 'https://placehold.co/400x400/bbf7d0/15803d?text=CBD+Gummies', alt: 'CBD Gummies' }],
        features: ['25mg CBD per gummy', 'Natural mango flavor', 'Vegan', 'Lab tested'],
        tags: ['gummies', 'cbd', 'stress', 'anxiety', 'mango'],
        labTested: true,
        isAyushApproved: false,
        requiresPrescription: false,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isActive: true,
      },
      {
        name: 'Hemp Protein Powder - 500g',
        brand: 'Indus Hemp',
        category: catMap['hemp-wellness'],
        shortDescription: 'Plant-based protein with omega 3 & 6',
        description: 'Cold-pressed hemp seed protein powder with all 9 essential amino acids. Contains 50g protein per 100g, rich in Omega-3 and Omega-6 fatty acids. Ideal post-workout recovery supplement.',
        price: 999,
        mrp: 1299,
        stock: 75,
        sku: 'HMP-PROT-500',
        weight: '500g',
        images: [{ url: 'https://placehold.co/400x400/f2f2e0/5f5f2d?text=Hemp+Protein', alt: 'Hemp Protein Powder' }],
        features: ['50g protein/100g', 'All 9 essential amino acids', 'Rich in Omega 3&6', 'No artificial flavors'],
        tags: ['hemp', 'protein', 'fitness', 'vegan', 'nutrition'],
        labTested: true,
        isAyushApproved: false,
        requiresPrescription: false,
        isFeatured: false,
        isBestSeller: true,
        isActive: true,
      },
      {
        name: 'CBD Oil for Pets - 900mg',
        brand: 'Qurist',
        category: catMap['pet-cbd'],
        shortDescription: '100% THC-free CBD oil for medium dogs',
        description: 'Specially formulated for medium-sized dogs (5-20kg). Helps with anxiety, joint pain, seizures and overall health. Contains 900mg pure CBD in MCT oil base. Vet-recommended dosing guide included.',
        price: 3499,
        mrp: 4200,
        stock: 30,
        sku: 'PET-CBD-900',
        volume: '30ml',
        cbdContent: '900mg',
        thcContent: '0% (THC-free)',
        images: [{ url: 'https://placehold.co/400x400/dbeafe/1e40af?text=Pet+CBD', alt: 'Pet CBD Oil' }],
        features: ['100% THC-free', 'MCT oil base', 'Vet recommended', 'Lab tested'],
        tags: ['pet', 'dog', 'cbd', 'anxiety', 'joints'],
        labTested: true,
        isAyushApproved: false,
        requiresPrescription: false,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
      },
      {
        name: 'Cannabis Leaf Extract Capsules - 250mg',
        brand: 'MEDICANN',
        category: catMap['capsules'],
        shortDescription: '30 capsules with 250mg extract each',
        description: 'MEDICANN\'s premium Cannabis Leaf Extract capsules are AYUSH-approved Ayurvedic formulations. Each capsule contains 250mg Vijaya leaf extract for convenient dosing.',
        price: 2499,
        mrp: 3000,
        stock: 40,
        sku: 'CAP-VIJ-250',
        weight: '30 capsules',
        cbdContent: 'Vijaya extract 250mg',
        images: [{ url: 'https://placehold.co/400x400/ede9fe/5b21b6?text=Capsules', alt: 'Cannabis Capsules' }],
        features: ['AYUSH approved', '30 capsules per pack', 'Easy to swallow', 'Precise dosing'],
        tags: ['capsules', 'vijaya', 'ayush', 'ayurvedic'],
        labTested: true,
        isAyushApproved: true,
        requiresPrescription: true,
        isFeatured: false,
        isBestSeller: false,
        isActive: true,
      },
      {
        name: 'CBD Broad Spectrum Cream - 5000mg',
        brand: 'Hemp Hub',
        category: catMap['topicals'],
        shortDescription: 'Deep relief cream for muscle and joint pain',
        description: 'High-potency CBD cream with 5000mg broad spectrum extract. Enhanced with menthol and arnica for targeted relief. Ideal for arthritis, sports injuries, and muscle soreness.',
        price: 2299,
        mrp: 2999,
        stock: 45,
        sku: 'TOP-CBD-CREAM',
        weight: '60g',
        cbdContent: '5000mg',
        thcContent: '0%',
        images: [{ url: 'https://placehold.co/400x400/fce7f3/9d174d?text=CBD+Cream', alt: 'CBD Cream' }],
        features: ['5000mg CBD', 'With menthol & arnica', 'Fast absorbing', 'Non-greasy'],
        tags: ['topical', 'cream', 'pain', 'muscle', 'joint'],
        labTested: true,
        requiresPrescription: false,
        isFeatured: false,
        isBestSeller: true,
        isActive: true,
      },
      {
        name: 'Balance - CBD+Hemp Seed Oil Tincture',
        brand: 'CannaBliss',
        category: catMap['tinctures'],
        shortDescription: 'Daily balance tincture with CBD and Hemp Seed Oil',
        description: 'CannaBliss Balance combines premium CBD extract with cold-pressed hemp seed oil for a powerful daily wellness tincture. The synergistic blend supports mood, sleep, and chronic pain management.',
        price: 1899,
        mrp: 2499,
        stock: 60,
        sku: 'TINC-BAL-30',
        volume: '30ml',
        cbdContent: '1000mg',
        images: [{ url: 'https://placehold.co/400x400/ecfdf5/065f46?text=Tincture', alt: 'CBD Tincture' }],
        features: ['CBD + Hemp Seed Oil', 'Sublingual delivery', 'Fast acting', 'Naturally flavored'],
        tags: ['tincture', 'cbd', 'hemp', 'balance', 'daily'],
        labTested: true,
        requiresPrescription: false,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        isActive: true,
      },
    ];

    const products = await Product.insertMany(PRODUCTS);
    console.log(`✅ ${products.length} products seeded`);

    console.log('\n🎉 Seed complete!\n');
    console.log('Admin login:    admin@thcstore.in / Admin@123');
    console.log('Customer login: customer@thcstore.in / Test@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
