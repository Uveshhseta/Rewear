require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ClothingListing = require('../models/ClothingListing');
const SwapRequest = require('../models/SwapRequest');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');
const { calculateItemSwapValue, compareSwapValues } = require('../services/valueCalculator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rewear_db';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // Clear existing data to maintain idempotency
    console.log('[Seed] Purging previous collections...');
    await Promise.all([
      User.deleteMany({}),
      ClothingListing.deleteMany({}),
      SwapRequest.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('[Seed] Creating Administrator and Customer accounts...');

    // 1. Create Dedicated Administrator
    const adminUser = await User.create({
      name: 'ReWear Platform Administrator',
      email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@rewear.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      city: 'Bengaluru',
      postalCode: '560001',
      bio: 'Platform Governance & Circular Economy Moderator.',
      status: 'active',
    });

    // 2. Create Realistic Customer Personas
    const customer1 = await User.create({
      name: 'Aanya Sharma',
      email: 'aanya@example.com',
      password: 'Password@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      city: 'Mumbai',
      postalCode: '400050',
      bio: 'Fashion curator & slow fashion advocate. Exchanging handpicked vintage and designer streetwear.',
      status: 'active',
    });

    const customer2 = await User.create({
      name: 'Rohan Mehra',
      email: 'rohan@example.com',
      password: 'Password@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      city: 'Delhi',
      postalCode: '110016',
      bio: 'Lover of structured denim, Japanese minimalist workwear, and classic sneakers.',
      status: 'active',
    });

    const customer3 = await User.create({
      name: 'Pooja Iyer',
      email: 'pooja@example.com',
      password: 'Password@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      city: 'Bengaluru',
      postalCode: '560034',
      bio: 'Artisan textile researcher. Swapping handloom sarees, block prints, and natural dyed kurtis.',
      status: 'active',
    });

    const customer4 = await User.create({
      name: 'Kabir Singhania',
      email: 'kabir@example.com',
      password: 'Password@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      city: 'Pune',
      postalCode: '411004',
      bio: 'Sneakerhead and streetwear collector downscaling my wardrobe for zero-waste lifestyle.',
      status: 'active',
    });

    console.log('[Seed] Users created successfully.');

    // 3. Create Diverse Premium Clothing Listings
    const listingsData = [
      {
        owner: customer1._id,
        title: 'Vintage Oversized Washed Denim Jacket',
        description: 'Authentic medium-wash relaxed denim trucker jacket with brass hardware and subtle distressed detailing. Perfect for layered autumn and evening looks.',
        category: 'women',
        gender: 'women',
        brand: "Levi's Premium",
        size: 'M',
        condition: 'like_new',
        color: 'Classic Indigo',
        material: '100% Organic Cotton',
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 4200,
        city: 'Mumbai',
        postalCode: '400050',
        exchangePreference: 'both',
      },
      {
        owner: customer2._id,
        title: 'Structured Sand Linen Safari Overshirt',
        description: 'Bespoke neutral tailored overshirt with utility chest pockets and horn buttons. Breathable European flax linen fabric.',
        category: 'men',
        gender: 'men',
        brand: 'Massimo Dutti',
        size: 'L',
        condition: 'new_with_tags',
        color: 'Sand Beige',
        material: '100% French Linen',
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 3800,
        city: 'Delhi',
        postalCode: '110016',
        exchangePreference: 'courier',
      },
      {
        owner: customer3._id,
        title: 'Handloom Chanderi Silk Embroidered Kurti',
        description: 'Exquisite ivory and gold threadwork Chanderi silk tunic paired with handcrafted organza sleeves. Worn once for a family ceremony.',
        category: 'ethnic_wear',
        gender: 'women',
        brand: 'Fabindia Heritage',
        size: 'S',
        condition: 'like_new',
        color: 'Ivory / Pale Gold',
        material: 'Chanderi Silk',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 5500,
        city: 'Bengaluru',
        postalCode: '560034',
        exchangePreference: 'both',
      },
      {
        owner: customer4._id,
        title: 'Retro High-Top Leather Court Sneakers',
        description: 'Immaculately kept retro silhouette with forest green accents and gum soles. Crease shields used since day one.',
        category: 'shoes',
        gender: 'unisex',
        brand: 'Nike Sportswear',
        size: 'XL', // Shoe size 10 (US)
        condition: 'good',
        color: 'Off-White / Forest Green',
        material: 'Full Grain Leather',
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 6500,
        city: 'Pune',
        postalCode: '411004',
        exchangePreference: 'both',
      },
      {
        owner: customer1._id,
        title: 'Handwoven Artisanal Leather Crossbody Bag',
        description: 'Vegetable-tanned saddle leather satchel featuring brass buckle closure and adjustable strap. Naturally patinated over time.',
        category: 'accessories',
        gender: 'unisex',
        brand: 'Nappa Dori',
        size: 'Free Size',
        condition: 'like_new',
        color: 'Caramel Brown',
        material: 'Vegetable-Tanned Leather',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 4800,
        city: 'Mumbai',
        postalCode: '400050',
        exchangePreference: 'in_person',
      },
      {
        owner: customer2._id,
        title: 'Heavyweight Minimalist Loopback Hoodie',
        description: '450 GSM ultra-soft organic cotton French terry hoodie in washed charcoal. Dropped shoulder streetwear cut.',
        category: 'men',
        gender: 'men',
        brand: 'Uniqlo U',
        size: 'XL',
        condition: 'like_new',
        color: 'Charcoal Grey',
        material: 'Organic Cotton French Terry',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 2990,
        city: 'Delhi',
        postalCode: '110016',
        exchangePreference: 'both',
      },
      {
        owner: customer3._id,
        title: 'Pure Raw Silk Nehru Jacket with Brass Buttons',
        description: 'Tailored bandhgala sleeveless waistcoat in emerald forest green. Ideal for festive gatherings or pairing with kurtas.',
        category: 'ethnic_wear',
        gender: 'men',
        brand: 'Manyavar',
        size: 'M',
        condition: 'new_with_tags',
        color: 'Forest Emerald',
        material: 'Raw Tussar Silk',
        images: [
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 4500,
        city: 'Bengaluru',
        postalCode: '560034',
        exchangePreference: 'both',
      },
      {
        owner: customer4._id,
        title: 'Bohemian Floral Midi Tiered Sundress',
        description: 'Airy summer tiered dress with blouson sleeves, smocked waist, and delicate floral print. Sustainable viscose blend.',
        category: 'women',
        gender: 'women',
        brand: 'Zara Woman',
        size: 'S',
        condition: 'like_new',
        color: 'Ivory Floral',
        material: 'Eco-Vero Viscose',
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 3590,
        city: 'Pune',
        postalCode: '411004',
        exchangePreference: 'both',
      },
      {
        owner: customer1._id,
        title: 'Relaxed Tailored Pleated Trousers',
        description: 'High-waisted double pleated wide-leg trousers in sage taupe. Pairs beautifully with loafers and relaxed tees.',
        category: 'women',
        gender: 'women',
        brand: 'Mango',
        size: 'M',
        condition: 'good',
        color: 'Sage Taupe',
        material: 'Cotton Lyocell Blend',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 3200,
        city: 'Mumbai',
        postalCode: '400050',
        exchangePreference: 'in_person',
      },
      {
        owner: customer2._id,
        title: 'Japanese Selvedge Raw Denim Jeans (32/32)',
        description: '14oz red-line selvedge denim, unwashed and crisp. Authentic chain-stitched hems with zero knee fades.',
        category: 'men',
        gender: 'men',
        brand: "Levi's Made & Crafted",
        size: 'L',
        condition: 'like_new',
        color: 'Deep Raw Indigo',
        material: '100% Selvedge Cotton',
        images: [
          'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 5999,
        city: 'Delhi',
        postalCode: '110016',
        exchangePreference: 'both',
      },
      {
        owner: customer3._id,
        title: 'Chunky Wool Cable-Knit Cream Cardigan',
        description: 'Cozy artisanal chunky knit with horn buttons and dropped pockets. Perfect layering piece for chilly evenings.',
        category: 'women',
        gender: 'women',
        brand: 'Marks & Spencer',
        size: 'L',
        condition: 'like_new',
        color: 'Warm Ivory',
        material: 'Wool Blend',
        images: [
          'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 3990,
        city: 'Bengaluru',
        postalCode: '560034',
        exchangePreference: 'both',
      },
      {
        owner: customer4._id,
        title: 'Minimalist Polarized Acetate Sunglasses',
        description: 'Handcrafted Italian acetate frames in tortoiseshell with bronze tint UV400 lenses. Comes with original vegan leather pouch.',
        category: 'accessories',
        gender: 'unisex',
        brand: 'Ray-Ban',
        size: 'Free Size',
        condition: 'new_with_tags',
        color: 'Amber Tortoise',
        material: 'Cellulose Acetate',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        ],
        referencePrice: 4200,
        city: 'Pune',
        postalCode: '411004',
        exchangePreference: 'both',
      },
    ];

    console.log('[Seed] Inserting clothing listings with computed swap values...');
    const createdListings = [];

    for (const item of listingsData) {
      const calc = calculateItemSwapValue({
        referencePrice: item.referencePrice,
        condition: item.condition,
        category: item.category,
        brand: item.brand,
      });

      const listing = await ClothingListing.create({
        ...item,
        estimatedSwapValue: calc.estimatedSwapValue,
        status: 'available',
        moderationStatus: 'approved',
        viewsCount: Math.floor(Math.random() * 85) + 12,
      });
      createdListings.push(listing);
    }

    console.log(`[Seed] Created ${createdListings.length} clothing listings.`);

    // 4. Create a Sample Active Swap Request
    // Rohan requests Aanya's Denim Jacket offering his Linen Safari Overshirt
    const denimJacket = createdListings[0];
    const linenShirt = createdListings[1];

    const comparison = compareSwapValues(linenShirt.estimatedSwapValue, denimJacket.estimatedSwapValue);

    const swapRequest1 = await SwapRequest.create({
      requester: customer2._id, // Rohan
      recipient: customer1._id, // Aanya
      requestedListing: denimJacket._id,
      offeredListing: linenShirt._id,
      requesterItemValue: linenShirt.estimatedSwapValue,
      recipientItemValue: denimJacket.estimatedSwapValue,
      valueDifference: comparison.absoluteDifference,
      fairnessMatch: comparison.fairnessMatch,
      message: 'Hey Aanya! Love your vintage jacket. Would you like to swap for my sand linen safari shirt? Both in great condition!',
      exchangeMethod: 'courier',
      status: 'accepted',
      courierDetails: {
        carrier: 'Blue Dart Express',
        trackingNumber: 'BD-982348719IN',
        status: 'in_transit',
        dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: 'Dispatched via insured green parcel packaging.',
      },
      statusHistory: [
        {
          status: 'pending',
          changedBy: customer2._id,
          note: 'Swap request submitted.',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
        {
          status: 'accepted',
          changedBy: customer1._id,
          note: 'Swap accepted by Aanya.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Mark the two items in_swap
    denimJacket.status = 'in_swap';
    linenShirt.status = 'in_swap';
    await denimJacket.save();
    await linenShirt.save();

    // 5. Create Conversation & Realistic Negotiation Messages
    const conversation1 = await Conversation.create({
      participants: [customer1._id, customer2._id],
      swapRequest: swapRequest1._id,
      listing: denimJacket._id,
      lastMessage: {
        text: 'Sent the courier tracking number! It should reach Bandra in 2 days.',
        sender: customer2._id,
        timestamp: new Date(),
      },
    });

    await Message.create([
      {
        conversation: conversation1._id,
        sender: customer2._id,
        text: 'Hey Aanya! How is the fit on the Levi’s jacket? Is it true to medium or slightly boxy?',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      },
      {
        conversation: conversation1._id,
        sender: customer1._id,
        text: 'Hi Rohan! It has an intentional relaxed boxy fit, pairs great over hoodies too. Your linen shirt is gorgeous, happy to swap!',
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
      },
      {
        conversation: conversation1._id,
        sender: customer1._id,
        text: 'Accepted the request! Let us do courier exchange since you are in Delhi and I am in Mumbai.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        conversation: conversation1._id,
        sender: customer2._id,
        text: 'Sent the courier tracking number! It should reach Bandra in 2 days.',
        createdAt: new Date(),
      },
    ]);

    // 6. Create a Pending Swap Request
    // Kabir requests Pooja's Silk Kurti offering Court Sneakers
    const silkKurti = createdListings[2];
    const sneakers = createdListings[3];
    const comp2 = compareSwapValues(sneakers.estimatedSwapValue, silkKurti.estimatedSwapValue);

    await SwapRequest.create({
      requester: customer4._id,
      recipient: customer3._id,
      requestedListing: silkKurti._id,
      offeredListing: sneakers._id,
      requesterItemValue: sneakers.estimatedSwapValue,
      recipientItemValue: silkKurti.estimatedSwapValue,
      valueDifference: comp2.absoluteDifference,
      fairnessMatch: comp2.fairnessMatch,
      message: 'Hello Pooja, I am gifting this Chanderi kurti to my sister. Would you consider trading for my retro court sneakers?',
      exchangeMethod: 'in_person',
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedBy: customer4._id,
          note: 'Submitted swap offer.',
          timestamp: new Date(),
        },
      ],
    });

    // 7. Create a Sample Moderation Report for Admin
    await Report.create({
      reporter: customer1._id,
      reportedListing: createdListings[7]._id, // Sundress
      reason: 'misrepresented_condition',
      description: 'The description mentions pristine condition, but please verify with seller if fabric shows any micro-pilling.',
      status: 'pending',
    });

    console.log('[Seed] Database successfully populated with realistic circular fashion data!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@rewear.com');
    console.log('  Password: Admin@123456');
    console.log('Customer Account (Demo):');
    console.log('  Email:    aanya@example.com');
    console.log('  Password: Password@123');
    console.log('Customer Account 2 (Demo):');
    console.log('  Email:    rohan@example.com');
    console.log('  Password: Password@123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();

