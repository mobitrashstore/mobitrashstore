

export interface SiteVisit {
    id: string; // The date string YYYY-MM-DD
    date: string;
    uniqueVisitors: number;
    totalHits: number;
    devices?: {
        mobile: number;
        desktop: number;
        tablet: number;
        unknown: number;
    };
    pageViews?: {
        [key: string]: number;
    };
    sources?: {
        [key: string]: number;
    };
    // Legacy support
    totalVisits?: number;
}

export interface SystemLog {
    id: string;
    type: 'error' | 'warning';
    message: string;
    stack?: string;
    timestamp: string;
    url: string;
    userAgent?: string;
}

export interface ProductVariant {
    id: string;
    color: string;
    storage: string;
    price: number;
    stock: number;
}

export interface InventoryItem {
    id: string; // often same as sku
    sku: string;
    title: string;
    category: string;
    price: number;
    oldPrice?: number;
    stock: number;
    media: string[];
    specs?: {
        brand?: string;
        model?: string;
        [key: string]: any;
    };
    colors?: string[];
    variants?: ProductVariant[];
    imageColorIndex?: { [index: number]: string };
    description?: string;
    warranty?: string;
    weight_g?: number;
    dimensions?: {
        length: number | string;
        width: number | string;
        height: number | string;
    };
    purchasePrice?: number;
    sellingPrice?: number;
    badge?: {
        text: string;
        color: string;
        position: 'top-left' | 'top-right';
    };
    videoUrl?: string;
    grade?: string;
    soldCount?: number;
    tags?: string[]; // SEO Tags
    homePageSections?: string[]; // Featured sections on Home
    metaTitle?: string;
    metaDescription?: string;
    flashSaleEndTime?: string; // ISO Date for Flash Sale end
    isDraft?: boolean;
    availabilityStatus?: 'In Stock' | 'Out of Stock' | 'Pre-Order' | 'Arriving Soon';
    lowStockThreshold?: number;
    internalNotes?: string;
    isFreeShipping?: boolean;
    mpn?: string; // Manufacturer Part Number
}

export interface CartItem extends InventoryItem {
    quantity: number;
    selectedColor?: string;
}

export interface WishlistItem extends InventoryItem { }

export interface Category {
    id: string;
    name: string;
    imageUrl: string;
}

export interface Brand {
    id: string;
    name: string;
    logo: string;
}

export interface NewsSource {
    id: string;
    name: string;
    url: string;
    feedUrl: string;
    logoUrl: string;
    color?: string; // Hex color for branding
}

export interface OfficialNews {
    id: string;
    title: string;
    excerpt: string;
    content: string; // HTML content
    imageUrl: string;
    date: string;
    author: string;
    isInternal: true;
}

export interface SellModel {
    id: string;
    brand: string;
    name: string;
    imageUrl: string;
    storageOptions?: string[];
    isHidden?: boolean;
}

export interface BlogPost {
    id: string; // slug
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    date: string;
    tags?: string[];
    readingTime?: string;
    category?: string;
    authorAvatar?: string;
    authorRole?: string;
    authorBio?: string;
}

export interface Order {
    id: string;
    customerDetails: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    items: {
        sku: string;
        title: string;
        quantity: number;
        price: number;
        selectedColor?: string | null;
    }[];
    total: number;
    userId?: string;
    paymentMethod: 'Fonepay' | 'Cash on Delivery';
    status: 'Payment Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    date: string;
    trackingCode?: string;
    paymentProofData?: string | null;
    codFee?: number | null;
    discountApplied?: number;
    couponCode?: string | null;
}

export interface TradeIn {
    id: string;
    customerName: string;
    customerEmail: string;
    device: string;
    quote: number;
    status: 'Pending Pickup' | 'Inspecting' | 'Completed' | 'Rejected';
    date: string;
    condition?: DeclaredCondition;
    deviceImages?: string[];
}

export interface DeclaredCondition {
    powers_on: boolean;
    screen_cracks: 'none' | 'hairline' | 'major';
    lcd_damage: 'none' | 'lines' | 'black_spots';
    water_damage: 'none' | 'indicator_tripped';
    battery_health_pct: number;
    face_id_touch_id: 'ok' | 'faulty';
    back_glass: 'ok' | 'cracked';
    buttons: 'ok' | 'faulty';
    camera: 'ok' | 'faulty';
    imei_status: 'clean' | 'blacklisted';
    factory_unlocked_mdms_free: boolean;
    age_months: number;
    minor_scratches: boolean;
}

export interface QuoteInput {
    brand: string;
    model: string;
    ram_gb: number;
    storage_gb: number;
    declared_condition: DeclaredCondition;
}

export interface Deduction {
    reason: string;
    type: string;
    value: number;
    amount: number;
}

export interface QuoteResponse {
    brand: string;
    model: string;
    ram_gb: number;
    storage_gb: number;
    estimate_min: number;
    estimate_max: number;
    currency: string;
    calc: {
        baseline: number;
        calculated_value: number;
        deductions: Deduction[];
        notes: string;
    };
    policy: {
        tolerance_percent: number;
        approval_required_if_below: boolean;
        min_payable: number;
    };
    next: {
        create_tradein: boolean;
        required_fields: string[];
    };
}

export interface QuoteRejection {
    rejection: true;
    reason: string;
    message: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    photoURL?: string | null;
    points: number;
    referralCode?: string;
    claimedRewards?: { [key: string]: boolean };
    createdAt?: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    date: string;
    status: 'New' | 'Read' | 'Archived';
}

