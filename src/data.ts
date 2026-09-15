import { Florist, Product, Occasion, Category, BlogPost, CustomerReview } from './types';

export const MOCK_FLORISTS: Florist[] = [
  {
    id: 'f1',
    name: 'Nairobi Blooms',
    logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1200&auto=format&fit=crop&q=80',
    location: 'Westlands, Nairobi',
    rating: 4.9,
    reviewsCount: 148,
    verified: true,
    deliveryRadiusKm: 25,
    minOrderValue: 1500,
    deliveryFee: 350,
    about: 'Specializing in bespoke floral sculptures, exotic imports, and signature luxury gift wrapping. Nairobi Blooms has curated premium floriculture for Westlands since 2018.',
    phone: '+254 711 000 111',
    email: 'hello@nairobiblooms.co.ke',
    address: 'Rhapta Road, Westlands, Nairobi',
    established: '2018'
  },
  {
    id: 'f2',
    name: 'Rift Valley Roses',
    logo: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
    location: 'Naivasha',
    rating: 4.8,
    reviewsCount: 92,
    verified: true,
    deliveryRadiusKm: 50,
    minOrderValue: 2000,
    deliveryFee: 450,
    about: 'Straight from the sun-drenched volcanic soils of Lake Naivasha. Our sustainable, farm-to-door roses are harvested daily to guarantee the longest vase life in East Africa.',
    phone: '+254 722 000 222',
    email: 'info@riftvalleyroses.com',
    address: 'South Lake Road, Naivasha',
    established: '2015'
  },
  {
    id: 'f3',
    name: 'Coastal Petals',
    logo: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    location: 'Nyali, Mombasa',
    rating: 4.7,
    reviewsCount: 56,
    verified: true,
    deliveryRadiusKm: 15,
    minOrderValue: 1200,
    deliveryFee: 250,
    about: 'Bringing ocean breezes and bright tropical arrangements to the coast. Specializing in orchids, bird of paradise, ginger lily designs, and premium coastal event setups.',
    phone: '+254 733 000 333',
    email: 'nyali@coastalpetals.co.ke',
    address: 'Links Road, Nyali, Mombasa',
    established: '2020'
  },
  {
    id: 'f4',
    name: 'Great Rift Florals',
    logo: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80',
    location: 'Eldoret',
    rating: 4.9,
    reviewsCount: 74,
    verified: true,
    deliveryRadiusKm: 30,
    minOrderValue: 1800,
    deliveryFee: 300,
    about: 'Born in the highlands of Eldoret, we cultivate magnificent carnations, lisianthus, and fresh lilies. We deliver across Eldoret town and surrounding agricultural estates.',
    phone: '+254 744 000 444',
    email: 'eldoret@greatriftflorals.co.ke',
    address: 'Kapsoya Estate, Eldoret',
    established: '2019'
  },
  {
    id: 'f5',
    name: 'Mount Kenya Orchids',
    logo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    location: 'Nanyuki',
    rating: 4.9,
    reviewsCount: 38,
    verified: true,
    deliveryRadiusKm: 40,
    minOrderValue: 2500,
    deliveryFee: 500,
    about: 'Premium, high-altitude alpine blooms and luxury potted orchids grown under the magnificent shadow of Mount Kenya. Perfect for sophisticated gifting and cold-climate resilience.',
    phone: '+254 755 000 555',
    email: 'nanyuki@mtkenyaorchids.com',
    address: 'Nanyuki Airfield Road, Nanyuki',
    established: '2021'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Imperial Safari Rose Bouquet',
    description: 'A striking collection of deep red Naivasha safari roses, hand-tied with elegant eucalyptus foliage and wrapped in premium textured paper. Perfect for expressing passionate love.',
    price: 4800,
    rating: 4.9,
    reviewsCount: 42,
    floristId: 'f2',
    floristName: 'Rift Valley Roses',
    category: 'Roses',
    occasions: ["Valentine's", 'Anniversary', 'Birthday'],
    flowerType: ['Roses', 'Eucalyptus'],
    colors: ['Red'],
    images: [
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552590635-27c2c21289f5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day (Order by 1 PM)',
    availability: true,
    isTrending: true,
    isSeasonal: false,
    features: ['Long 12-day vase life', 'Volcanic soil nutrients included', 'Handwritten custom card included']
  },
  {
    id: 'p2',
    title: 'Nairobi Golden Sunrise',
    description: 'A vibrant, mood-boosting arrangement of premium yellow calla lilies, orange roses, and hypericum berries. Captures the glorious essence of a Kenyan morning.',
    price: 3600,
    rating: 4.8,
    reviewsCount: 29,
    floristId: 'f1',
    floristName: 'Nairobi Blooms',
    category: 'Lilies',
    occasions: ['Birthday', 'Graduation', 'Congratulations'],
    flowerType: ['Lilies', 'Roses'],
    colors: ['Yellow', 'Orange'],
    images: [
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day (Order by 12 PM)',
    availability: true,
    isTrending: true,
    isSeasonal: false,
    features: ['Locally sourced Westlands glass vase', 'Express premium packing', 'Foliage mix']
  },
  {
    id: 'p3',
    title: 'Mount Kenya Premium Orchid Pot',
    description: 'An elegant, long-lasting double-stemmed white Phalaenopsis orchid, presented in a minimalist artisanal ceramic pot. Symbolizes pure luxury and refinement.',
    price: 8500,
    rating: 5.0,
    reviewsCount: 15,
    floristId: 'f5',
    floristName: 'Mount Kenya Orchids',
    category: 'Orchids',
    occasions: ['Anniversary', 'Wedding', 'Mother\'s Day'],
    flowerType: ['Orchids'],
    colors: ['White'],
    images: [
      'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487070183336-b8a25923a5ed?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Next-day Delivery',
    availability: true,
    isTrending: false,
    isSeasonal: true,
    features: ['Grown in volcanic pumice', 'Premium ceramic keepsake pot', 'Vase-care visual guide']
  },
  {
    id: 'p4',
    title: 'Coastal Paradise Ginger Lily',
    description: 'An exotic beachside display featuring fiery red ginger lilies, pink anthuriums, and dramatic monstera leaves. Perfect for modern, structural spaces.',
    price: 4200,
    rating: 4.6,
    reviewsCount: 18,
    floristId: 'f3',
    floristName: 'Coastal Petals',
    category: 'Luxury',
    occasions: ['Congratulations', 'Wedding', 'Anniversary'],
    flowerType: ['Ginger Lilies', 'Anthuriums'],
    colors: ['Red', 'Pink'],
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day (Nyali only)',
    availability: true,
    isTrending: false,
    isSeasonal: false,
    features: ['Tropical heat-resistant packaging', 'Locally woven sisal twine wrap', 'Water tubes included']
  },
  {
    id: 'p5',
    title: 'Great Rift Pastel Symphony',
    description: 'A harmonious blend of delicate lavender lisianthus, pink carnations, and white gypsophila. Expresses deep admiration and gentle comfort.',
    price: 3200,
    rating: 4.9,
    reviewsCount: 22,
    floristId: 'f4',
    floristName: 'Great Rift Florals',
    category: 'Bouquets',
    occasions: ['Sympathy', 'Baby Shower', 'Mother\'s Day'],
    flowerType: ['Carnations', 'Lisianthus', 'Gypsophila'],
    colors: ['Pink', 'Purple', 'White'],
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day (Eldoret)',
    availability: true,
    isTrending: true,
    isSeasonal: false,
    features: ['Soft eco-friendly wraps', 'Eco flower-gel hydration pack', 'Care cards']
  },
  {
    id: 'p6',
    title: 'Blushing Naivasha Peonies (Seasonal)',
    description: 'Our highly anticipated seasonal pink peonies, freshly cut from Naivasha’s cooler greenhouse micro-climates. Exquisite fluffiness and unmatched fragrance.',
    price: 9200,
    rating: 4.9,
    reviewsCount: 31,
    floristId: 'f2',
    floristName: 'Rift Valley Roses',
    category: 'Luxury',
    occasions: ['Anniversary', 'Mother\'s Day', 'Wedding'],
    flowerType: ['Peonies'],
    colors: ['Pink'],
    images: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Next-day Delivery',
    availability: true,
    isTrending: false,
    isSeasonal: true,
    features: ['Delivered in semi-bud stage for max vase life', 'Luxury velvet ribbon', 'Signature presentation box']
  },
  {
    id: 'p7',
    title: 'Classic White Lily & Rose Display',
    description: 'An elegant statement piece blending large snowy-white lilies with premium white roses. Radiates absolute purity, peaceful remembrance, and elegance.',
    price: 5500,
    rating: 4.8,
    reviewsCount: 14,
    floristId: 'f1',
    floristName: 'Nairobi Blooms',
    category: 'Lilies',
    occasions: ['Sympathy', 'Wedding', 'Anniversary'],
    flowerType: ['Lilies', 'Roses'],
    colors: ['White'],
    images: [
      'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day (Order by 12 PM)',
    availability: true,
    isTrending: false,
    isSeasonal: false,
    features: ['Includes tall glass column vase', 'Unopened lily buds for prolonged display', 'Card with silver wax seal']
  },
  {
    id: 'p8',
    title: 'Desert Sun Dried Herbarium',
    description: 'An eco-conscious, gorgeous arrangement of preserved pampas grasses, dried banksia, and eucalyptus pods. Absolutely zero maintenance, lasting indefinitely.',
    price: 3900,
    rating: 4.7,
    reviewsCount: 11,
    floristId: 'f4',
    floristName: 'Great Rift Florals',
    category: 'Dried Flowers',
    occasions: ['Birthday', 'Anniversary', 'Congratulations'],
    flowerType: ['Pampas Grass', 'Eucalyptus'],
    colors: ['Yellow', 'Orange'],
    images: [
      'https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=800&auto=format&fit=crop&q=80'
    ],
    deliveryEstimate: 'Same-day Delivery',
    availability: true,
    isTrending: false,
    isSeasonal: false,
    features: ['100% waterless, everlasting preservation', 'Artisanal terracotta vase included', 'Subtle woody botanical scent']
  }
];

export const MOCK_OCCASIONS: Occasion[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Celebrate their special day with bright, happy arrangements.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80',
    icon: 'Cake'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Elegantly show your enduring love and commitment.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=80',
    icon: 'Heart'
  },
  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Bright arrangements to mark academic triumphs.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80',
    icon: 'GraduationCap'
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Luxurious centerpieces and bridal party coordination.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
    icon: 'Sparkles'
  },
  {
    id: 'mothers-day',
    name: "Mother's Day",
    description: 'Honor her boundless grace with our finest soft-pastel caskets.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&auto=format&fit=crop&q=80',
    icon: 'Smile'
  },
  {
    id: 'valentines',
    name: 'Valentine\'s',
    description: 'The ultimate declaration of romance straight from Naivasha.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=80',
    icon: 'Flame'
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    description: 'Quiet, dignified tribute arrangements to express pure condolence.',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&auto=format&fit=crop&q=80',
    icon: 'Inbox'
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    description: 'Soft, delicate tones to welcome beautiful new beginnings.',
    image: 'https://images.unsplash.com/photo-1444930694458-01babf71870c?w=400&auto=format&fit=crop&q=80',
    icon: 'Baby'
  },
  {
    id: 'congratulations',
    name: 'Congratulations',
    description: 'Vibrant corporate milestones and life victory bouquets.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&auto=format&fit=crop&q=80',
    icon: 'Trophy'
  }
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'roses',
    name: 'Roses',
    description: 'Classic Kenyan roses harvested from Naivasha at dawn.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'lilies',
    name: 'Lilies',
    description: 'Sweet, highly fragrant lilies that bloom spectacularly in your home.',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'orchids',
    name: 'Orchids',
    description: 'Exquisite potted orchids straight from alpine greenhouses.',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'dried-flowers',
    name: 'Dried Flowers',
    description: 'Everlasting floral sculptures that require absolutely no watering.',
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'bouquets',
    name: 'Bouquets',
    description: 'Multi-variety premium visual statements curated by top florists.',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Bespoke grand designs with premium vases and velvet ribboning.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80'
  }
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Crimson Journey: Naivasha to Your Table',
    excerpt: 'Explore how Lake Naivasha became the heart of East Africa’s global rose industry, and how Flora_X empowers local farms to deliver direct to Nairobi.',
    content: `For decades, the volcanic highlands surrounding Lake Naivasha have held a secret: perfect natural conditions for cultivating the world's most robust roses. Sitting at 1,880m above sea level, Naivasha enjoys intense sunlight and cool night breezes that foster rich petal development. 
    
    Traditionally, these premium roses were boxed and flown straight to European auctions. But a shift is happening. Local Kenyans are demanding the same premium quality.
    
    Flora_X provides Naivashas farm-to-table digital bridge. By connecting Rift Valley farmers directly to your home within hours of cutting, we preserve the stem hydration and extend your bouquet's vase life to over 12 glorious days. Read more about our cold-chain process next week!`,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    date: 'July 8, 2026',
    readTime: '4 min read',
    category: 'Behind The Blooms',
    author: 'Silas Kiprop'
  },
  {
    id: 'b2',
    title: '5 Crucial Steps to Extend Your Lily Vase Life',
    excerpt: 'Simple professional tips from our Westlands floral experts on keeping your snowy lilies and callas fresh, aromatic, and blooming for weeks.',
    content: `Lilies are the absolute royalty of home arrangements. They fill spaces with a glorious perfume and present a grand architectural silhouette. However, their delicate pollen stamens and high water demands mean they require specific, careful handling.
    
    First, trim the stems at a 45-degree angle. This prevents them from sitting flat against the bottom of your vase and choking water intake.
    
    Second, pluck off the orange-yellow pollen stamen as soon as a bud opens. This not only prevents permanent orange stains on your rugs and tablecloths but also tricks the flower into living up to 4 days longer, as it postpones the pollination cycle. Read our complete guide to learn more water care tricks.`,
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&auto=format&fit=crop&q=80',
    date: 'June 28, 2026',
    readTime: '3 min read',
    category: 'Floral Care',
    author: 'Clara Wanjiku'
  },
  {
    id: 'b3',
    title: 'Preserving Beauty: The Rise of Everlasting Dried Collections',
    excerpt: 'Why minimalist dried banksias, pampas grasses, and eucalyptus pods are becoming Kenya’s favorite sustainable home styling statement.',
    content: `Sustainability meets high design. In the past, dried flowers were associated with dusty antique corners. Today, they represent the peak of modern, eco-conscious interior design. Combined with natural textures like terracotta and rough-spun linens, dried collections offer a gorgeous, low-carbon alternative to fresh flowers.
    
    Our florists in Eldoret use a natural preservation process. By replacing the floral sap with vegetable glycerin, the cellular structure of eucalyptus, pampas grass, and craspedia is maintained, letting them retain their architectural forms and flexibility for years without a drop of water.`,
    image: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?w=800&auto=format&fit=crop&q=80',
    date: 'May 14, 2026',
    readTime: '5 min read',
    category: 'Design & Styling',
    author: 'Amani Mwangi'
  }
];

export const MOCK_REVIEWS: CustomerReview[] = [
  {
    id: 'r1',
    customerName: 'Clara Wambui',
    rating: 5,
    comment: 'The Imperial Safari Roses arrived in pristine condition within 3 hours. Hand-delivered in Westlands with a beautiful wax-sealed handwritten card. Absolute luxury!',
    date: 'July 10, 2026',
    productName: 'Imperial Safari Rose Bouquet',
    floristName: 'Rift Valley Roses',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'r2',
    customerName: 'David Kiprono',
    rating: 5,
    comment: 'I sent the Nairobi Golden Sunrise lilies to my mother in Kilimani. She was ecstatic! The delivery estimate was spot-on and the packaging was incredibly robust and premium.',
    date: 'July 5, 2026',
    productName: 'Nairobi Golden Sunrise',
    floristName: 'Nairobi Blooms',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'r3',
    customerName: 'Zainab Juma',
    rating: 5,
    comment: 'Incredibly simple checkout process. I used the same-day delivery slots and paid using M-Pesa. It was flawless. The ginger lily is stunning and still looks fresh 8 days later.',
    date: 'June 25, 2026',
    productName: 'Coastal Paradise Ginger Lily',
    floristName: 'Coastal Petals',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
  }
];
