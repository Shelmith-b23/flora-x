export interface Florist {
  id: string;
  name: string;
  logo: string;
  banner: string;
  location: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  deliveryRadiusKm: number;
  minOrderValue: number;
  deliveryFee: number;
  about: string;
  phone: string;
  email: string;
  address: string;
  established: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  floristId: string;
  floristName: string;
  category: string; // e.g. "Roses", "Lilies", "Orchids", "Bouquets"
  occasions: string[]; // e.g. ["Birthday", "Anniversary", "Valentine's"]
  flowerType: string[]; // e.g. ["Roses", "Gypsophila"]
  colors: string[]; // e.g. ["Red", "Pink", "White"]
  images: string[];
  deliveryEstimate: string; // e.g. "Same-day (Order by 1 PM)"
  availability: boolean;
  isTrending: boolean;
  isSeasonal: boolean;
  features: string[];
}

export interface Occasion {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  author: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  productName?: string;
  floristName?: string;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: 'Standard' | 'Deluxe' | 'Grandee';
  deliveryDate?: string;
  deliverySlot?: string;
  cardMessage?: string;
}

export interface FloristProfileData {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  legalBusinessName: string;
  businessRegistrationNumber?: string;
  mpesaTillNumber: string;
  contactPhone?: string;
  contactEmail?: string;
  addressText: string;
  county?: string;
  town?: string;
  latitude: number;
  longitude: number;
  logoUrl: string;
  bannerUrl: string;
  deliveryRadiusKm: number;
  minimumOrderAmount: number;
  deliveryFeeStandard?: number;
  sameDayDeliveryAvailable?: boolean;
  deliveryCutoffTime?: string;
  verificationStatus: 'approved' | 'pending_review' | 'suspended' | 'rejected' | 'inactive';
  businessHours?: Array<{ day: string; open: string; close: string; isClosed: boolean }>;
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  ratingAvg?: number;
  ratingCount?: number;
  created_at?: string;
}

export interface FloristWalletData {
  grossSales: number;
  commissionDeducted: number;
  totalNetEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnToDate: number;
  history: Array<{
    id: string;
    date: string;
    entryType: string;
    description: string;
    grossAmount?: number;
    commissionDeducted?: number;
    amount: number;
  }>;
}