export interface StoreStockItem {
    id: string;
    name: string;
    category: string;
    purchasePrice: number;
    sellingPrice: number;
    quantity: number;
    imageUrl?: string;
    shopLocation?: string;
}

export type BannerSection = 'hero' | 'hero_side' | 'home_square' | 'home_mobile_hero_bg' | 'sell_hero' | 'buy_hero' | 'repair_hero' | 'auth_desktop' | 'section1' | 'section2' | 'section3' | 'section4' | 'section5';

export interface Banner {
    id: string;
    imageUrl: string;
    section: BannerSection;
    link?: string;
    title?: string;
    subtitle?: string;
}

export interface GlobalNotification {
    id: string;
    title: string;
    message: string;
    link?: string;
    imageUrl?: string;
    createdAt: string;
    targetEmail?: string | null;
}

export interface Referral {
    id: string;
    referrerId: string;
    referrerName: string;
    referredUserId: string;
    referredUserName: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    points: number;
    date: string;
}

export interface Coupon {
    id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    minOrderAmount: number;
    expiryDate: string;
    isActive: boolean;
    applicableTo?: 'all' | 'category' | 'product';
    targetIds?: string[];
}

export interface Address {
    id: string;
    name: string;
    phone: string;
    fullAddress: string;
    label: string;
    isDefault: boolean;
}

export interface ValuationBaseline {
    id: string;
    brand: string;
    model: string;
    ram_gb: number;
    storage_gb: number;
    baseline_npr: number;
}

export interface ValuationDeduction {
    id: string;
    label: string;
    percentage?: number;
    applePercentage?: number;
    androidPercentage?: number;
}

export interface OfflineSale {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
    date: string;
    category: string;
    shopLocation?: string;
}

export interface DarazConfig {
    enabled: boolean;
    shopUrl: string;
    logoUrl: string;
}

export interface PathaoConfig {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    isEnabled: boolean;
}

export interface PaymentPartner {
    id: string;
    name: string;
    logoUrl: string;
}

export interface SpinSegment {
    id: string;
    label: string;
    color: string;
    probability: number;
    type: 'points' | 'coupon' | 'loss';
    value?: number;
    imageUrl?: string;
}

export interface SpinWheelConfig {
    isEnabled: boolean;
    segments: SpinSegment[];
    rules?: string;
    backgroundImageUrl?: string;
    dailySpinLimit?: number;
    maxSpinsPerDay?: number;
    cooldownSeconds?: number;
}

export interface SpinParticipant {
    id: string; // userId
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    photoURL?: string;
    productBought: string;
    purchasePlan: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    spinsAllocated: number;
    spinsUsed: number;
    createdAt: string;
}

export interface AboutPageConfig {
    leadership: {
        founder: string;
        developedBy: string;
        established: string;
    };
    headquarters: {
        parentCompany: string;
        location: string;
        industry: string;
    };
    story: string;
    contact: {
        phone1: string;
        phone2: string;
        address: string;
        email?: string;
        hours?: string;
    };
}

export interface Testimonial {
    id: string;
    name: string;
    location: string;
    quote: string;
    rating: number;
    imageUrl?: string;
    date: string;
}

export interface RepairBooking {
    id: string;
    customerName: string;
    phone: string;
    deviceModel: string;
    issueType: string;
    description: string;
    appointmentDate: string;
    issueImages?: string[];
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
    createdAt: string;
}

export interface LegalPageContent {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
}

export interface NotebookEntry {
    id: string;
    customerName: string;
    phone: string;
    productName: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    status: 'Paid' | 'Partial' | 'Unpaid';
    date: string;
    dueDate?: string;
    notes?: string;
    shopLocation?: string;
}

export interface ProblemReport {
    id: string;
    type: string;
    description: string;
    screenshotUrl?: string;
    userEmail?: string;
    status: 'New' | 'Reviewed';
    createdAt: string;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    rating: number;
    comment: string;
    date: string;
}

export interface GalleryItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
    createdAt: string;
}

export type NotificationType = 'success' | 'info' | 'error';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface PhoneDetails {
    brand: string;
    model: string;
    ram_gb: number;
    storage_gb: number;
    imageUrl?: string;
    storageOptions?: string[];
}

export interface ProductRequest {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    productName: string;
    description: string;
    budget: number;
    status: 'Pending' | 'Sourcing' | 'Arrived' | 'Cancelled' | 'Completed';
    createdAt: string;
}

export interface RedemptionRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    points: number;
    cashValue: number;
    status: 'Pending' | 'Completed' | 'Rejected';
    date: string;
    paymentDetails?: string;
}





export interface NoticeBanner {
    id: string; // usually 'config'
    text: string;
    link?: string;
    linkText?: string;
    imageUrl?: string;
    isStripActive: boolean;
    isPopupActive: boolean;
    backgroundColor: string;
    textColor: string;
    showCloseButton: boolean;
    popupDelay?: number; // Seconds to wait before showing popup
    autoHideSeconds?: number; // Seconds before auto-hiding
    displayFrequency: 'always' | 'session' | 'hours' | 'days';
    frequencyValue?: number; // Value for hours/days
    targetPage: 'all' | 'home' | 'buy' | 'sell' | 'repair';
    targetDevice: 'all' | 'mobile' | 'desktop';
    showOnExit?: boolean; // Show popup only when user tries to leave
    updatedAt: string;
}





export interface BroadcastLog {
    id: string;
    subject: string;
    content: string;
    recipientCount: number;
    successCount: number;
    failedCount: number;
    createdAt: string;
}