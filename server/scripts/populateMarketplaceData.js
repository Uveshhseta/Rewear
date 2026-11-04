require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ClothingListing = require('../models/ClothingListing');
const { calculateItemSwapValue } = require('../services/valueCalculator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rewear_db';

const sampleListingsData = [
  // --- UVESH SETA'S PRIMARY PERSONAL LISTINGS ---
  {
    ownerEmail: 'uvesh@gmail.com',
    title: 'Tailored Italian Wool Blend Blazer',
    description: 'Impeccably tailored unstructured blazer in charcoal slate with soft shoulders and horn buttons. Worn twice for special corporate events, dry-cleaned, and kept in a garment bag.',
    category: 'men',
    gender: 'men',
    brand: 'Zara Man Tailored',
    size: 'L',
    condition: 'like_new',
    color: 'Charcoal Slate',
    material: 'Italian Wool Blend',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 5990,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'uvesh@gmail.com',
    title: 'Vintage Indigo Chambray Workshirt',
    description: 'Triple-needle stitched heritage chambray workshirt with cat-eye buttons and selvedge gussets. Breathable 6.5oz organic cotton denim wash.',
    category: 'men',
    gender: 'men',
    brand: "Levi's Premium",
    size: 'M',
    condition: 'like_new',
    color: 'Faded Indigo',
    material: '100% Organic Cotton',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3299,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },

  // --- MEN'S WEAR ---
  {
    ownerEmail: 'rohan@example.com',
    title: 'Heavyweight Loopback Streetwear Hoodie',
    description: 'Premium 480 GSM French terry hoodie with double-layered hood and relaxed dropped shoulders. Rich washed forest green hue.',
    category: 'men',
    gender: 'men',
    brand: 'Uniqlo U',
    size: 'XL',
    condition: 'new_with_tags',
    color: 'Forest Green',
    material: 'Organic French Terry',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3490,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'rohan@example.com',
    title: 'Relaxed Tapered Pleated Chinos',
    description: 'Contemporary double-pleated chino trousers in warm tan. High-rise cut with room through the thigh and gentle taper to cuff.',
    category: 'men',
    gender: 'men',
    brand: 'Massimo Dutti',
    size: 'M',
    condition: 'like_new',
    color: 'Warm Tan',
    material: 'Cotton Twill',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3990,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'Oversized Boxy Supima Cotton Tee',
    description: 'Clean minimalist silhouette heavyweight 240 GSM organic Supima cotton t-shirt. Never stretched, washed in cold cycle.',
    category: 'men',
    gender: 'unisex',
    brand: 'Cos Stores',
    size: 'L',
    condition: 'like_new',
    color: 'Bone White',
    material: 'Supima Cotton',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 2200,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'rohan@example.com',
    title: 'Heritage Corduroy Trucker Jacket',
    description: 'Classic 8-wale corduroy outerwear jacket with sherpa lining and brass button closure. Deep cinnamon brown tone.',
    category: 'men',
    gender: 'men',
    brand: 'Wrangler Heritage',
    size: 'L',
    condition: 'good',
    color: 'Cinnamon Brown',
    material: 'Cotton Corduroy',
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 4999,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'Raw Selvedge Denim Jacket with Copper Rivets',
    description: 'Unwashed crisp 13.5oz red-line Japanese denim jacket. Timeless chore cut with four utility pockets and interior selvedge detailing.',
    category: 'men',
    gender: 'men',
    brand: 'Nudie Jeans',
    size: 'M',
    condition: 'new_with_tags',
    color: 'Raw Indigo',
    material: 'Organic Selvedge Cotton',
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 7500,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'rohan@example.com',
    title: 'Relaxed Fit Linen Blend Resort Shirt',
    description: 'Cuban collar short-sleeve shirt in sage green with botanical line embroidery. Airy and breathable for humid summer climates.',
    category: 'men',
    gender: 'men',
    brand: 'H&M Edition',
    size: 'M',
    condition: 'like_new',
    color: 'Sage Green',
    material: 'Linen-Viscose Blend',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 1999,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },

  // --- WOMEN'S WEAR ---
  {
    ownerEmail: 'aanya@example.com',
    title: 'Minimalist Double-Breasted Wool Trench',
    description: 'Elegant midi trench coat crafted from a warm wool-blend in neutral oatmeal. Features horn buttons, belt tie, and satin lining.',
    category: 'women',
    gender: 'women',
    brand: 'Mango Premium',
    size: 'M',
    condition: 'like_new',
    color: 'Oatmeal Beige',
    material: 'Wool Blend',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 7990,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'aanya@example.com',
    title: 'Artisanal Pure Mulberry Silk Wrap Blouse',
    description: 'Luxurious terracotta mulberry silk wrap top with delicate cuff pleating and self-tie waist. Perfect for elevated evening styling.',
    category: 'women',
    gender: 'women',
    brand: 'Nicobar',
    size: 'S',
    condition: 'new_with_tags',
    color: 'Terracotta',
    material: '100% Mulberry Silk',
    images: [
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 4800,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Smocked Bodice Linen Tiered Midi Dress',
    description: 'Charming European flax linen midi dress in dusty rose with adjustable tie straps and tiered flowing skirt. Features hidden side pockets.',
    category: 'women',
    gender: 'women',
    brand: '& Other Stories',
    size: 'M',
    condition: 'like_new',
    color: 'Dusty Rose',
    material: '100% Flax Linen',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 5500,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'aanya@example.com',
    title: 'High-Waisted Wide Leg Ecru Jeans',
    description: 'Structured 100% cotton ecru denim with clean pocket details and unfinished raw hem. Contemporary wide-leg silhouette.',
    category: 'women',
    gender: 'women',
    brand: 'Zara Woman',
    size: 'S',
    condition: 'like_new',
    color: 'Ecru Off-White',
    material: 'Organic Cotton Denim',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 2990,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Fine-Gauge Merino Wool Turtleneck Sweater',
    description: 'Ultra-soft extrafine Australian merino wool knit in camel brown. Seamless ribbed collar and cuffs.',
    category: 'women',
    gender: 'women',
    brand: 'Uniqlo Extra Fine Merino',
    size: 'S',
    condition: 'like_new',
    color: 'Camel Brown',
    material: '100% Extrafine Merino Wool',
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3290,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'aanya@example.com',
    title: 'Pleated A-Line Satin Midi Skirt',
    description: 'Fluid heavyweight crepe satin skirt in emerald green. Features a comfortable elasticated waistband and knife pleats that move beautifully.',
    category: 'women',
    gender: 'women',
    brand: 'Marks & Spencer',
    size: 'M',
    condition: 'like_new',
    color: 'Deep Emerald',
    material: 'Satin Crepe',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3499,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },

  // --- ETHNIC WEAR ---
  {
    ownerEmail: 'pooja@example.com',
    title: 'Handblock Ajrakh Natural Indigo Kurta Set',
    description: 'Traditional 14-stage natural dye Ajrakh handblock print on modal silk. Comes with matching culottes and kota doria dupatta.',
    category: 'ethnic_wear',
    gender: 'women',
    brand: 'Fabindia Heritage',
    size: 'M',
    condition: 'new_with_tags',
    color: 'Indigo & Crimson',
    material: 'Modal Silk',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 6200,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Handwoven Chanderi Saree with Zari Border',
    description: 'Authentic Madhya Pradesh handloom Chanderi saree in pastel mint green with woven golden floral motifs and tissue pallu.',
    category: 'ethnic_wear',
    gender: 'women',
    brand: 'Raw Mango Heirloom',
    size: 'Free Size',
    condition: 'like_new',
    color: 'Pastel Mint / Gold',
    material: 'Chanderi Silk Cotton',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 8500,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Kalamkari Hand-Painted Cotton Anarkali',
    description: 'Organic unbleached cotton floor-length anarkali featuring hand-painted floral vine Kalamkari borders using vegetable dyes.',
    category: 'ethnic_wear',
    gender: 'women',
    brand: 'Jaypore Craft',
    size: 'S',
    condition: 'like_new',
    color: 'Ivory & Rust',
    material: 'Organic Khadi Cotton',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 4800,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'Raw Silk Festive Bandhgala Waistcoat',
    description: 'Midnight navy textured raw tussar silk sleeveless jacket with mother-of-pearl buttons. Pairs cleanly over linen kurtas.',
    category: 'ethnic_wear',
    gender: 'men',
    brand: 'Manyavar Mohey',
    size: 'L',
    condition: 'new_with_tags',
    color: 'Midnight Navy',
    material: 'Raw Tussar Silk',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 4200,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Chikankari Hand-Embroidered Georgette Kurta',
    description: 'Exquisite Lucknowi chikankari hand-embroidery with shadow-work and murri stitches on fine ivory georgette. Comes with matching modal slip.',
    category: 'ethnic_wear',
    gender: 'women',
    brand: 'Ada Chikan Studio',
    size: 'M',
    condition: 'like_new',
    color: 'Pure Ivory',
    material: 'Fine Georgette',
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3900,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },

  // --- SHOES & FOOTWEAR ---
  {
    ownerEmail: 'kabir@example.com',
    title: 'Classic White Leather Minimalist Trainers',
    description: 'Premium Italian calfskin leather sneakers with stitched cupsole and padded heel counter. Impeccably conditioned with Saphir leather balm.',
    category: 'shoes',
    gender: 'unisex',
    brand: 'Common Projects Style',
    size: 'L', // Size 9 (UK)
    condition: 'like_new',
    color: 'Pure White',
    material: 'Full Grain Leather',
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 6990,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'Retro Running Shoes with Gum Sole',
    description: 'Vintage 1970s running silhouette with suede overlays and nylon mesh quarter panels. Evergreen forest green on cream colorway.',
    category: 'shoes',
    gender: 'unisex',
    brand: 'New Balance Heritage',
    size: 'XL', // Size 10 (UK)
    condition: 'like_new',
    color: 'Forest Green / Off-White',
    material: 'Suede & Breathable Mesh',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 5999,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'rohan@example.com',
    title: 'Handmade Goodyear-Welted Leather Penny Loafers',
    description: 'Classic burgundy cordovan finish penny loafers with stacked leather heel and Goodyear-welted soles. Built to last decades.',
    category: 'shoes',
    gender: 'men',
    brand: 'Bridlen India',
    size: 'L', // Size 9 (UK)
    condition: 'good',
    color: 'Deep Burgundy',
    material: 'Calf Leather',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 7500,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'aanya@example.com',
    title: 'Artisanal Hand-Tooled Kolhapuri Leather Chappals',
    description: 'Genuine vegetable-tanned Kolhapuri leather flats with braided strap detailing and cushion insole padding for modern all-day wear.',
    category: 'shoes',
    gender: 'women',
    brand: 'Vipassana Artisans',
    size: 'M', // Size 6 (UK)
    condition: 'new_with_tags',
    color: 'Natural Tan',
    material: 'Vegetable Tanned Leather',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 2200,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'High-Top Suede Court Basketball Sneakers',
    description: 'Iconic basketball high-top silhouette in black and warm beige hairy suede with padded ankle collar and rubber tread.',
    category: 'shoes',
    gender: 'unisex',
    brand: 'Adidas Originals',
    size: 'XL', // Size 10 (UK)
    condition: 'good',
    color: 'Charcoal & Oatmeal',
    material: 'Hairy Suede & Leather',
    images: [
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 5490,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },

  // --- BAGS & ACCESSORIES ---
  {
    ownerEmail: 'aanya@example.com',
    title: 'Minimalist Vegetable Tanned Leather Tote',
    description: 'Spacious everyday work tote crafted from untreated full-grain pull-up leather that ages with an authentic golden patina. Easily fits a 14-inch laptop.',
    category: 'accessories',
    gender: 'unisex',
    brand: 'Nappa Dori',
    size: 'Free Size',
    condition: 'like_new',
    color: 'Saddle Tan',
    material: 'Full Grain Leather',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 6500,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'rohan@example.com',
    title: 'Heavyweight Canvas & Leather Weekend Duffel',
    description: '18oz paraffin-waxed water-resistant cotton canvas bag reinforced with bridle leather trim and antique brass YKK zippers.',
    category: 'accessories',
    gender: 'unisex',
    brand: 'Scaramouche Oxford',
    size: 'Free Size',
    condition: 'like_new',
    color: 'Olive Green & Brown',
    material: 'Waxed Canvas & Bridle Leather',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 5800,
    city: 'Delhi',
    postalCode: '110016',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'pooja@example.com',
    title: 'Kashmiri Pure Pashmina Hand-Spun Stole',
    description: 'Certified 100% fine Ladakhi Changthangi cashmere pashmina shawl with hand-embroidered sozni needlework along the borders.',
    category: 'accessories',
    gender: 'unisex',
    brand: 'Kashmir Loom',
    size: 'Free Size',
    condition: 'like_new',
    color: 'Natural Camel',
    material: '100% Pashmina Cashmere',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 7200,
    city: 'Bengaluru',
    postalCode: '560034',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'kabir@example.com',
    title: 'Solid Brass Buckle Full-Grain Leather Belt',
    description: 'Handmade 1.5-inch wide vegetable-tanned bridle leather belt with solid sand-cast brass roller buckle. Waist 32-36.',
    category: 'accessories',
    gender: 'men',
    brand: 'Tanner Goods Style',
    size: 'M',
    condition: 'like_new',
    color: 'Dark Walnut Brown',
    material: 'English Bridle Leather',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 2400,
    city: 'Pune',
    postalCode: '411004',
    exchangePreference: 'both',
  },
  {
    ownerEmail: 'aanya@example.com',
    title: 'Handwoven Artisanal Straw Basket Bag',
    description: 'Ethically hand-plaited natural river grass basket tote with soft nappa leather shoulder straps. Ideal for market runs or weekend getaways.',
    category: 'accessories',
    gender: 'women',
    brand: 'Muun Studio',
    size: 'Free Size',
    condition: 'new_with_tags',
    color: 'Natural Straw & Black',
    material: 'Natural Elephant Grass',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ],
    referencePrice: 3200,
    city: 'Mumbai',
    postalCode: '400050',
    exchangePreference: 'both',
  },
];

async function populateMarketplace() {
  try {
    console.log('[Populate] Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // 1. Fetch all users to map owner emails to IDs
    const users = await User.find({});
    const userMap = {};
    for (const u of users) {
      userMap[u.email.toLowerCase()] = u._id;
    }

    if (!userMap['uvesh@gmail.com']) {
      console.error('[Populate Error] Primary account uvesh@gmail.com must be registered first.');
      process.exit(1);
    }

    console.log(`[Populate] Verified ${users.length} registered users in DB.`);
    console.log(`[Populate] Primary account Uvesh Seta ID: ${userMap['uvesh@gmail.com']}`);

    // 2. Fetch existing listings to ensure idempotency
    const existingListings = await ClothingListing.find({}, { title: 1 });
    const existingTitles = new Set(existingListings.map((l) => l.title.trim().toLowerCase()));

    console.log(`[Populate] Database currently has ${existingListings.length} listings.`);

    let inserted = 0;
    let skipped = 0;

    for (const item of sampleListingsData) {
      const normalizedTitle = item.title.trim().toLowerCase();

      if (existingTitles.has(normalizedTitle)) {
        skipped++;
        continue;
      }

      const ownerId = userMap[item.ownerEmail.toLowerCase()] || userMap['uvesh@gmail.com'];

      const calc = calculateItemSwapValue({
        referencePrice: item.referencePrice,
        condition: item.condition,
        category: item.category,
        brand: item.brand,
      });

      await ClothingListing.create({
        owner: ownerId,
        title: item.title,
        description: item.description,
        category: item.category,
        gender: item.gender || 'unisex',
        brand: item.brand,
        size: item.size,
        condition: item.condition,
        color: item.color,
        material: item.material,
        images: item.images,
        referencePrice: item.referencePrice,
        estimatedSwapValue: calc.estimatedSwapValue,
        city: item.city,
        postalCode: item.postalCode,
        exchangePreference: item.exchangePreference,
        status: 'available',
        moderationStatus: 'approved',
        viewsCount: Math.floor(Math.random() * 95) + 18,
      });

      existingTitles.add(normalizedTitle);
      inserted++;
    }

    const totalNow = await ClothingListing.countDocuments();
    const uveshCount = await ClothingListing.countDocuments({ owner: userMap['uvesh@gmail.com'] });

    console.log(`[Populate Success] Inserted: ${inserted}, Skipped existing: ${skipped}`);
    console.log(`[Populate] Total clothing listings in MongoDB: ${totalNow}`);
    console.log(`[Populate] Listings owned by Uvesh Seta: ${uveshCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Populate Error]', err);
    process.exit(1);
  }
}

populateMarketplace();
